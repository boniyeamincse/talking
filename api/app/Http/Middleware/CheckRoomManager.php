<?php

namespace App\Http\Middleware;

use App\Models\VoiceRoom;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoomManager
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('id') ?? $request->route('room');
        $room = VoiceRoom::find($roomId);
        
        if (!$room || !$room->canManageSpeakers($request->user())) {
            return response()->json([
                'success' => false,
                'message' => 'Only host or co-hosts can perform this action'
            ], 403);
        }
        
        return $next($request);
    }
}
