<?php

namespace App\Http\Controllers\Api;

use App\Events\CallAnswered;
use App\Events\CallDeclined;
use App\Events\CallEnded;
use App\Events\CallInitiated;
use App\Events\ICECandidateReceived;
use App\Http\Resources\CallResource;
use App\Models\Call;
use App\Models\User;
use App\Services\CallService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CallController extends BaseController
{
    protected CallService $callService;

    public function __construct(CallService $callService)
    {
        $this->middleware('auth:sanctum');
        $this->callService = $callService;
    }

    /**
     * Initiate an audio call
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
                'audio',
                $request->sdp_offer
            );

            // Mark as ringing and broadcast to callee
            $call->markAsRinging();
            broadcast(new CallInitiated($call->load(['caller', 'callee']), $request->sdp_offer));

            return $this->sendResponse(
                new CallResource($call->load(['caller', 'callee'])),
                'Call initiated successfully',
                201
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Answer an incoming call
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
                'Call answered successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Decline an incoming call
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
                'Call declined successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * End an active call
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
                'Call ended successfully'
            );
        } catch (\Exception $e) {
            return $this->sendError($e->getMessage(), [], 422);
        }
    }

    /**
     * Exchange ICE candidate
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
     * Get call history
     */
    public function history(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 15);
        
        $calls = $this->callService->getCallHistory($request->user(), 'audio', $perPage);

        return $this->sendResponse(
            CallResource::collection($calls)->response()->getData(true),
            'Call history retrieved successfully'
        );
    }

    /**
     * Get STUN/TURN configuration
     */
    public function config(Request $request): JsonResponse
    {
        $config = $this->callService->getStunTurnConfig();

        return $this->sendResponse($config, 'Configuration retrieved successfully');
    }
}
