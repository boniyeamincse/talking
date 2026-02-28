<?php

use App\Http\Middleware\CheckBlockedUsers;
use App\Http\Middleware\CheckConversationParticipant;
use App\Http\Middleware\ForceJsonResponse;
use App\Http\Middleware\UpdateLastSeen;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        channels: __DIR__.'/../routes/channels.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->api(prepend: [
            ForceJsonResponse::class,
        ], append: [
            'throttle:api',
        ]);
        
        $middleware->alias([
            'update.last.seen' => UpdateLastSeen::class,
            'check.blocked' => CheckBlockedUsers::class,
            'check.conversation.participant' => CheckConversationParticipant::class,
            'is.admin' => \App\Http\Middleware\IsAdmin::class,
            'is.super_admin' => \App\Http\Middleware\IsSuperAdmin::class,
        ]);
        
        $middleware->statefulApi();
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Illuminate\Validation\ValidationException $e, $request) {
            if ($request->is('api/*')) {
                return response()->json([
                    'success' => false,
                    'message' => $e->getMessage(),
                    'data' => $e->errors(),
                ], 422);
            }
        });
    })->create();
