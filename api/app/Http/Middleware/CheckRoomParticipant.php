<?php

namespace App\Http\Middleware;

use App\Models\VoiceRoom;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoomParticipant
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('id') ?? $request->route('room');
        $room = VoiceRoom::find($roomId);
        
        if (!$room || !$room->isParticipant($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 403);
        }
        
        return $next($request);
    }
}
