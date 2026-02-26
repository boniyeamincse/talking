<?php

namespace App\Services;

use App\Models\User;
use App\Models\CoinTransaction;
use App\Models\GiftTransaction;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Platform overview stats (Super Admin).
     */
    public function getOverview(): array
    {
        return [
            'users' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'banned' => User::where('status', 'banned')->count(),
                'suspended' => User::where('status', 'suspended')->count(),
                'new_today' => User::whereDate('created_at', today())->count(),
                'new_this_week' => User::where('created_at', '>=', now()->startOfWeek())->count(),
                'new_this_month' => User::where('created_at', '>=', now()->startOfMonth())->count(),
            ],
            'content' => [
                'total_posts' => DB::table('posts')->count(),
                'posts_today' => DB::table('posts')->whereDate('created_at', today())->count(),
                'total_messages' => DB::table('messages')->count(),
                'messages_today' => DB::table('messages')->whereDate('created_at', today())->count(),
            ],
            'moderation' => [
                'pending_reports' => DB::table('reports')->where('status', 'pending')->count(),
                'reports_today' => DB::table('reports')->whereDate('created_at', today())->count(),
                'resolved_this_week' => DB::table('reports')
                    ->where('status', 'resolved')
                    ->where('resolved_at', '>=', now()->startOfWeek())
                    ->count(),
            ],
            'gifts' => [
                'total_sent' => GiftTransaction::count(),
                'sent_today' => GiftTransaction::whereDate('created_at', today())->count(),
            ],
        ];
    }

    /**
     * User activity stats.
     */
    public function getUserStats(string $period = 'week'): array
    {
        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfWeek(),
        };

        // Daily registration trend
        $registrations = User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Active users (seen within period)
        $activeUsers = User::where('last_seen_at', '>=', $startDate)->count();

        // Top countries
        $topCountries = DB::table('profiles')
            ->select('country', DB::raw('COUNT(*) as count'))
            ->whereNotNull('country')
            ->groupBy('country')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        return [
            'period' => $period,
            'registrations' => $registrations,
            'active_users' => $activeUsers,
            'top_countries' => $topCountries,
        ];
    }

    /**
     * Call analytics.
     */
    public function getCallStats(string $period = 'week'): array
    {
        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            default => now()->startOfWeek(),
        };

        $totalCalls = DB::table('calls')
            ->where('created_at', '>=', $startDate)
            ->count();

        $callsByType = DB::table('calls')
            ->select('type', DB::raw('COUNT(*) as count'))
            ->where('created_at', '>=', $startDate)
            ->groupBy('type')
            ->get();

        $avgDuration = DB::table('calls')
            ->where('created_at', '>=', $startDate)
            ->where('status', 'ended')
            ->avg('duration');

        $dailyCalls = DB::table('calls')
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as count')
            )
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return [
            'period' => $period,
            'total_calls' => $totalCalls,
            'calls_by_type' => $callsByType,
            'avg_duration_seconds' => round($avgDuration ?? 0),
            'daily_trend' => $dailyCalls,
        ];
    }

    /**
     * Revenue stats (Super Admin).
     */
    public function getRevenueStats(string $period = 'month'): array
    {
        $startDate = match ($period) {
            'day' => now()->startOfDay(),
            'week' => now()->startOfWeek(),
            'month' => now()->startOfMonth(),
            'year' => now()->startOfYear(),
            default => now()->startOfMonth(),
        };

        // Coin purchases (topups)
        $coinRevenue = CoinTransaction::where('type', 'topup')
            ->where('created_at', '>=', $startDate)
            ->sum('amount');

        $totalTransactions = CoinTransaction::where('type', 'topup')
            ->where('created_at', '>=', $startDate)
            ->count();

        $dailyRevenue = CoinTransaction::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(amount) as total'),
                DB::raw('COUNT(*) as transactions')
            )
            ->where('type', 'topup')
            ->where('created_at', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Gift economy
        $giftVolume = GiftTransaction::where('created_at', '>=', $startDate)->count();

        // Price per coin for conversion
        $pricePerCoin = config('services.stripe.price_per_coin', 0.01);

        return [
            'period' => $period,
            'coin_revenue' => [
                'total_coins_purchased' => $coinRevenue,
                'estimated_usd' => round($coinRevenue * $pricePerCoin, 2),
                'total_transactions' => $totalTransactions,
            ],
            'gift_economy' => [
                'total_gifts_sent' => $giftVolume,
            ],
            'daily_trend' => $dailyRevenue,
        ];
    }
}
