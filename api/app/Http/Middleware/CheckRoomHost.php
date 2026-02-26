<?php

namespace App\Http\Middleware;

use App\Models\VoiceRoom;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRoomHost
{
    public function handle(Request $request, Closure $next): Response
    {
        $roomId = $request->route('id') ?? $request->route('room');
        $room = VoiceRoom::find($roomId);
        
        if (!$room || $room->host_id !== $request->user()->id) {
            return response()->json([
                'success' => false,
                'message' => 'Only the host can perform this action'
            ], 403);
        }
        
        return $next($request);
    }
}
