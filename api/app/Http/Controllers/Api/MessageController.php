<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Message;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MessageController extends BaseController
{
    public function __construct(
        private MessageService $messageService
    ) {}

    /**
     * Get messages for a conversation (paginated)
     */
    public function index(Request $request, int $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is a participant
        if (!$conversation->isParticipant($request->user())) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $messages = $this->messageService->getMessages(
            $conversation,
            $request->input('per_page', 50)
        );

        return $this->sendResponse(
            MessageResource::collection($messages)->response()->getData(true),
            'Messages retrieved successfully'
        );
    }

    /**
     * Send a text message
     */
    public function store(Request $request, int $conversationId): JsonResponse
    {
        $request->validate([
            'content' => 'required|string',
            'parent_message_id' => 'nullable|exists:messages,id',
        ]);

        $conversation = Conversation::findOrFail($conversationId);

        try {
            $message = $this->messageService->sendMessage(
                $conversation,
                $request->user(),
                $request->content,
                $request->parent_message_id
            );

            return $this->sendResponse(
                new MessageResource($message),
                'Message sent successfully',
                201
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }

    /**
     * Delete a message
     */
    public function destroy(Request $request, int $id): JsonResponse
    {
        $message = Message::findOrFail($id);

        try {
            $this->messageService->deleteMessage($message, $request->user());

            return $this->sendResponse(
                null,
                'Message deleted successfully'
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }

    /**
     * Mark conversation as read
     */
    public function markAsRead(Request $request, int $conversationId): JsonResponse
    {
        $conversation = Conversation::findOrFail($conversationId);

        // Verify user is a participant
        if (!$conversation->isParticipant($request->user())) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $count = $this->messageService->markConversationAsRead(
            $conversation,
            $request->user()
        );

        return $this->sendResponse(
            ['messages_marked_read' => $count],
            'Conversation marked as read'
        );
    }
}
