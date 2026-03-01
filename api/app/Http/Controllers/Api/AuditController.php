<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class AuditController extends BaseController
{
    public function loginLogs(): JsonResponse
    {
        $logs = DB::table('login_logs')
            ->leftJoin('users', 'login_logs.user_id', '=', 'users.id')
            ->select(
                'login_logs.*',
                'users.name as user_name'
            )
            ->orderByDesc('login_logs.created_at')
            ->limit(500)
            ->get();

        return $this->successResponse($logs, 'Login logs retrieved successfully.');
    }

    public function securityEvents(): JsonResponse
    {
        $events = DB::table('security_events')
            ->leftJoin('users', 'security_events.user_id', '=', 'users.id')
            ->select(
                'security_events.*',
                'users.name as user_name'
            )
            ->orderByDesc('security_events.created_at')
            ->limit(500)
            ->get();

        return $this->successResponse($events, 'Security events retrieved successfully.');
    }
}
