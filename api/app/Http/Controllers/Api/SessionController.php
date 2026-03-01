<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SessionController extends BaseController
{
    /**
     * GET /admin/sessions/active — List active sessions.
     */
    public function activeSessions(): JsonResponse
    {
        $sessions = DB::table('sessions')
            ->join('users', 'sessions.user_id', '=', 'users.id')
            ->select(
                'sessions.id',
                'sessions.user_id',
                'users.name as user_name',
                'users.email as user_email',
                'users.role as user_role',
                'sessions.ip_address',
                'sessions.user_agent as device',
                'sessions.last_activity',
                DB::raw('FROM_UNIXTIME(sessions.last_activity) as started_at')
            )
            ->where('sessions.last_activity', '>', now()->subMinutes(30)->timestamp)
            ->orderByDesc('sessions.last_activity')
            ->get()
            ->map(function ($session) {
                return [
                    'id' => $session->id,
                    'user_id' => $session->user_id,
                    'user_name' => $session->user_name,
                    'user_email' => $session->user_email,
                    'user_role' => $session->user_role,
                    'ip_address' => $session->ip_address,
                    'device' => $this->parseUserAgent($session->device),
                    'location' => $this->getLocation($session->ip_address),
                    'started_at' => $session->started_at,
                    'last_activity' => date('Y-m-d H:i:s', $session->last_activity),
                ];
            });

        return $this->successResponse($sessions, 'Active sessions retrieved successfully.');
    }

    /**
     * POST /admin/sessions/{id}/logout — Force logout a session.
     */
    public function forceLogout(string $sessionId): JsonResponse
    {
        $deleted = DB::table('sessions')->where('id', $sessionId)->delete();

        if ($deleted) {
            return $this->successResponse(null, 'Session terminated successfully.');
        }

        return $this->errorResponse('Session not found.', null, 404);
    }

    /**
     * Parse user agent to readable device info.
     */
    private function parseUserAgent(string $userAgent): string
    {
        if (str_contains($userAgent, 'Mobile')) {
            return 'Mobile Device';
        }
        if (str_contains($userAgent, 'Windows')) {
            return 'Windows PC';
        }
        if (str_contains($userAgent, 'Mac')) {
            return 'Mac';
        }
        if (str_contains($userAgent, 'Linux')) {
            return 'Linux';
        }
        return 'Unknown Device';
    }

    /**
     * Get location from IP (placeholder - integrate with IP geolocation service).
     */
    private function getLocation(string $ip): string
    {
        if ($ip === '127.0.0.1' || $ip === '::1') {
            return 'Localhost';
        }
        // TODO: Integrate with IP geolocation API (ipapi.co, ipinfo.io, etc.)
        return 'Unknown';
    }
}
