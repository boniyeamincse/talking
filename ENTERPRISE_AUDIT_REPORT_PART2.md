# 🏢 ENTERPRISE AUDIT REPORT - PART 2
## Architecture Redesign & Solutions

---

## 🏗️ PHASE 2: ENTERPRISE FOLDER STRUCTURE REDESIGN

### 2.1 BACKEND (Laravel) - Clean Architecture

```
api/
├── app/
│   ├── Core/                          # Core business logic
│   │   ├── Domain/                    # Domain entities
│   │   │   ├── Entities/
│   │   │   ├── ValueObjects/
│   │   │   └── Exceptions/
│   │   ├── UseCases/                  # Application business rules
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   ├── Chat/
│   │   │   └── Call/
│   │   └── Contracts/                 # Interfaces
│   │       ├── Repositories/
│   │       └── Services/
│   │
│   ├── Infrastructure/                # External concerns
│   │   ├── Persistence/
│   │   │   ├── Eloquent/
│   │   │   │   ├── Models/
│   │   │   │   └── Repositories/
│   │   │   └── Migrations/
│   │   ├── External/
│   │   │   ├── Translation/
│   │   │   ├── Payment/
│   │   │   └── Notification/
│   │   ├── Broadcasting/
│   │   └── Cache/
│   │
│   ├── Presentation/                  # HTTP layer
│   │   ├── Http/
│   │   │   ├── Controllers/
│   │   │   │   ├── Api/
│   │   │   │   │   ├── V1/
│   │   │   │   │   │   ├── Auth/
│   │   │   │   │   │   ├── User/
│   │   │   │   │   │   ├── Chat/
│   │   │   │   │   │   ├── Call/
│   │   │   │   │   │   └── Admin/
│   │   │   │   │   └── V2/          # Future API version
│   │   │   │   └── Web/
│   │   │   ├── Middleware/
│   │   │   │   ├── Auth/
│   │   │   │   ├── RateLimit/
│   │   │   │   └── Security/
│   │   │   ├── Requests/
│   │   │   │   ├── Auth/
│   │   │   │   ├── User/
│   │   │   │   └── Validators/
│   │   │   ├── Resources/
│   │   │   │   ├── User/
│   │   │   │   ├── Chat/
│   │   │   │   └── Collections/
│   │   │   └── Responses/
│   │   │       ├── ApiResponse.php
│   │   │       └── ErrorResponse.php
│   │   └── Console/
│   │       └── Commands/
│   │
│   ├── Application/                   # Application services
│   │   ├── Services/
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   ├── Chat/
│   │   │   ├── Call/
│   │   │   └── Admin/
│   │   ├── DTOs/                      # Data Transfer Objects
│   │   │   ├── Auth/
│   │   │   ├── User/
│   │   │   └── Chat/
│   │   ├── Events/
│   │   ├── Listeners/
│   │   ├── Jobs/
│   │   └── Notifications/
│   │
│   ├── Support/                       # Shared utilities
│   │   ├── Helpers/
│   │   ├── Traits/
│   │   ├── Enums/
│   │   └── Constants/
│   │
│   └── Providers/
│
├── bootstrap/
├── config/
│   ├── app.php
│   ├── auth.php
│   ├── cache.php
│   ├── database.php
│   ├── security.php                   # NEW: Security config
│   └── services.php
│
├── database/
│   ├── factories/
│   ├── migrations/
│   ├── seeders/
│   └── seeds/                         # Production seeds
│
├── routes/
│   ├── api/
│   │   ├── v1.php
│   │   └── v2.php
│   ├── web.php
│   ├── channels.php
│   └── console.php
│
├── storage/
│   ├── app/
│   │   ├── public/
│   │   ├── private/
│   │   └── temp/
│   ├── framework/
│   ├── logs/
│   └── backups/                       # NEW: Backup storage
│
├── tests/
│   ├── Unit/
│   │   ├── Core/
│   │   ├── Application/
│   │   └── Infrastructure/
│   ├── Feature/
│   │   ├── Api/
│   │   └── Auth/
│   ├── Integration/
│   └── E2E/
│
├── docker/                            # NEW: Docker configs
│   ├── php/
│   ├── nginx/
│   ├── mysql/
│   └── redis/
│
├── .github/                           # NEW: CI/CD
│   └── workflows/
│       ├── tests.yml
│       ├── deploy.yml
│       └── security-scan.yml
│
├── docs/                              # NEW: Documentation
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
├── .env.example
├── .env.testing
├── docker-compose.yml
├── Dockerfile
├── phpunit.xml
└── README.md
```

---

### 2.2 FRONTEND DASHBOARD (Next.js) - Feature-Based Architecture

```
dashboard/
├── src/
│   ├── app/                           # Next.js 13+ App Router
│   │   ├── (auth)/                    # Auth layout group
│   │   │   ├── login/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/               # Dashboard layout group
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── users/
│   │   │   ├── reports/
│   │   │   ├── analytics/
│   │   │   ├── settings/
│   │   │   └── admins/
│   │   ├── api/                       # API routes (BFF pattern)
│   │   │   ├── auth/
│   │   │   └── proxy/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   └── globals.css
│   │
│   ├── features/                      # Feature modules
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── utils/
│   │   ├── users/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   └── types/
│   │   ├── reports/
│   │   ├── analytics/
│   │   └── settings/
│   │
│   ├── shared/                        # Shared resources
│   │   ├── components/
│   │   │   ├── ui/                    # Base UI components
│   │   │   ├── layout/
│   │   │   ├── forms/
│   │   │   └── data-display/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── types/
│   │   └── constants/
│   │
│   ├── lib/                           # Core libraries
│   │   ├── api/
│   │   │   ├── client.ts
│   │   │   ├── endpoints/
│   │   │   └── interceptors/
│   │   ├── auth/
│   │   │   ├── context.tsx
│   │   │   ├── provider.tsx
│   │   │   └── hooks.ts
│   │   ├── store/                     # State management
│   │   │   ├── slices/
│   │   │   └── index.ts
│   │   └── utils/
│   │
│   ├── styles/
│   │   ├── globals.css
│   │   └── themes/
│   │
│   └── config/
│       ├── env.ts
│       ├── routes.ts
│       └── constants.ts
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── .env.local.example
├── .env.production
├── next.config.ts
├── tsconfig.json
├── tailwind.config.ts
├── Dockerfile
└── README.md
```

---

### 2.3 MOBILE APP (Flutter) - Clean Architecture

```
apk/
├── lib/
│   ├── core/                          # Core functionality
│   │   ├── di/                        # Dependency Injection
│   │   │   ├── service_locator.dart
│   │   │   └── modules/
│   │   ├── network/
│   │   │   ├── api_client.dart
│   │   │   ├── interceptors/
│   │   │   ├── error_handler.dart
│   │   │   └── network_info.dart
│   │   ├── storage/
│   │   │   ├── secure_storage.dart
│   │   │   └── local_storage.dart
│   │   ├── routing/
│   │   │   ├── app_router.dart
│   │   │   └── route_guards.dart
│   │   ├── theme/
│   │   │   ├── app_theme.dart
│   │   │   ├── colors.dart
│   │   │   └── typography.dart
│   │   ├── config/
│   │   │   ├── env_config.dart
│   │   │   └── app_config.dart
│   │   ├── utils/
│   │   │   ├── validators.dart
│   │   │   ├── formatters.dart
│   │   │   └── extensions/
│   │   ├── constants/
│   │   └── errors/
│   │       ├── exceptions.dart
│   │       └── failures.dart
│   │
│   ├── features/                      # Feature modules
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   │   ├── datasources/
│   │   │   │   │   ├── auth_remote_datasource.dart
│   │   │   │   │   └── auth_local_datasource.dart
│   │   │   │   ├── models/
│   │   │   │   │   ├── user_model.dart
│   │   │   │   │   └── token_model.dart
│   │   │   │   └── repositories/
│   │   │   │       └── auth_repository_impl.dart
│   │   │   ├── domain/
│   │   │   │   ├── entities/
│   │   │   │   │   └── user.dart
│   │   │   │   ├── repositories/
│   │   │   │   │   └── auth_repository.dart
│   │   │   │   └── usecases/
│   │   │   │       ├── login.dart
│   │   │   │       ├── register.dart
│   │   │   │       └── logout.dart
│   │   │   └── presentation/
│   │   │       ├── bloc/
│   │   │       │   ├── auth_bloc.dart
│   │   │       │   ├── auth_event.dart
│   │   │       │   └── auth_state.dart
│   │   │       ├── pages/
│   │   │       │   ├── login_page.dart
│   │   │       │   └── register_page.dart
│   │   │       └── widgets/
│   │   │
│   │   ├── chat/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── call/
│   │   ├── profile/
│   │   ├── social_feed/
│   │   ├── voice_room/
│   │   ├── gifts/
│   │   └── matching/
│   │
│   ├── shared/                        # Shared widgets/components
│   │   ├── widgets/
│   │   │   ├── buttons/
│   │   │   ├── inputs/
│   │   │   ├── cards/
│   │   │   └── dialogs/
│   │   ├── models/
│   │   └── utils/
│   │
│   └── main.dart
│
├── android/
│   ├── app/
│   │   ├── src/
│   │   │   ├── main/
│   │   │   ├── dev/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── build.gradle
│   └── gradle/
│
├── ios/
│   ├── Runner/
│   └── Podfile
│
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
│
├── assets/
│   ├── images/
│   ├── icons/
│   ├── fonts/
│   └── translations/
│
├── .env.dev
├── .env.staging
├── .env.prod
├── pubspec.yaml
├── analysis_options.yaml
└── README.md
```

---

## 🔧 PHASE 3: CRITICAL FIXES WITH CODE EXAMPLES

### 3.1 Security Hardening

#### Fix 1: Environment Configuration Management

**Create:** `api/.env.example`
```env
APP_NAME=BaniTalk
APP_ENV=production
APP_KEY=
APP_DEBUG=false
APP_URL=https://api.banitalk.com

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=banitalk_prod
DB_USERNAME=
DB_PASSWORD=

# Security
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=strict
SANCTUM_STATEFUL_DOMAINS=dashboard.banitalk.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_LOGIN_ATTEMPTS=5

# External Services
GOOGLE_TRANSLATE_API_KEY=
STRIPE_SECRET_KEY=
FCM_SERVER_KEY=

# CORS
FRONTEND_URL=https://dashboard.banitalk.com
MOBILE_APP_URL=https://app.banitalk.com
```

**Update:** `api/.gitignore`
```gitignore
.env
.env.backup
.env.production
.env.local
*.key
*.pem
```

---

#### Fix 2: Strong Password Policy

**Update:** `api/app/Http/Requests/Auth/RegisterRequest.php`
```php
<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'username' => [
                'required',
                'string',
                'min:3',
                'max:50',
                'unique:users',
                'alpha_dash',
                'regex:/^[a-zA-Z0-9_-]+$/'
            ],
            'email' => [
                'required',
                'email:rfc,dns',
                'max:255',
                'unique:users',
                'regex:/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/'
            ],
            'password' => [
                'required',
                'string',
                'min:12',
                'confirmed',
                Password::min(12)
                    ->mixedCase()
                    ->letters()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(3) // Check against data breaches
            ],
            'country_code' => ['nullable', 'string', 'size:2', 'regex:/^[A-Z]{2}$/'],
            'native_language' => ['required', 'string', 'exists:languages,code'],
            'learning_language' => ['nullable', 'string', 'exists:languages,code'],
        ];
    }

    public function messages(): array
    {
        return [
            'username.alpha_dash' => 'Username can only contain letters, numbers, dashes and underscores.',
            'username.regex' => 'Username contains invalid characters.',
            'email.email' => 'Please provide a valid email address.',
            'password.min' => 'Password must be at least 12 characters long.',
            'password.mixed_case' => 'Password must contain both uppercase and lowercase letters.',
            'password.symbols' => 'Password must contain at least one special character.',
            'password.uncompromised' => 'This password has been compromised in a data breach. Please choose a different password.',
            'native_language.exists' => 'The selected native language is invalid.',
            'learning_language.exists' => 'The selected learning language is invalid.',
        ];
    }
}
```

---

#### Fix 3: Input Sanitization & XSS Protection

**Create:** `api/app/Support/Helpers/SecurityHelper.php`
```php
<?php

namespace App\Support\Helpers;

use HTMLPurifier;
use HTMLPurifier_Config;

class SecurityHelper
{
    /**
     * Sanitize HTML content to prevent XSS
     */
    public static function sanitizeHtml(string $content): string
    {
        $config = HTMLPurifier_Config::createDefault();
        $config->set('HTML.Allowed', 'p,b,i,u,a[href],br,strong,em');
        $config->set('AutoFormat.RemoveEmpty', true);
        
        $purifier = new HTMLPurifier($config);
        return $purifier->purify($content);
    }

    /**
     * Sanitize plain text (strip all HTML)
     */
    public static function sanitizeText(string $text): string
    {
        return strip_tags($text);
    }

    /**
     * Validate and sanitize URL
     */
    public static function sanitizeUrl(string $url): ?string
    {
        $url = filter_var($url, FILTER_SANITIZE_URL);
        
        if (filter_var($url, FILTER_VALIDATE_URL) === false) {
            return null;
        }
        
        // Only allow http and https protocols
        $parsed = parse_url($url);
        if (!in_array($parsed['scheme'] ?? '', ['http', 'https'])) {
            return null;
        }
        
        return $url;
    }

    /**
     * Generate secure random token
     */
    public static function generateSecureToken(int $length = 32): string
    {
        return bin2hex(random_bytes($length));
    }
}
```

**Update:** `api/app/Services/MessageService.php`
```php
use App\Support\Helpers\SecurityHelper;

public function sendMessage(
    Conversation $conversation,
    User $sender,
    string $content,
    ?int $parentMessageId = null
): Message {
    // ... existing validation ...

    // Sanitize content
    $sanitizedContent = SecurityHelper::sanitizeText($content);
    
    if (trim($sanitizedContent) === '') {
        throw ValidationException::withMessages([
            'content' => ['Message content cannot be empty.']
        ]);
    }

    return DB::transaction(function () use ($conversation, $sender, $sanitizedContent, $parentMessageId) {
        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id' => $sender->id,
            'parent_message_id' => $parentMessageId,
            'content' => $sanitizedContent,
            'type' => 'text',
            'status' => 'sent',
        ]);

        // ... rest of the method ...
    });
}
```

---

#### Fix 4: Comprehensive Rate Limiting

**Create:** `api/app/Http/Middleware/RateLimitMiddleware.php`
```php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class RateLimitMiddleware
{
    public function handle(Request $request, Closure $next, string $limit = '60:1'): Response
    {
        [$maxAttempts, $decayMinutes] = explode(':', $limit);
        
        $key = $this->resolveRequestSignature($request);
        
        if (RateLimiter::tooManyAttempts($key, $maxAttempts)) {
            $seconds = RateLimiter::availableIn($key);
            
            return response()->json([
                'success' => false,
                'message' => 'Too many requests. Please try again later.',
                'retry_after' => $seconds,
            ], 429);
        }
        
        RateLimiter::hit($key, $decayMinutes * 60);
        
        $response = $next($request);
        
        return $response->withHeaders([
            'X-RateLimit-Limit' => $maxAttempts,
            'X-RateLimit-Remaining' => RateLimiter::remaining($key, $maxAttempts),
        ]);
    }
    
    protected function resolveRequestSignature(Request $request): string
    {
        if ($user = $request->user()) {
            return 'user:' . $user->id . ':' . $request->path();
        }
        
        return 'ip:' . $request->ip() . ':' . $request->path();
    }
}
```

**Update:** `api/routes/api.php`
```php
// Apply rate limiting to all API routes
Route::prefix('v1')->middleware(['throttle:api'])->group(function () {
    
    // Public routes with stricter limits
    Route::prefix('auth')->middleware(['throttle:auth'])->group(function () {
        Route::post('register', [AuthController::class, 'register']);
        Route::post('login', [AuthController::class, 'login']);
        Route::post('forgot-password', [AuthController::class, 'forgotPassword']);
        Route::post('reset-password', [AuthController::class, 'resetPassword']);
    });

    // Protected routes
    Route::middleware(['auth:sanctum', 'throttle:authenticated'])->group(function () {
        // ... existing routes ...
    });
});
```

**Update:** `api/app/Providers/AppServiceProvider.php`
```php
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\RateLimiter;

public function boot(): void
{
    // API rate limits
    RateLimiter::for('api', function (Request $request) {
        return Limit::perMinute(60)->by($request->user()?->id ?: $request->ip());
    });
    
    // Auth endpoints - stricter limits
    RateLimiter::for('auth', function (Request $request) {
        return Limit::perMinute(5)->by($request->ip());
    });
    
    // Authenticated users - higher limits
    RateLimiter::for('authenticated', function (Request $request) {
        return Limit::perMinute(120)->by($request->user()->id);
    });
}
```

---

*Continued in ENTERPRISE_AUDIT_REPORT_PART3.md...*
