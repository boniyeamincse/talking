<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ReportResource;
use App\Services\AdminService;
use App\Services\AnalyticsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends BaseController
{
    public function __construct(
        private AdminService $adminService,
        private AnalyticsService $analyticsService,
    ) {}

    // ─── User Management ────────────────────────────────────────────

    /**
     * GET /admin/users — List all users.
     */
    public function listUsers(Request $request): JsonResponse
    {
        $users = $this->adminService->listUsers(
            $request->only(['search', 'status', 'role']),
            $request->input('per_page', 20),
        );

        return $this->paginatedResponse($users, 'Users retrieved successfully.');
    }

    /**
     * GET /admin/users/{id} — View user detail.
     */
    public function userDetail(int $id): JsonResponse
    {
        try {
            $detail = $this->adminService->getUserDetail($id);
            return $this->successResponse($detail, 'User detail retrieved successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('User not found.', null, 404);
        }
    }

    /**
     * POST /admin/users/{id}/ban — Ban user (Super Admin).
     */
    public function banUser(Request $request, int $id): JsonResponse
    {
        $request->validate(['reason' => 'required|string|max:500']);

        try {
            $user = $this->adminService->banUser($request->user(), $id, $request->input('reason'));
            return $this->successResponse($user, 'User banned successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * POST /admin/users/{id}/suspend — Suspend user (Admin).
     */
    public function suspendUser(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'days' => 'nullable|integer|min:1|max:365',
        ]);

        try {
            $user = $this->adminService->suspendUser(
                $request->user(), $id,
                $request->input('reason'),
                $request->input('days'),
            );
            return $this->successResponse($user, 'User suspended successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * POST /admin/users/{id}/restore — Restore user.
     */
    public function restoreUser(Request $request, int $id): JsonResponse
    {
        try {
            $user = $this->adminService->restoreUser($request->user(), $id);
            return $this->successResponse($user, 'User restored successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    /**
     * POST /admin/users/{id}/warn — Issue warning.
     */
    public function warnUser(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500',
            'details' => 'nullable|string|max:2000',
            'report_id' => 'nullable|integer|exists:reports,id',
        ]);

        try {
            $warning = $this->adminService->warnUser(
                $request->user(), $id,
                $request->input('reason'),
                $request->input('details'),
                $request->input('report_id'),
            );
            return $this->successResponse($warning, 'Warning issued successfully.', 201);
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    // ─── Admin Management ───────────────────────────────────────────

    /**
     * GET /admin/admins — List admin accounts.
     */
    public function listAdmins(Request $request): JsonResponse
    {
        $admins = $this->adminService->listAdmins($request->input('per_page', 20));
        return $this->paginatedResponse($admins, 'Admins retrieved successfully.');
    }

    /**
     * POST /admin/admins — Create admin.
     */
    public function createAdmin(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:100',
            'username' => 'required|string|max:50|unique:users,username',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|string|in:admin,super_admin',
        ]);

        $admin = $this->adminService->createAdmin($request->all());
        return $this->successResponse($admin, 'Admin created successfully.', 201);
    }

    /**
     * PUT /admin/admins/{id} — Update admin permissions.
     */
    public function updateAdmin(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'name' => 'nullable|string|max:100',
            'email' => "nullable|email|unique:users,email,{$id}",
            'role' => 'nullable|string|in:admin,super_admin',
        ]);

        try {
            $admin = $this->adminService->updateAdmin($id, $request->only(['name', 'email', 'role']));
            return $this->successResponse($admin, 'Admin updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Admin not found.', null, 404);
        }
    }

    /**
     * DELETE /admin/admins/{id} — Remove admin (demote to user).
     */
    public function removeAdmin(Request $request, int $id): JsonResponse
    {
        try {
            $user = $this->adminService->removeAdmin($request->user(), $id);
            return $this->successResponse($user, 'Admin removed and demoted to user.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    // ─── Content Moderation ─────────────────────────────────────────

    /**
     * GET /admin/reports — List all reports.
     */
    public function listReports(Request $request): JsonResponse
    {
        $reports = $this->adminService->listReports(
            $request->only(['status', 'type']),
            $request->input('per_page', 20),
        );

        return $this->paginatedResponse(
            $reports->through(fn ($r) => new ReportResource($r)),
            'Reports retrieved successfully.'
        );
    }

    /**
     * GET /admin/reports/{id} — View report detail.
     */
    public function reportDetail(int $id): JsonResponse
    {
        try {
            $report = $this->adminService->getReportDetail($id);
            return $this->successResponse(new ReportResource($report), 'Report detail retrieved.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Report not found.', null, 404);
        }
    }

    /**
     * POST /admin/reports/{id}/resolve — Resolve report.
     */
    public function resolveReport(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|string|in:resolved,dismissed',
            'admin_notes' => 'nullable|string|max:2000',
        ]);

        try {
            $report = $this->adminService->resolveReport(
                $request->user(), $id,
                $request->input('status'),
                $request->input('admin_notes'),
            );
            return $this->successResponse(new ReportResource($report), 'Report updated successfully.');
        } catch (\InvalidArgumentException $e) {
            return $this->errorResponse($e->getMessage(), null, 422);
        }
    }

    // ─── Analytics ──────────────────────────────────────────────────

    /**
     * GET /admin/analytics/overview — Platform stats.
     */
    public function analyticsOverview(): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->getOverview(),
            'Platform overview retrieved.'
        );
    }

    /**
     * GET /admin/analytics/users — User activity stats.
     */
    public function analyticsUsers(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->getUserStats($request->input('period', 'week')),
            'User analytics retrieved.'
        );
    }

    /**
     * GET /admin/analytics/calls — Call analytics.
     */
    public function analyticsCalls(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->getCallStats($request->input('period', 'week')),
            'Call analytics retrieved.'
        );
    }

    /**
     * GET /admin/analytics/revenue — Revenue stats.
     */
    public function analyticsRevenue(Request $request): JsonResponse
    {
        return $this->successResponse(
            $this->analyticsService->getRevenueStats($request->input('period', 'month')),
            'Revenue analytics retrieved.'
        );
    }

    // ─── Platform Settings ──────────────────────────────────────────

    /**
     * GET /admin/settings — Get platform settings.
     */
    public function getSettings(): JsonResponse
    {
        return $this->successResponse(
            $this->adminService->getSettings(),
            'Platform settings retrieved.'
        );
    }

    /**
     * PUT /admin/settings — Update platform settings.
     */
    public function updateSettings(Request $request): JsonResponse
    {
        $request->validate([
            'settings' => 'required|array',
            'settings.*.value' => 'required',
            'settings.*.type' => 'nullable|string|in:string,integer,boolean,json',
            'settings.*.group' => 'nullable|string|max:50',
            'settings.*.description' => 'nullable|string|max:255',
        ]);

        $settings = $this->adminService->updateSettings($request->input('settings'));
        return $this->successResponse($settings, 'Settings updated successfully.');
    }

    // ─── Gift Management ────────────────────────────────────────────

    /**
     * GET /admin/gifts — List all gifts.
     */
    public function listGifts(Request $request): JsonResponse
    {
        $gifts = $this->adminService->listGifts($request->input('per_page', 20));
        return $this->paginatedResponse($gifts, 'Gifts retrieved successfully.');
    }

    /**
     * POST /admin/gifts — Create gift.
     */
    public function createGift(Request $request): JsonResponse
    {
        $request->validate([
            'gift_category_id' => 'required|exists:gift_categories,id',
            'name' => 'required|string|max:100',
            'description' => 'nullable|string|max:500',
            'price_coins' => 'required|integer|min:1',
            'rarity' => 'required|string|in:common,uncommon,rare,epic,legendary',
            'asset_url' => 'nullable|string|url',
            'is_active' => 'nullable|boolean',
        ]);

        $data = $request->all();
        if (!isset($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['name']);
        }

        $gift = $this->adminService->createGift($data);
        return $this->successResponse($gift, 'Gift created successfully.', 201);
    }

    /**
     * PUT /admin/gifts/{id} — Update gift.
     */
    public function updateGift(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'gift_category_id' => 'nullable|exists:gift_categories,id',
            'name' => 'nullable|string|max:100',
            'description' => 'nullable|string|max:500',
            'price_coins' => 'nullable|integer|min:1',
            'rarity' => 'nullable|string|in:common,uncommon,rare,epic,legendary',
            'asset_url' => 'nullable|string|url',
            'is_active' => 'nullable|boolean',
        ]);

        try {
            $gift = $this->adminService->updateGift($id, $request->all());
            return $this->successResponse($gift, 'Gift updated successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Gift not found.', null, 404);
        }
    }

    /**
     * DELETE /admin/gifts/{id} — Delete gift.
     */
    public function deleteGift(int $id): JsonResponse
    {
        try {
            $this->adminService->deleteGift($id);
            return $this->successResponse(null, 'Gift deleted successfully.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return $this->errorResponse('Gift not found.', null, 404);
        }
    }
}
