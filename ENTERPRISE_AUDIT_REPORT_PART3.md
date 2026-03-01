# 🏢 ENTERPRISE AUDIT REPORT - PART 3
## Security, Performance & DevOps Solutions

---

## 🔐 PHASE 4: SECURITY HARDENING (Continued)

### 4.1 JWT Token Security Enhancement

**Create:** `api/app/Services/TokenService.php`
```php
<?php

namespace App\Services;

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;
use Illuminate\Support\Facades\Hash;

class TokenService
{
    private const TOKEN_EXPIRY_DAYS = 7;
    private const REFRESH_TOKEN_EXPIRY_DAYS = 30;
    
    /**
     * Create access and refresh tokens
     */
    public function createTokenPair(User $user): array
    {
        // Revoke old tokens (optional - for single device login)
        // $user->tokens()->delete();
        
        $accessToken = $user->createToken(
            'access_token',
            ['*'],
            now()->addDays(self::TOKEN_EXPIRY_DAYS)
        )->plainTextToken;
        
        $refreshToken = $user->createToken(
            'refresh_token',
            ['refresh'],
            now()->addDays(self::REFRESH_TOKEN_EXPIRY_DAYS)
        )->plainTextToken;
        
        return [
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
            'token_type' => 'Bearer',
            'expires_in' => self::TOKEN_EXPIRY_DAYS * 24 * 60 * 60,
        ];
    }
    
    /**
     * Refresh access token using refresh token
     */
    public function refreshToken(string $refreshToken): ?array
    {
        $token = PersonalAccessToken::findToken($refreshToken);
        
        if (!$token || !$token->can('refresh') || $token->expires_at < now()) {
            return null;
        }
        
        $user = $token->tokenable;
        
        // Revoke old access tokens (keep refresh token)
        $user->tokens()
            ->where('name', 'access_token')
            ->delete();
        
        return $this->createTokenPair($user);
    }
    
    /**
     * Revoke all user tokens
     */
    public function revokeAllTokens(User $user): void
    {
        $user->tokens()->delete();
    }
    
    /**
     * Revoke specific token
     */
    public function revokeToken(string $token): bool
    {
        $accessToken = PersonalAccessToken::findToken($token);
        
        if ($accessToken) {
            $accessToken->delete();
            return true;
        }
        
        return false;
    }
}
```

---

### 4.2 HTTPS & Secure Headers Middleware

**Create:** `api/app/Http/Middleware/SecurityHeadersMiddleware.php`
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeadersMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);
        
        // Force HTTPS in production
        if (app()->environment('production') && !$request->secure()) {
            return redirect()->secure($request->getRequestUri(), 301);
        }
        
        // Security headers
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        // Content Security Policy
        $csp = implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://api.banitalk.com wss://api.banitalk.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
        $response->headers->set('Content-Security-Policy', $csp);
        
        // HSTS (HTTP Strict Transport Security)
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
        }
        
        return $response;
    }
}
```

**Register in:** `api/bootstrap/app.php`
```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->append(\App\Http\Middleware\SecurityHeadersMiddleware::class);
})
```

---

### 4.3 File Upload Security

**Create:** `api/app/Services/SecureFileUploadService.php`
```php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Intervention\Image\Facades\Image;

class SecureFileUploadService
{
    private const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    private const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/x-msvideo'];
    private const ALLOWED_AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    
    /**
     * Validate and upload file securely
     */
    public function uploadFile(UploadedFile $file, string $type = 'image'): array
    {
        // Validate file size
        if ($file->getSize() > self::MAX_FILE_SIZE) {
            throw new \InvalidArgumentException('File size exceeds maximum allowed size of 10MB');
        }
        
        // Validate MIME type
        $mimeType = $file->getMimeType();
        $allowedTypes = $this->getAllowedTypes($type);
        
        if (!in_array($mimeType, $allowedTypes)) {
            throw new \InvalidArgumentException('Invalid file type');
        }
        
        // Validate file extension matches MIME type
        $extension = $file->getClientOriginalExtension();
        if (!$this->validateExtension($extension, $mimeType)) {
            throw new \InvalidArgumentException('File extension does not match file type');
        }
        
        // Generate secure filename
        $filename = $this->generateSecureFilename($extension);
        
        // Store file
        $path = $file->storeAs(
            $this->getStoragePath($type),
            $filename,
            'private'
        );
        
        // For images, create optimized version
        if ($type === 'image') {
            $this->optimizeImage($path);
        }
        
        return [
            'path' => $path,
            'filename' => $filename,
            'mime_type' => $mimeType,
            'size' => $file->getSize(),
            'url' => Storage::url($path),
        ];
    }
    
    /**
     * Generate secure random filename
     */
    private function generateSecureFilename(string $extension): string
    {
        return Str::uuid() . '_' . time() . '.' . $extension;
    }
    
    /**
     * Get storage path based on file type
     */
    private function getStoragePath(string $type): string
    {
        return match($type) {
            'image' => 'uploads/images/' . date('Y/m'),
            'video' => 'uploads/videos/' . date('Y/m'),
            'audio' => 'uploads/audio/' . date('Y/m'),
            default => 'uploads/files/' . date('Y/m'),
        };
    }
    
    /**
     * Get allowed MIME types for file type
     */
    private function getAllowedTypes(string $type): array
    {
        return match($type) {
            'image' => self::ALLOWED_IMAGE_TYPES,
            'video' => self::ALLOWED_VIDEO_TYPES,
            'audio' => self::ALLOWED_AUDIO_TYPES,
            default => [],
        };
    }
    
    /**
     * Validate file extension matches MIME type
     */
    private function validateExtension(string $extension, string $mimeType): bool
    {
        $validExtensions = [
            'image/jpeg' => ['jpg', 'jpeg'],
            'image/png' => ['png'],
            'image/gif' => ['gif'],
            'image/webp' => ['webp'],
            'video/mp4' => ['mp4'],
            'audio/mpeg' => ['mp3'],
        ];
        
        return in_array(strtolower($extension), $validExtensions[$mimeType] ?? []);
    }
    
    /**
     * Optimize image (resize, compress)
     */
    private function optimizeImage(string $path): void
    {
        $fullPath = Storage::path($path);
        
        $image = Image::make($fullPath);
        
        // Resize if too large
        if ($image->width() > 1920 || $image->height() > 1920) {
            $image->resize(1920, 1920, function ($constraint) {
                $constraint->aspectRatio();
                $constraint->upsize();
            });
        }
        
        // Compress
        $image->save($fullPath, 85);
    }
    
    /**
     * Delete file securely
     */
    public function deleteFile(string $path): bool
    {
        return Storage::delete($path);
    }
}
```

---

### 4.4 SQL Injection Prevention Audit

**Create:** `api/app/Support/Traits/SecureQueryTrait.php`
```php
<?php

namespace App\Support\Traits;

use Illuminate\Database\Eloquent\Builder;

trait SecureQueryTrait
{
    /**
     * Safely add where clause with parameter binding
     */
    public function scopeSafeWhere(Builder $query, string $column, $operator, $value = null): Builder
    {
        // If only 2 arguments, assume '=' operator
        if (func_num_args() === 3) {
            $value = $operator;
            $operator = '=';
        }
        
        // Whitelist allowed operators
        $allowedOperators = ['=', '!=', '<', '>', '<=', '>=', 'LIKE', 'NOT LIKE', 'IN', 'NOT IN'];
        
        if (!in_array(strtoupper($operator), $allowedOperators)) {
            throw new \InvalidArgumentException('Invalid operator');
        }
        
        return $query->where($column, $operator, $value);
    }
    
    /**
     * Safely order by with column whitelist
     */
    public function scopeSafeOrderBy(Builder $query, string $column, string $direction = 'asc'): Builder
    {
        // Get table columns
        $allowedColumns = $this->getFillable();
        $allowedColumns[] = 'id';
        $allowedColumns[] = 'created_at';
        $allowedColumns[] = 'updated_at';
        
        if (!in_array($column, $allowedColumns)) {
            throw new \InvalidArgumentException('Invalid column for ordering');
        }
        
        $direction = strtolower($direction);
        if (!in_array($direction, ['asc', 'desc'])) {
            throw new \InvalidArgumentException('Invalid sort direction');
        }
        
        return $query->orderBy($column, $direction);
    }
}
```

---

## ⚡ PHASE 5: PERFORMANCE OPTIMIZATION

### 5.1 Redis Caching Implementation

**Update:** `api/config/cache.php`
```php
'default' => env('CACHE_DRIVER', 'redis'),

'stores' => [
    'redis' => [
        'driver' => 'redis',
        'connection' => 'cache',
        'lock_connection' => 'default',
    ],
],
```

**Create:** `api/app/Services/CacheService.php`
```php
<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Redis;

class CacheService
{
    private const DEFAULT_TTL = 3600; // 1 hour
    private const USER_CACHE_TTL = 1800; // 30 minutes
    private const QUERY_CACHE_TTL = 600; // 10 minutes
    
    /**
     * Cache user data
     */
    public function cacheUser(int $userId, array $data): void
    {
        Cache::put("user:{$userId}", $data, self::USER_CACHE_TTL);
    }
    
    /**
     * Get cached user data
     */
    public function getCachedUser(int $userId): ?array
    {
        return Cache::get("user:{$userId}");
    }
    
    /**
     * Invalidate user cache
     */
    public function invalidateUserCache(int $userId): void
    {
        Cache::forget("user:{$userId}");
    }
    
    /**
     * Cache query results
     */
    public function cacheQuery(string $key, callable $callback, ?int $ttl = null): mixed
    {
        return Cache::remember($key, $ttl ?? self::QUERY_CACHE_TTL, $callback);
    }
    
    /**
     * Cache API response
     */
    public function cacheApiResponse(string $endpoint, array $params, mixed $data, ?int $ttl = null): void
    {
        $key = $this->generateCacheKey($endpoint, $params);
        Cache::put($key, $data, $ttl ?? self::DEFAULT_TTL);
    }
    
    /**
     * Get cached API response
     */
    public function getCachedApiResponse(string $endpoint, array $params): mixed
    {
        $key = $this->generateCacheKey($endpoint, $params);
        return Cache::get($key);
    }
    
    /**
     * Invalidate cache by pattern
     */
    public function invalidateByPattern(string $pattern): void
    {
        $keys = Redis::keys($pattern);
        if (!empty($keys)) {
            Redis::del($keys);
        }
    }
    
    /**
     * Generate cache key from endpoint and params
     */
    private function generateCacheKey(string $endpoint, array $params): string
    {
        ksort($params);
        return 'api:' . md5($endpoint . json_encode($params));
    }
    
    /**
     * Warm up cache for frequently accessed data
     */
    public function warmUpCache(): void
    {
        // Cache popular users
        // Cache trending posts
        // Cache language data
        // etc.
    }
}
```

---

### 5.2 Database Query Optimization

**Create:** `api/app/Support/Traits/OptimizedQueryTrait.php`
```php
<?php

namespace App\Support\Traits;

use Illuminate\Database\Eloquent\Builder;

trait OptimizedQueryTrait
{
    /**
     * Scope to eager load common relationships
     */
    public function scopeWithCommonRelations(Builder $query): Builder
    {
        return $query->with($this->getCommonRelations());
    }
    
    /**
     * Get common relationships to eager load
     */
    protected function getCommonRelations(): array
    {
        return [];
    }
    
    /**
     * Scope to select only necessary columns
     */
    public function scopeSelectMinimal(Builder $query): Builder
    {
        return $query->select($this->getMinimalColumns());
    }
    
    /**
     * Get minimal columns for list views
     */
    protected function getMinimalColumns(): array
    {
        return ['id', 'created_at', 'updated_at'];
    }
}
```

**Update:** `api/app/Models/User.php`
```php
use App\Support\Traits\OptimizedQueryTrait;

class User extends Authenticatable
{
    use OptimizedQueryTrait;
    
    protected function getCommonRelations(): array
    {
        return ['profile', 'languages.language'];
    }
    
    protected function getMinimalColumns(): array
    {
        return ['id', 'name', 'username', 'email', 'role', 'status', 'created_at'];
    }
}
```

**Create:** Database indexes migration
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Users table indexes
        Schema::table('users', function (Blueprint $table) {
            $table->index('email');
            $table->index('username');
            $table->index(['role', 'status']);
            $table->index('last_seen_at');
        });
        
        // Messages table indexes
        Schema::table('messages', function (Blueprint $table) {
            $table->index('conversation_id');
            $table->index('user_id');
            $table->index(['conversation_id', 'created_at']);
            $table->index('status');
        });
        
        // Conversations table indexes
        Schema::table('conversations', function (Blueprint $table) {
            $table->index('type');
            $table->index('updated_at');
        });
        
        // Calls table indexes
        Schema::table('calls', function (Blueprint $table) {
            $table->index('caller_id');
            $table->index('callee_id');
            $table->index(['status', 'initiated_at']);
        });
        
        // Posts table indexes
        Schema::table('posts', function (Blueprint $table) {
            $table->index('user_id');
            $table->index(['created_at', 'id']);
            $table->fullText('content'); // For search
        });
    }
    
    public function down(): void
    {
        // Drop indexes
    }
};
```

---

### 5.3 API Response Caching Middleware

**Create:** `api/app/Http/Middleware/CacheResponseMiddleware.php`
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

class CacheResponseMiddleware
{
    private const CACHE_TTL = 300; // 5 minutes
    
    public function handle(Request $request, Closure $next, ?int $ttl = null): Response
    {
        // Only cache GET requests
        if ($request->method() !== 'GET') {
            return $next($request);
        }
        
        // Don't cache authenticated user-specific data
        if ($request->user()) {
            return $next($request);
        }
        
        $cacheKey = $this->getCacheKey($request);
        
        // Return cached response if exists
        if (Cache::has($cacheKey)) {
            $cachedResponse = Cache::get($cacheKey);
            return response()->json($cachedResponse)
                ->header('X-Cache', 'HIT');
        }
        
        $response = $next($request);
        
        // Cache successful responses
        if ($response->isSuccessful()) {
            Cache::put($cacheKey, $response->getData(), $ttl ?? self::CACHE_TTL);
        }
        
        return $response->header('X-Cache', 'MISS');
    }
    
    private function getCacheKey(Request $request): string
    {
        return 'api_response:' . md5($request->fullUrl());
    }
}
```

---

## 🐳 PHASE 6: DEVOPS & DEPLOYMENT

### 6.1 Docker Configuration

**Create:** `api/Dockerfile`
```dockerfile
# Multi-stage build for production
FROM php:8.2-fpm-alpine AS base

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    mysql-client \
    nginx \
    supervisor

# Install PHP extensions
RUN docker-php-ext-install pdo pdo_mysql zip gd opcache

# Install Redis extension
RUN pecl install redis && docker-php-ext-enable redis

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

# Production stage
FROM base AS production

# Copy nginx configuration
COPY docker/nginx/nginx.conf /etc/nginx/nginx.conf
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy supervisor configuration
COPY docker/supervisor/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Copy PHP configuration
COPY docker/php/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Expose port
EXPOSE 80

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
```

**Create:** `docker-compose.yml`
```yaml
version: '3.8'

services:
  app:
    build:
      context: ./api
      dockerfile: Dockerfile
      target: production
    container_name: banitalk_app
    restart: unless-stopped
    working_dir: /var/www/html
    volumes:
      - ./api:/var/www/html
      - ./api/storage:/var/www/html/storage
    networks:
      - banitalk
    environment:
      - APP_ENV=production
      - APP_DEBUG=false
      - DB_HOST=mysql
      - REDIS_HOST=redis
      - QUEUE_CONNECTION=redis
      - CACHE_DRIVER=redis
    depends_on:
      - mysql
      - redis

  mysql:
    image: mysql:8.0
    container_name: banitalk_mysql
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: ${DB_DATABASE}
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_USER: ${DB_USERNAME}
      MYSQL_PASSWORD: ${DB_PASSWORD}
    volumes:
      - mysql_data:/var/lib/mysql
      - ./docker/mysql/my.cnf:/etc/mysql/conf.d/my.cnf
    networks:
      - banitalk
    ports:
      - "3306:3306"

  redis:
    image: redis:7-alpine
    container_name: banitalk_redis
    restart: unless-stopped
    command: redis-server --appendonly yes --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - banitalk
    ports:
      - "6379:6379"

  nginx:
    image: nginx:alpine
    container_name: banitalk_nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./api:/var/www/html
      - ./docker/nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./docker/nginx/conf.d:/etc/nginx/conf.d
      - ./docker/nginx/ssl:/etc/nginx/ssl
    networks:
      - banitalk
    depends_on:
      - app

  dashboard:
    build:
      context: ./dashboard
      dockerfile: Dockerfile
    container_name: banitalk_dashboard
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_API_URL=https://api.banitalk.com/api/v1
    networks:
      - banitalk

networks:
  banitalk:
    driver: bridge

volumes:
  mysql_data:
  redis_data:
```

---

*Continued in ENTERPRISE_AUDIT_REPORT_PART4.md...*
