<?php

namespace App\Http\Controllers\Api;

use App\Events\UserTyping;
use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class ChatController extends BaseController
{
    public function __construct(
        private ConversationService $conversationService
    ) {}

    /**
     * List all conversations for the authenticated user
     */
    public function index(Request $request): JsonResponse
    {
        $conversations = $this->conversationService->getConversationsForUser(
            $request->user(),
            $request->input('per_page', 15)
        );

        return $this->sendResponse(
            ConversationResource::collection($conversations)->response()->getData(true),
            'Conversations retrieved successfully'
        );
    }

    /**
     * Create a direct conversation
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $otherUser = User::findOrFail($request->user_id);

        // Prevent creating conversation with self
        if ($otherUser->id === $request->user()->id) {
            return $this->sendError('Cannot create conversation with yourself', [], 422);
        }

        try {
            $conversation = $this->conversationService->findOrCreateDirectConversation(
                $request->user(),
                $otherUser
            );

            return $this->sendResponse(
                new ConversationResource($conversation),
                'Conversation created successfully',
                201
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }

    /**
     * Get conversation details
     */
    public function show(Request $request, int $id): JsonResponse
    {
        $conversation = Conversation::with(['participants', 'latestMessage.user'])
            ->findOrFail($id);

        // Verify user is a participant
        if (!$conversation->isParticipant($request->user())) {
            return $this->sendError('Unauthorized', [], 403);
        }

        return $this->sendResponse(
            new ConversationResource($conversation),
            'Conversation retrieved successfully'
        );
    }

    /**
     * Send typing indicator
     */
    public function typing(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'is_typing' => 'required|boolean',
        ]);

        $conversation = Conversation::findOrFail($id);

        // Verify user is a participant
        if (!$conversation->isParticipant($request->user())) {
            return $this->sendError('Unauthorized', [], 403);
        }

        // Broadcast typing event
        broadcast(new UserTyping(
            $conversation->id,
            $request->user(),
            $request->is_typing
        ))->toOthers();

        return $this->sendResponse(
            null,
            'Typing indicator sent'
        );
    }
}
