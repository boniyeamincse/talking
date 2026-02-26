<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Services\MessageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class MediaMessageController extends BaseController
{
    public function __construct(
        private MessageService $messageService
    ) {}

    /**
     * Upload and send a media message
     */
    public function store(Request $request, int $conversationId): JsonResponse
    {
        $request->validate([
            'file' => 'required|file',
            'caption' => 'nullable|string|max:1000',
        ]);

        $conversation = Conversation::findOrFail($conversationId);

        try {
            $message = $this->messageService->sendMediaMessage(
                $conversation,
                $request->user(),
                $request->file('file'),
                $request->caption
            );

            return $this->sendResponse(
                new MessageResource($message),
                'Media message sent successfully',
                201
            );
        } catch (ValidationException $e) {
            return $this->sendError('Validation error', $e->errors(), 422);
        }
    }
}
