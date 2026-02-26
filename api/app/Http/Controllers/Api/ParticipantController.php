<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VoiceRoomService;
use App\Models\VoiceRoom;
use App\Models\User;
use App\Http\Resources\ParticipantResource;
use App\Http\Resources\VoiceRoomResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class ParticipantController extends Controller
{
    public function __construct(
        private VoiceRoomService $voiceRoomService
    ) {}

    public function join(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::with(['host', 'participants.user'])->find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        try {
            $participant = $this->voiceRoomService->joinRoom($room, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Joined room successfully',
                'data' => [
                    'room' => new VoiceRoomResource($room->fresh(['host', 'participants.user'])),
                    'participant' => new ParticipantResource($participant),
                ],
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function leave(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        try {
            $this->voiceRoomService->leaveRoom($room, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Left room successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function requestToSpeak(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        try {
            $speakerRequest = $this->voiceRoomService->requestToSpeak($room, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Speaker request sent successfully',
                'data' => $speakerRequest,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function promoteToSpeaker(Request $request, int $id, int $userId): JsonResponse
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
            $participant = $this->voiceRoomService->promoteToSpeaker($room, $request->user(), $target);

            return response()->json([
                'success' => true,
                'message' => 'User promoted to speaker successfully',
                'data' => new ParticipantResource($participant->load('user')),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function demoteSpeaker(Request $request, int $id, int $userId): JsonResponse
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
            $participant = $this->voiceRoomService->demoteToAudience($room, $request->user(), $target);

            return response()->json([
                'success' => true,
                'message' => 'Speaker demoted successfully',
                'data' => new ParticipantResource($participant->load('user')),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function kick(Request $request, int $id, int $userId): JsonResponse
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
            $this->voiceRoomService->kickParticipant($room, $request->user(), $target);

            return response()->json([
                'success' => true,
                'message' => 'Participant kicked successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }
}
