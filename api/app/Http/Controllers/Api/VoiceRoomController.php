<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\VoiceRoomService;
use App\Models\VoiceRoom;
use App\Http\Resources\VoiceRoomResource;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class VoiceRoomController extends Controller
{
    public function __construct(
        private VoiceRoomService $voiceRoomService
    ) {}

    public function index(Request $request): JsonResponse
    {
        $rooms = $this->voiceRoomService->getPublicRooms(
            $request->input('per_page', 15)
        );

        return response()->json([
            'success' => true,
            'data' => VoiceRoomResource::collection($rooms),
            'meta' => [
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
                'per_page' => $rooms->perPage(),
                'total' => $rooms->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
            'capacity' => 'nullable|integer|min:2|max:500',
        ]);

        try {
            $room = $this->voiceRoomService->createRoom($request->user(), $validated);

            return response()->json([
                'success' => true,
                'message' => 'Voice room created successfully',
                'data' => new VoiceRoomResource($room->load(['host', 'participants'])),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 400);
        }
    }

    public function show(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::with(['host', 'participants.user'])->find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        // Check authorization - must be participant or room must be public
        if (!$room->is_public && !$room->isParticipant($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => new VoiceRoomResource($room),
        ]);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        $validated = $request->validate([
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
            'capacity' => 'nullable|integer|min:2|max:500',
        ]);

        try {
            $room = $this->voiceRoomService->updateRoomSettings($room, $request->user(), $validated);

            return response()->json([
                'success' => true,
                'message' => 'Room settings updated successfully',
                'data' => new VoiceRoomResource($room->load(['host', 'participants'])),
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $room = VoiceRoom::find($id);

        if (!$room) {
            return response()->json([
                'success' => false,
                'message' => 'Room not found',
            ], 404);
        }

        try {
            $this->voiceRoomService->closeRoom($room, $request->user());

            return response()->json([
                'success' => true,
                'message' => 'Room closed successfully',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 403);
        }
    }

    public function history(Request $request): JsonResponse
    {
        $rooms = $this->voiceRoomService->getRoomHistory(
            $request->user(),
            $request->input('per_page', 15)
        );

        return response()->json([
            'success' => true,
            'data' => VoiceRoomResource::collection($rooms),
            'meta' => [
                'current_page' => $rooms->currentPage(),
                'last_page' => $rooms->lastPage(),
                'per_page' => $rooms->perPage(),
                'total' => $rooms->total(),
            ],
        ]);
    }
}
