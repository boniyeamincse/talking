<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\GroupChatController;
use App\Http\Controllers\Api\MediaMessageController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\SocialController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

Route::prefix('v1')->group(function () {
    
    // Public routes
    Route::prefix('auth')->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
        Route::get('verify-email/{id}/{hash}', [AuthController::class, 'verifyEmail'])
            ->name('verification.verify');
    });

    // Protected routes
    Route::middleware('auth:sanctum')->group(function () {
        
        // Auth routes
        Route::prefix('auth')->group(function () {
            Route::post('logout', [AuthController::class, 'logout']);
            Route::post('refresh', [AuthController::class, 'refresh']);
            Route::post('resend-verification', [AuthController::class, 'resendVerification']);
        });

        // User routes
        Route::prefix('users')->group(function () {
            Route::get('me', [UserController::class, 'me']);
            Route::put('me', [UserController::class, 'update']);
            Route::get('search', [UserController::class, 'search']);
            Route::get('popular-searches', [UserController::class, 'popularSearches']);
            Route::get('{id}', [UserController::class, 'show']);
            
            // Social actions
            Route::post('{id}/follow', [SocialController::class, 'follow']);
            Route::delete('{id}/follow', [SocialController::class, 'unfollow']);
            Route::get('{id}/followers', [SocialController::class, 'followers']);
            Route::get('{id}/following', [SocialController::class, 'following']);
            
            Route::post('{id}/block', [SocialController::class, 'block']);
            Route::delete('{id}/block', [SocialController::class, 'unblock']);
            Route::get('blocked', [SocialController::class, 'blockedUsers']);
        });

        // Profile routes
        Route::prefix('profiles')->group(function () {
            Route::get('me', [ProfileController::class, 'me']);
            Route::put('me', [ProfileController::class, 'update']);
            Route::post('me/photo', [ProfileController::class, 'uploadPhoto']);
            Route::put('me/languages', [ProfileController::class, 'updateLanguages']);
            Route::get('{id}', [ProfileController::class, 'show']);
        });

        // Chat routes
        Route::prefix('chat')->group(function () {
            // Conversation management
            Route::get('conversations', [ChatController::class, 'index']);
            Route::post('conversations', [ChatController::class, 'store'])
                ->middleware('check.blocked');
            Route::get('conversations/{id}', [ChatController::class, 'show']);
            Route::post('conversations/{id}/typing', [ChatController::class, 'typing']);
            
            // Group chat management
            Route::post('groups', [GroupChatController::class, 'store']);
            Route::post('groups/{id}/members', [GroupChatController::class, 'addMember'])
                ->middleware('check.blocked');
            Route::delete('groups/{id}/members/{userId}', [GroupChatController::class, 'removeMember']);
            
            // Messages
            Route::get('conversations/{conversationId}/messages', [MessageController::class, 'index']);
            Route::post('conversations/{conversationId}/messages', [MessageController::class, 'store']);
            Route::post('conversations/{conversationId}/media', [MediaMessageController::class, 'store']);
            Route::delete('messages/{id}', [MessageController::class, 'destroy']);
            Route::post('conversations/{conversationId}/read', [MessageController::class, 'markAsRead']);
            
            // Reactions
            Route::post('messages/{messageId}/reactions', [ReactionController::class, 'store']);
            Route::delete('messages/{messageId}/reactions/{emoji}', [ReactionController::class, 'destroy']);
        });
    });
});

// Audio Call routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('calls')->group(function () {
        Route::post('initiate', [CallController::class, 'initiate']);
        Route::post('{id}/answer', [CallController::class, 'answer']);
        Route::post('{id}/decline', [CallController::class, 'decline']);
        Route::post('{id}/end', [CallController::class, 'end']);
        Route::post('{id}/ice-candidate', [CallController::class, 'iceCandidate']);
        Route::get('history', [CallController::class, 'history']);
        Route::get('config', [CallController::class, 'config']);
    });

    // Video Call routes
    Route::prefix('video')->group(function () {
        Route::post('initiate', [VideoController::class, 'initiate']);
        Route::post('{id}/answer', [VideoController::class, 'answer']);
        Route::post('{id}/decline', [VideoController::class, 'decline']);
        Route::post('{id}/end', [VideoController::class, 'end']);
        Route::post('{id}/ice-candidate', [VideoController::class, 'iceCandidate']);
        Route::post('{id}/toggle-video', [VideoController::class, 'toggleVideo']);
        Route::get('history', [VideoController::class, 'history']);
    });
});

// Voice Room routes
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('rooms')->group(function () {
        // Room management
        Route::get('/', [App\Http\Controllers\Api\VoiceRoomController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\VoiceRoomController::class, 'store']);
        Route::get('history', [App\Http\Controllers\Api\VoiceRoomController::class, 'history']);
        Route::get('{id}', [App\Http\Controllers\Api\VoiceRoomController::class, 'show']);
        Route::put('{id}', [App\Http\Controllers\Api\VoiceRoomController::class, 'update']);
        Route::delete('{id}', [App\Http\Controllers\Api\VoiceRoomController::class, 'destroy']);
        
        // Participant management
        Route::post('{id}/join', [App\Http\Controllers\Api\ParticipantController::class, 'join'])
            ->middleware('check.blocked');
        Route::post('{id}/leave', [App\Http\Controllers\Api\ParticipantController::class, 'leave']);
        Route::post('{id}/speak', [App\Http\Controllers\Api\ParticipantController::class, 'requestToSpeak']);
        Route::post('{id}/speakers/{userId}', [App\Http\Controllers\Api\ParticipantController::class, 'promoteToSpeaker']);
        Route::delete('{id}/speakers/{userId}', [App\Http\Controllers\Api\ParticipantController::class, 'demoteSpeaker']);
        Route::post('{id}/kick/{userId}', [App\Http\Controllers\Api\ParticipantController::class, 'kick']);
        
        // Co-host management
        Route::post('{id}/cohosts/{userId}', [App\Http\Controllers\Api\CoHostController::class, 'store']);
        Route::delete('{id}/cohosts/{userId}', [App\Http\Controllers\Api\CoHostController::class, 'destroy']);
        
        // Reactions
        Route::post('{id}/reactions', [App\Http\Controllers\Api\VoiceRoomReactionController::class, 'store']);
    });
});

// Social Feed routes (Phase 6)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('posts')->group(function () {
        // Post management
        Route::get('/', [App\Http\Controllers\Api\PostController::class, 'index']);
        Route::post('/', [App\Http\Controllers\Api\PostController::class, 'store']);
        Route::get('saved', [App\Http\Controllers\Api\SavedPostController::class, 'index']);
        Route::get('{id}', [App\Http\Controllers\Api\PostController::class, 'show']);
        Route::put('{id}', [App\Http\Controllers\Api\PostController::class, 'update']);
        Route::delete('{id}', [App\Http\Controllers\Api\PostController::class, 'destroy']);
        Route::post('{id}/media', [App\Http\Controllers\Api\PostController::class, 'uploadMedia']);
        
        // Like management
        Route::post('{id}/like', [App\Http\Controllers\Api\LikeController::class, 'store']);
        Route::delete('{id}/like', [App\Http\Controllers\Api\LikeController::class, 'destroy']);
        Route::get('{id}/likes', [App\Http\Controllers\Api\LikeController::class, 'index']);
        
        // Save management
        Route::post('{id}/save', [App\Http\Controllers\Api\SavedPostController::class, 'store']);
        Route::delete('{id}/save', [App\Http\Controllers\Api\SavedPostController::class, 'destroy']);
        
        // Comment management
        Route::get('{id}/comments', [App\Http\Controllers\Api\CommentController::class, 'index']);
        Route::post('{id}/comments', [App\Http\Controllers\Api\CommentController::class, 'store']);
    });
    
    // Comment deletion (separate route)
    Route::delete('comments/{id}', [App\Http\Controllers\Api\CommentController::class, 'destroy']);
});
