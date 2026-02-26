<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ConversationResource;
use App\Models\Conversation;
use App\Models\User;
use App\Services\ConversationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class GroupChatController extends BaseController
{
    public function __construct(
        private ConversationService $conversationService
    ) {}

    /**
     * Create a group conversation
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'participant_ids' => 'required|array|min:2',
            'participant_ids.*' => 'exists:users,id',
        ]);

        try {
            $conversation = $this->conversationService->createGroupConversation(
                $request->user(),
                $request->name,
                $request->participant_ids
            );

            return $this->sendResponse(
                new ConversationResource($conversation),
                'Group conversation created successfully',
                201
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }

    /**
     * Add a member to a group conversation
     */
    public function addMember(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
        ]);

        $conversation = Conversation::findOrFail($id);

        // Verify requester is a participant
        if (!$conversation->isParticipant($request->user())) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $userToAdd = User::findOrFail($request->user_id);

        try {
            $this->conversationService->addGroupMember($conversation, $userToAdd);

            return $this->sendResponse(
                new ConversationResource($conversation->load('participants')),
                'Member added successfully'
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }

    /**
     * Remove a member from a group conversation
     */
    public function removeMember(Request $request, int $id, int $userId): JsonResponse
    {
        $conversation = Conversation::findOrFail($id);

        // Verify requester is a participant
        if (!$conversation->isParticipant($request->user())) {
            return $this->sendError('Unauthorized', [], 403);
        }

        $userToRemove = User::findOrFail($userId);

        try {
            $this->conversationService->removeGroupMember($conversation, $userToRemove);

            return $this->sendResponse(
                new ConversationResource($conversation->load('participants')),
                'Member removed successfully'
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }
}
