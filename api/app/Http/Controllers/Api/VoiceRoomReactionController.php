<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VoiceRoomService;
use App\Models\VoiceRoom;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VoiceRoomReactionController extends Controller
{
    public function __construct(
        private VoiceRoomService $voiceRoomService
    ) {}

    public function store(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        $validated = $request->validate([
            'emoji' => 'required|string|max:10',
        ]);

        try {
            $this->voiceRoomService->sendReaction($room, $request->user(), $validated['emoji']);

            return response()->json([
                'success' => true,
                'message' => 'Reaction sent successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }
}
