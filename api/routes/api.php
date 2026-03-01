<?php

use App\Http\Controllers\Api\AuditController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CallController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\GroupChatController;
use App\Http\Controllers\Api\MediaMessageController;
use App\Http\Controllers\Api\MessageController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\ReactionController;
use App\Http\Controllers\Api\SecurityController;
use App\Http\Controllers\Api\SessionController;
use App\Http\Controllers\Api\SocialController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\VideoController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes - Version 1
|--------------------------------------------------------------------------
*/

// Dummy route for Laravel's default ResetPassword notification
Route::get('/auth/reset-password/{token}', function ($token) {
    return response()->json(['message' => 'Please use the POST /auth/reset-password endpoint with this token.', 'token' => $token]);
})->name('password.reset');

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

// Translation routes (Phase 7)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('translations')->group(function () {
        // Translate content
        Route::get('message/{id}', [App\Http\Controllers\Api\TranslationController::class, 'translateMessage']);
        Route::get('post/{id}', [App\Http\Controllers\Api\TranslationController::class, 'translatePost']);
        Route::post('text', [App\Http\Controllers\Api\TranslationController::class, 'translateText']);
        
        // Language support
        Route::get('languages', [App\Http\Controllers\Api\TranslationController::class, 'languages']);
        Route::get('detect', [App\Http\Controllers\Api\TranslationController::class, 'detect']);
        
        // Quality scoring
        Route::post('{id}/score', [App\Http\Controllers\Api\TranslationController::class, 'score']);
    });
});

use App\Http\Controllers\GiftController;

// ... existing code ...

// Gift System routes (Phase 8)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('gifts')->group(function () {
        // Gift catalog
        Route::get('/', [GiftController::class, 'index']);
        Route::get('{id}', [GiftController::class, 'show']);
        
        // Gift transactions
        Route::post('send', [GiftController::class, 'sendGift']);
        Route::get('transactions', [GiftController::class, 'getTransactions']);
        
        // Coin system
        Route::get('wallet', [GiftController::class, 'getWallet']);
        Route::get('coins/packages', [GiftController::class, 'getCoinPackages']);
        Route::post('coins/purchase', [GiftController::class, 'purchaseCoins']);
    });
});

use App\Http\Controllers\MatchingController;

// Matching routes (Phase 9)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('matching')->group(function () {
        Route::get('discover', [MatchingController::class, 'discover']);
        Route::post('like', [MatchingController::class, 'likeUser']);
        Route::post('pass', [MatchingController::class, 'passUser']);
        Route::post('super-like', [MatchingController::class, 'superLikeUser']);
        Route::post('undo', [MatchingController::class, 'undoSwipe']);
        Route::get('matches', [MatchingController::class, 'getMatches']);
        Route::get('leaderboard', [MatchingController::class, 'getLeaderboard']);
    });
});

// Notification routes (Phase 10)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('notifications')->group(function () {
        Route::get('/', [App\Http\Controllers\Api\NotificationController::class, 'index']);
        Route::post('{id}/read', [App\Http\Controllers\Api\NotificationController::class, 'markAsRead']);
        Route::post('read-all', [App\Http\Controllers\Api\NotificationController::class, 'markAllAsRead']);
        
        // Device tokens
        Route::post('device-token', [App\Http\Controllers\Api\NotificationController::class, 'registerDeviceToken']);
        Route::delete('device-token', [App\Http\Controllers\Api\NotificationController::class, 'removeDeviceToken']);
        
        // Settings
        Route::get('settings', [App\Http\Controllers\Api\NotificationController::class, 'getSettings']);
        Route::put('settings', [App\Http\Controllers\Api\NotificationController::class, 'updateSettings']);
    });
});

// Report routes (Phase 11)
Route::prefix('v1')->middleware('auth:sanctum')->group(function () {
    Route::prefix('reports')->group(function () {
        Route::post('/', [App\Http\Controllers\Api\ReportController::class, 'store']);
        Route::get('my', [App\Http\Controllers\Api\ReportController::class, 'myReports']);
    });
});

// Admin routes (Phase 12) — Admin level
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'is.admin'])->group(function () {
    // User Management
    Route::get('users', [App\Http\Controllers\Api\AdminController::class, 'listUsers']);
    Route::get('users/{id}', [App\Http\Controllers\Api\AdminController::class, 'userDetail']);
    Route::post('users/{id}/suspend', [App\Http\Controllers\Api\AdminController::class, 'suspendUser']);
    Route::post('users/{id}/restore', [App\Http\Controllers\Api\AdminController::class, 'restoreUser']);
    Route::post('users/{id}/warn', [App\Http\Controllers\Api\AdminController::class, 'warnUser']);

    // Content Moderation
    Route::get('reports', [App\Http\Controllers\Api\AdminController::class, 'listReports']);
    Route::get('reports/{id}', [App\Http\Controllers\Api\AdminController::class, 'reportDetail']);
    Route::post('reports/{id}/resolve', [App\Http\Controllers\Api\AdminController::class, 'resolveReport']);

    // Analytics
    Route::get('analytics/users', [App\Http\Controllers\Api\AdminController::class, 'analyticsUsers']);
    Route::get('analytics/calls', [App\Http\Controllers\Api\AdminController::class, 'analyticsCalls']);
    
    // Sessions
    Route::get('sessions/active', [SessionController::class, 'activeSessions']);
    Route::post('sessions/{id}/logout', [SessionController::class, 'forceLogout']);
    
    // Audit Logs
    Route::get('audit/login', [AuditController::class, 'loginLogs']);
    Route::get('security/events', [AuditController::class, 'securityEvents']);
    
    // Security
    Route::get('security/banned-ips', [SecurityController::class, 'bannedIPs']);
    Route::post('security/banned-ips', [SecurityController::class, 'banIP']);
    Route::post('security/banned-ips/{id}/unban', [SecurityController::class, 'unbanIP']);
});

// Admin routes (Phase 12) — Super Admin only
Route::prefix('v1/admin')->middleware(['auth:sanctum', 'is.super_admin'])->group(function () {
    // Ban (Super Admin only)
    Route::post('users/{id}/ban', [App\Http\Controllers\Api\AdminController::class, 'banUser']);

    // Admin Management
    Route::get('admins', [App\Http\Controllers\Api\AdminController::class, 'listAdmins']);
    Route::post('admins', [App\Http\Controllers\Api\AdminController::class, 'createAdmin']);
    Route::put('admins/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateAdmin']);
    Route::delete('admins/{id}', [App\Http\Controllers\Api\AdminController::class, 'removeAdmin']);

    // Analytics (Super Admin)
    Route::get('analytics/overview', [App\Http\Controllers\Api\AdminController::class, 'analyticsOverview']);
    Route::get('analytics/revenue', [App\Http\Controllers\Api\AdminController::class, 'analyticsRevenue']);

    // Platform Settings
    Route::get('settings', [App\Http\Controllers\Api\AdminController::class, 'getSettings']);
    Route::put('settings', [App\Http\Controllers\Api\AdminController::class, 'updateSettings']);

    // Gift Management
    Route::get('gifts', [App\Http\Controllers\Api\AdminController::class, 'listGifts']);
    Route::post('gifts', [App\Http\Controllers\Api\AdminController::class, 'createGift']);
    Route::put('gifts/{id}', [App\Http\Controllers\Api\AdminController::class, 'updateGift']);
    Route::delete('gifts/{id}', [App\Http\Controllers\Api\AdminController::class, 'deleteGift']);
});


