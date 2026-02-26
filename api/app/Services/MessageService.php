<?php

namespace App\Services;

use App\Events\MessageDeleted;
use App\Events\MessageReactionAdded;
use App\Events\MessageReactionRemoved;
use App\Events\MessageSent;
use App\Events\MessageStatusUpdated;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageMedia;
use App\Models\MessageReaction;
use App\Models\User;
use Illuminate\Contracts\Pagination\CursorPaginator;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class MessageService
{
    public function __construct(
        private MediaService $mediaService
    ) {}

    /**
     * Send a text message
     *
     * @param Conversation $conversation
     * @param User $sender
     * @param string $content
     * @param int|null $parentMessageId
     * @return Message
     * @throws ValidationException
     */
    public function sendMessage(
        Conversation $conversation,
        User $sender,
        string $content,
        ?int $parentMessageId = null
    ): Message {
        // Validate sender is a participant
        if (!$conversation->isParticipant($sender)) {
            throw ValidationException::withMessages([
                'conversation' => ['You are not a participant in this conversation.']
            ]);
        }

        // Validate content is not empty
        if (trim($content) === '') {
            throw ValidationException::withMessages([
                'content' => ['Message content cannot be empty.']
            ]);
        }

        // Validate parent message if provided
        if ($parentMessageId) {
            $parentMessage = Message::find($parentMessageId);
            
            if (!$parentMessage || $parentMessage->conversation_id !== $conversation->id) {
                throw ValidationException::withMessages([
                    'parent_message_id' => ['Parent message must exist in the same conversation.']
                ]);
            }
        }

        return DB::transaction(function () use ($conversation, $sender, $content, $parentMessageId) {
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $sender->id,
                'parent_message_id' => $parentMessageId,
                'content' => $content,
                'type' => 'text',
                'status' => 'sent',
            ]);

            // Update conversation timestamp
            $conversation->touch();

            // Load relationships
            $message->load(['user', 'parentMessage', 'reactions']);

            // Broadcast event
            broadcast(new MessageSent($message))->toOthers();

            return $message;
        });
    }

    /**
     * Send a media message
     *
     * @param Conversation $conversation
     * @param User $sender
     * @param UploadedFile $file
     * @param string|null $caption
     * @return Message
     * @throws ValidationException
     */
    public function sendMediaMessage(
        Conversation $conversation,
        User $sender,
        UploadedFile $file,
        ?string $caption = null
    ): Message {
        // Validate sender is a participant
        if (!$conversation->isParticipant($sender)) {
            throw ValidationException::withMessages([
                'conversation' => ['You are not a participant in this conversation.']
            ]);
        }

        // Validate media file
        $mediaInfo = $this->mediaService->validateMediaFile($file);

        return DB::transaction(function () use ($conversation, $sender, $file, $caption, $mediaInfo) {
            // Store the file
            $filePath = $this->mediaService->storeMediaFile($file, $mediaInfo['type']);

            // Create message
            $message = Message::create([
                'conversation_id' => $conversation->id,
                'user_id' => $sender->id,
                'content' => $caption,
                'type' => 'media',
                'status' => 'sent',
            ]);

            // Create media record
            MessageMedia::create([
                'message_id' => $message->id,
                'file_path' => $filePath,
                'file_type' => $mediaInfo['type'],
                'file_size' => $mediaInfo['size'],
                'mime_type' => $mediaInfo['mime'],
            ]);

            // Update conversation timestamp
            $conversation->touch();

            // Load relationships
            $message->load(['user', 'media', 'reactions']);

            // Broadcast event
            broadcast(new MessageSent($message))->toOthers();

            return $message;
        });
    }

    /**
     * Delete a message
     *
     * @param Message $message
     * @param User $user
     * @return void
     * @throws ValidationException
     */
    public function deleteMessage(Message $message, User $user): void
    {
        if (!$message->isOwnedBy($user)) {
            throw ValidationException::withMessages([
                'message' => ['You can only delete your own messages.']
            ]);
        }

        $conversationId = $message->conversation_id;
        $messageId = $message->id;

        // Soft delete the message
        $message->delete();

        // Broadcast event
        broadcast(new MessageDeleted($messageId, $conversationId))->toOthers();
    }

    /**
     * Mark conversation as read for a user
     *
     * @param Conversation $conversation
     * @param User $user
     * @return int Number of messages marked as seen
     */
    public function markConversationAsRead(Conversation $conversation, User $user): int
    {
        return DB::transaction(function () use ($conversation, $user) {
            // Update last_read_at timestamp
            $conversation->participants()
                ->updateExistingPivot($user->id, [
                    'last_read_at' => now()
                ]);

            // Update unread messages to 'seen' status
            $count = $conversation->messages()
                ->where('user_id', '!=', $user->id)
                ->whereIn('status', ['sent', 'delivered'])
                ->update(['status' => 'seen']);

            // Broadcast status update for each message
            if ($count > 0) {
                $conversation->messages()
                    ->where('user_id', '!=', $user->id)
                    ->where('status', 'seen')
                    ->each(function ($message) use ($conversation) {
                        broadcast(new MessageStatusUpdated(
                            $message->id,
                            $conversation->id,
                            'seen'
                        ))->toOthers();
                    });
            }

            return $count;
        });
    }

    /**
     * Get messages for a conversation with cursor pagination
     *
     * @param Conversation $conversation
     * @param int $perPage
     * @param string|null $cursor
     * @return CursorPaginator
     */
    public function getMessages(Conversation $conversation, int $perPage = 50, ?string $cursor = null): CursorPaginator
    {
        return Message::where('conversation_id', $conversation->id)
            ->with(['user', 'media', 'reactions.user', 'parentMessage.user'])
            ->orderByDesc('created_at')
            ->cursorPaginate($perPage);
    }

    /**
     * Add a reaction to a message
     *
     * @param Message $message
     * @param User $user
     * @param string $emoji
     * @return MessageReaction
     * @throws ValidationException
     */
    public function addReaction(Message $message, User $user, string $emoji): MessageReaction
    {
        // Validate user is a participant in the conversation
        if (!$message->conversation->isParticipant($user)) {
            throw ValidationException::withMessages([
                'message' => ['You must be a participant to react to messages.']
            ]);
        }

        // Use updateOrCreate for idempotent behavior (duplicate reactions)
        $reaction = MessageReaction::updateOrCreate(
            [
                'message_id' => $message->id,
                'user_id' => $user->id,
                'emoji' => $emoji,
            ],
            [
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        // Load relationships
        $reaction->load(['user', 'message']);

        // Broadcast event
        broadcast(new MessageReactionAdded($reaction))->toOthers();

        return $reaction;
    }

    /**
     * Remove a reaction from a message
     *
     * @param Message $message
     * @param User $user
     * @param string $emoji
     * @return bool
     */
    public function removeReaction(Message $message, User $user, string $emoji): bool
    {
        $deleted = MessageReaction::where('message_id', $message->id)
            ->where('user_id', $user->id)
            ->where('emoji', $emoji)
            ->delete() > 0;

        if ($deleted) {
            // Broadcast event
            broadcast(new MessageReactionRemoved(
                $message->id,
                $message->conversation_id,
                $user->id,
                $emoji
            ))->toOthers();
        }

        return $deleted;
    }
}
