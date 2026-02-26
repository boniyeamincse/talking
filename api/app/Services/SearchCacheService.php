<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;

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
        
        // Use Cache to track popular searches safely
        $popular = Cache::get(self::POPULAR_SEARCHES_KEY, []);
        
        if (isset($popular[$query])) {
            $popular[$query]++;
        } else {
            $popular[$query] = 1;
        }

        // Sort by count and keep top 100
        arsort($popular);
        if (count($popular) > 100) {
            $popular = array_slice($popular, 0, 100);
        }

        Cache::forever(self::POPULAR_SEARCHES_KEY, $popular);
    }

    /**
     * Get popular search queries
     */
    public function getPopularSearches(int $limit = 10): array
    {
        $popular = Cache::get(self::POPULAR_SEARCHES_KEY, []);
        
        $result = [];
        $count = 0;
        foreach ($popular as $query => $searchCount) {
            if ($count >= $limit) break;
            $result[] = [
                'query' => $query,
                'count' => (int) $searchCount
            ];
            $count++;
        }
        
        return $result;
    }

    /**
     * Clear search cache
     */
    public function clearSearchCache(): void
    {
        // This might be too aggressive if not using tags, 
        // but for now is okay for development
        // In production with Redis, we'd use tags.
    }

    /**
     * Clear popular searches
     */
    public function clearPopularSearches(): void
    {
        Cache::forget(self::POPULAR_SEARCHES_KEY);
    }
}

