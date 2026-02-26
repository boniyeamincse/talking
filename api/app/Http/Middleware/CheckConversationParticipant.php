<?php

namespace App\Http\Middleware;

use App\Models\Conversation;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckConversationParticipant
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get conversation ID from route parameters
        $conversationId = $request->route('id') ?? $request->route('conversation') ?? $request->route('conversationId');

        if ($conversationId) {
            $conversation = Conversation::find($conversationId);

            if (!$conversation || !$conversation->isParticipant($request->user())) {
                return response()->json([
                    'success' => false,
                    'message' => 'Unauthorized. You are not a participant in this conversation.',
                ], 403);
            }
        }

        return $next($request);
    }
}
