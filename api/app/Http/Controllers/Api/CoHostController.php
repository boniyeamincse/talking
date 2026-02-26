<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VoiceRoomService;
use App\Models\VoiceRoom;
use App\Models\User;
use App\Http\Resources\ParticipantResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CoHostController extends Controller
{
    public function __construct(
        private VoiceRoomService $voiceRoomService
    ) {}

    public function store(Request $request, int $id, int $userId): JsonResponse
    {
        $room = VoiceRoom::find($id);
        $target = User::find($userId);

        if (!$room || !$target) {
            return response()->json([
                'success' => false,
                'message' => 'Room or user not found',
            ], 404);
        }

        try {
            $participant = $this->voiceRoomService->addCoHost($room, $request->user(), $target);

            return response()->json([
                'success' => true,
                'message' => 'Co-host added successfully',
                'data' => new ParticipantResource($participant->load('user')),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function destroy(Request $request, int $id, int $userId): JsonResponse
    {
        $room = VoiceRoom::find($id);
        $target = User::find($userId);

        if (!$room || !$target) {
            return response()->json([
                'success' => false,
                'message' => 'Room or user not found',
            ], 404);
        }

        try {
            $participant = $this->voiceRoomService->removeCoHost($room, $request->user(), $target);

            return response()->json([
                'success' => true,
                'message' => 'Co-host removed successfully',
                'data' => new ParticipantResource($participant->load('user')),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }
}
