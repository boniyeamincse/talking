<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SecurityController extends BaseController
{
    public function bannedIPs(): JsonResponse
    {
        $ips = DB::table('banned_ips')
            ->orderByDesc('created_at')
            ->get();

        return $this->successResponse($ips, 'Banned IPs retrieved successfully.');
    }

    public function banIP(Request $request): JsonResponse
    {
        $request->validate([
            'ip_address' => 'required|ip',
            'reason' => 'required|string|max:500',
            'type' => 'required|in:temporary,permanent',
            'days' => 'required_if:type,temporary|integer|min:1',
        ]);

        $expiresAt = null;
        if ($request->type === 'temporary') {
            $expiresAt = now()->addDays($request->days);
        }

        $id = DB::table('banned_ips')->insertGetId([
            'ip_address' => $request->ip_address,
            'reason' => $request->reason,
            'type' => $request->type,
            'banned_by' => $request->user()->id,
            'expires_at' => $expiresAt,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return $this->successResponse(
            DB::table('banned_ips')->find($id),
            'IP banned successfully.',
            201
        );
    }

    public function unbanIP(int $id): JsonResponse
    {
        $deleted = DB::table('banned_ips')->where('id', $id)->delete();

        if ($deleted) {
            return $this->successResponse(null, 'IP unbanned successfully.');
        }

        return $this->errorResponse('Banned IP not found.', null, 404);
    }
}
