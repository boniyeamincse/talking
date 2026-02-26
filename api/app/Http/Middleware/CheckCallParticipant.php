<?php

namespace App\Http\Middleware;

use App\Models\Call;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckCallParticipant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $callId = $request->route('id');
        $call = Call::find($callId);

        if (!$call) {
            return response()->json([
                'success' => false,
                'message' => 'Call not found'
            ], 404);
        }

        if (!$call->involvesUser($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }

        // Add call to request for controller use
        $request->merge(['call' => $call]);

        return $next($request);
    }
}
