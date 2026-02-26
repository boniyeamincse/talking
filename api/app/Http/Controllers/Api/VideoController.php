<?php

namespace App\Http\Controllers\Api;

use App\Events\CallAnswered;
use App\Events\CallDeclined;
use App\Events\CallEnded;
use App\Events\CallInitiated;
use App\Events\ICECandidateReceived;
use App\Events\VideoToggled;
use App\Http\Resources\CallResource;
use App\Models\Call;
use App\Models\User;
use App\Services\CallService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class VideoController extends BaseController
{
    protected CallService $callService;

    public function __construct(CallService $callService)
    {
        $this->middleware('auth:sanctum');
        $this->callService = $callService;
    }

    /**
     * Initiate a video call
     */
    public function initiate(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'callee_id' => 'required|integer|exists:users,id',
            'sdp_offer' => 'required|array',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 400);
        }

        try {
            $callee = User::findOrFail($request->callee_id);
            $call = $this->callService->initiateCall(
                $request->user(),
                $callee,
                'video',
                $request->sdp_offer
            );

            // Mark as ringing and broadcast to callee
            $call->markAsRinging();
            broadcast(new CallInitiated($call->load(['caller', 'callee']), $request->sdp_offer));

            return $this->sendResponse(
                new CallResource($call->load(['caller', 'callee'])),
                'Video call initiated successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Answer a video call
     */
    public function answer(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'sdp_answer' => 'required|array',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 400);
        }

        try {
            $call = Call::findOrFail($id);
            
            if (!$call->involvesUser($request->user())) {
                return $this->sendError('Unauthorized', [], 403);
            }

            $call = $this->callService->answerCall($call, $request->user(), $request->sdp_answer);

            // Broadcast to caller
            broadcast(new CallAnswered($call, $request->sdp_answer));

            return $this->sendResponse(
                new CallResource($call->load(['caller', 'callee'])),
                'Video call answered successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Decline a video call
     */
    public function decline(Request $request, int $id): JsonResponse
    {
        try {
            $call = Call::findOrFail($id);
            
            if (!$call->involvesUser($request->user())) {
                return $this->sendError('Unauthorized', [], 403);
            }

            $call = $this->callService->declineCall($call, $request->user());

            // Broadcast to caller
            broadcast(new CallDeclined($call));

            return $this->sendResponse(
                ['call_id' => $call->id],
                'Video call declined successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * End a video call
     */
    public function end(Request $request, int $id): JsonResponse
    {
        try {
            $call = Call::findOrFail($id);
            
            if (!$call->involvesUser($request->user())) {
                return $this->sendError('Unauthorized', [], 403);
            }

            $call = $this->callService->endCall($call, $request->user());

            // Broadcast to both participants
            broadcast(new CallEnded($call));

            return $this->sendResponse(
                new CallResource($call->load(['caller', 'callee'])),
                'Video call ended successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Exchange ICE candidate for video call
     */
    public function iceCandidate(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'candidate' => 'required|array',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 400);
        }

        try {
            $call = Call::findOrFail($id);
            
            if (!$call->involvesUser($request->user())) {
                return $this->sendError('Unauthorized', [], 403);
            }

            $this->callService->exchangeIceCandidate($call, $request->user(), $request->candidate);

            // Determine the other participant
            $otherUser = $call->otherParticipant($request->user());

            // Broadcast to other participant
            broadcast(new ICECandidateReceived(
                $call->id,
                $request->user()->id,
                $otherUser->id,
                $request->candidate
            ));

            return $this->sendResponse(
                ['success' => true],
                'ICE candidate exchanged successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Toggle video on/off
     */
    public function toggleVideo(Request $request, int $id): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'enabled' => 'required|boolean',
        ]);

        if ($validator->fails()) {
            return $this->sendError('Validation Error', $validator->errors(), 400);
        }

        try {
            $call = Call::findOrFail($id);
            
            if (!$call->involvesUser($request->user())) {
                return $this->sendError('Unauthorized', [], 403);
            }

            $this->callService->toggleVideo($call, $request->user(), $request->enabled);

            // Determine the other participant
            $otherUser = $call->otherParticipant($request->user());

            // Broadcast to other participant
            broadcast(new VideoToggled(
                $call->id,
                $request->user()->id,
                $otherUser->id,
                $request->enabled
            ));

            return $this->sendResponse(
                ['success' => true, 'video_enabled' => $request->enabled],
                'Video toggled successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Get video call history
     */
    public function history(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $calls = $this->callService->getCallHistory($request->user(), 'video', $perPage);

        return $this->sendResponse(
            CallResource::collection($calls)->response()->getData(true),
            'Video call history retrieved successfully'
        );
    }
}
