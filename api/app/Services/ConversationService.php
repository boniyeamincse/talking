<?php

namespace App\Services;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ConversationService
{
    /**
     * Find or create a direct conversation between two users
     *
     * @param User $user1
     * @param User $user2
     * @return Conversation
     * @throws ValidationException
     */
    public function findOrCreateDirectConversation(User $user1, User $user2): Conversation
    {
        // Check for block relationships
        if ($user1->hasBlockedOrIsBlockedBy($user2)) {
            throw ValidationException::withMessages([
                'user_id' => ['Cannot create conversation with this user.']
            ]);
        }

        // Try to find existing direct conversation between these two users
        $conversation = Conversation::direct()
            ->whereHas('participants', function ($query) use ($user1) {
                $query->where('user_id', $user1->id);
            })
            ->whereHas('participants', function ($query) use ($user2) {
                $query->where('user_id', $user2->id);
            })
            ->first();

        // If conversation exists, return it
        if ($conversation) {
            return $conversation;
        }

        // Create new direct conversation
        return $this->createDirectConversation($user1, $user2);
    }

    /**
     * Create a new direct conversation
     *
     * @param User $user1
     * @param User $user2
     * @return Conversation
     */
    public function createDirectConversation(User $user1, User $user2): Conversation
    {
        return DB::transaction(function () use ($user1, $user2) {
            $conversation = Conversation::create([
                'type' => 'direct',
                'created_by' => $user1->id,
            ]);

            // Add both users as participants
            $conversation->participants()->attach([
                $user1->id => ['joined_at' => now()],
                $user2->id => ['joined_at' => now()],
            ]);

            return $conversation->load('participants');
        });
    }

    /**
     * Create a new group conversation
     *
     * @param User $creator
     * @param string $name
     * @param array $participantIds
     * @return Conversation
     * @throws ValidationException
     */
    public function createGroupConversation(User $creator, string $name, array $participantIds): Conversation
    {
        // Validate group size (minimum 3, maximum 50 including creator)
        $totalParticipants = count($participantIds) + 1; // +1 for creator
        
        if ($totalParticipants < 3) {
            throw ValidationException::withMessages([
                'participants' => ['Group conversations must have at least 3 participants.']
            ]);
        }
        
        if ($totalParticipants > 50) {
            throw ValidationException::withMessages([
                'participants' => ['Group conversations cannot have more than 50 participants.']
            ]);
        }

        return DB::transaction(function () use ($creator, $name, $participantIds) {
            $conversation = Conversation::create([
                'type' => 'group',
                'name' => $name,
                'created_by' => $creator->id,
            ]);

            // Add creator as first participant
            $participants = [$creator->id => ['joined_at' => now()]];

            // Add other participants
            foreach ($participantIds as $userId) {
                if ($userId != $creator->id) {
                    $participants[$userId] = ['joined_at' => now()];
                }
            }

            $conversation->participants()->attach($participants);

            return $conversation->load('participants');
        });
    }

    /**
     * Add a member to a group conversation
     *
     * @param Conversation $conversation
     * @param User $user
     * @return void
     * @throws ValidationException
     */
    public function addGroupMember(Conversation $conversation, User $user): void
    {
        if ($conversation->type !== 'group') {
            throw ValidationException::withMessages([
                'conversation' => ['Can only add members to group conversations.']
            ]);
        }

        // Check if user is already a participant
        if ($conversation->isParticipant($user)) {
            throw ValidationException::withMessages([
                'user_id' => ['User is already a participant in this conversation.']
            ]);
        }

        // Check for block relationships with any existing participant
        foreach ($conversation->participants as $participant) {
            if ($participant->hasBlockedOrIsBlockedBy($user)) {
                throw ValidationException::withMessages([
                    'user_id' => ['Cannot add this user to the conversation.']
                ]);
            }
        }

        // Check group size limit
        if ($conversation->participants()->count() >= 50) {
            throw ValidationException::withMessages([
                'participants' => ['Group has reached maximum size of 50 participants.']
            ]);
        }

        $conversation->participants()->attach($user->id, ['joined_at' => now()]);
    }

    /**
     * Remove a member from a group conversation
     *
     * @param Conversation $conversation
     * @param User $user
     * @return void
     * @throws ValidationException
     */
    public function removeGroupMember(Conversation $conversation, User $user): void
    {
        if ($conversation->type !== 'group') {
            throw ValidationException::withMessages([
                'conversation' => ['Can only remove members from group conversations.']
            ]);
        }

        if (!$conversation->isParticipant($user)) {
            throw ValidationException::withMessages([
                'user_id' => ['User is not a participant in this conversation.']
            ]);
        }

        $conversation->participants()->detach($user->id);
    }

    /**
     * Get conversations for a user, ordered by most recent activity
     *
     * @param User $user
     * @param int $perPage
     * @return LengthAwarePaginator
     */
    public function getConversationsForUser(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return Conversation::forUser($user)
            ->with(['participants', 'latestMessage.user'])
            ->withCount('messages')
            ->orderByDesc(function ($query) {
                $query->select('created_at')
                    ->from('messages')
                    ->whereColumn('messages.conversation_id', 'conversations.id')
                    ->latest()
                    ->limit(1);
            })
            ->orderByDesc('updated_at')
            ->paginate($perPage);
    }
}
