<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class SearchCacheService
{
    /**
     * Cache duration in seconds (1 hour)
     */
    private const CACHE_DURATION = 3600;

    /**
     * Popular searches cache key
     */
    private const POPULAR_SEARCHES_KEY = 'popular_searches';

    /**
     * Get cached search results
     */
    public function getCachedResults(string $cacheKey): ?array
    {
        return Cache::get($cacheKey);
    }

    /**
     * Cache search results
     */
    public function cacheResults(string $cacheKey, array $results): void
    {
        Cache::put($cacheKey, $results, self::CACHE_DURATION);
    }

    /**
     * Generate cache key from search parameters
     */
    public function generateCacheKey(array $params): string
    {
        ksort($params);
        return 'search:' . md5(json_encode($params));
    }

    /**
     * Track search query for popularity
     */
    public function trackSearchQuery(string $query): void
    {
        if (strlen($query) < 2) {
            return;
        }

        $query = strtolower(trim($query));
        
        // Increment search count in Redis sorted set
        Redis::zincrby(self::POPULAR_SEARCHES_KEY, 1, $query);
        
        // Keep only top 100 searches
        $count = Redis::zcard(self::POPULAR_SEARCHES_KEY);
        if ($count > 100) {
            Redis::zremrangebyrank(self::POPULAR_SEARCHES_KEY, 0, $count - 101);
        }
    }

    /**
     * Get popular search queries
     */
    public function getPopularSearches(int $limit = 10): array
    {
        // Get top searches from Redis sorted set (highest scores first)
        $searches = Redis::zrevrange(self::POPULAR_SEARCHES_KEY, 0, $limit - 1, 'WITHSCORES');
        
        $result = [];
        for ($i = 0; $i < count($searches); $i += 2) {
            $result[] = [
                'query' => $searches[$i],
                'count' => (int) $searches[$i + 1]
            ];
        }
        
        return $result;
    }

    /**
     * Clear search cache
     */
    public function clearSearchCache(): void
    {
        Cache::flush();
    }

    /**
     * Clear popular searches
     */
    public function clearPopularSearches(): void
    {
        Redis::del(self::POPULAR_SEARCHES_KEY);
    }
}
