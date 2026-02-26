<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\User;

class CheckBlockedUsers
{
    /**
     * Handle an incoming request.
     *
     * Prevents interactions between blocked users.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Only check for authenticated users
        if (!$request->user()) {
            return $next($request);
        }

        $authUser = $request->user();
        
        // Get target user ID from route parameter or request body
        $targetUserId = $request->route('id') 
            ?? $request->route('user') 
            ?? $request->input('user_id');
        
        if ($targetUserId) {
            // Check if target user exists
            $targetUser = User::find($targetUserId);
            
            if ($targetUser && $authUser->hasBlockedOrIsBlockedBy($targetUser)) {
                return response()->json([
                    'success' => false,
                    'message' => 'This action cannot be performed',
                    'errors' => null
                ], 403);
            }
        }

        return $next($request);
    }
}
