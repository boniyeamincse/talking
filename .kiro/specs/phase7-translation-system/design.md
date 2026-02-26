# Design Document: Phase 7 - Translation System

## Overview

The Translation System provides AI-powered real-time translation capabilities for the Talkin platform, enabling users to communicate across 180+ language barriers. The system integrates with Google Translate API (or compatible alternative like DeepL or AWS Translate), implements a two-tier caching strategy (Redis + MySQL) for performance and cost optimization, and provides automatic language detection and batch processing capabilities.

The architecture follows Laravel best practices with dedicated service classes, API resources, and queue-based processing. The system integrates seamlessly with existing Phase 3 chat messages and Phase 6 social posts while providing standalone translation capabilities for arbitrary text.

Key design decisions:
- Two-tier caching (Redis for speed, MySQL for persistence) to minimize API costs
- Queue-based batch processing for non-urgent translations
- WebSocket integration for real-time auto-translate delivery
- Quality scoring to help users assess translation reliability
- Rate limiting to prevent abuse and control costs

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Translation System                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐      ┌──────────────────┐            │
│  │  Translation     │      │  Language        │            │
│  │  Controller      │      │  Controller      │            │
│  └────────┬─────────┘      └────────┬─────────┘            │
│           │                          │                       │
│           ▼                          ▼                       │
│  ┌──────────────────────────────────────────┐              │
│  │      TranslationService                   │              │
│  │  - translate()                            │              │
│  │  - translateMessage()                     │              │
│  │  - translatePost()                        │              │
│  │  - detectLanguage()                       │              │
│  │  - queueTranslation()                     │              │
│  └────────┬─────────────────────────────────┘              │
│           │                                                  │
│           ├──────────┬──────────┬──────────┐               │
│           ▼          ▼          ▼          ▼               │
│  ┌────────────┐ ┌────────┐ ┌────────┐ ┌────────────┐     │
│  │ Translation│ │ Cache  │ │ Queue  │ │ Provider   │     │
│  │ Provider   │ │ Service│ │ Service│ │ Adapter    │     │
│  │ Adapter    │ │        │ │        │ │ Interface  │     │
│  └────────────┘ └───┬────┘ └────────┘ └─────┬──────┘     │
│                     │                         │             │
│                     ▼                         ▼             │
│            ┌─────────────┐         ┌──────────────────┐   │
│            │   Redis     │         │  Google Translate│   │
│            │   Cache     │         │  API / DeepL /   │   │
│            └─────────────┘         │  AWS Translate   │   │
│            ┌─────────────┐         └──────────────────┘   │
│            │   MySQL     │                                 │
│            │   Cache     │                                 │
│            └─────────────┘                                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Translation Request Flow**:
   - User requests translation via API endpoint
   - Controller validates request and authorization
   - Service checks Redis cache → MySQL cache → Provider API
   - Result cached in both layers and returned to user

2. **Auto-Translate Flow**:
   - Message received event triggers auto-translate check
   - Job queued for users with auto-translate enabled
   - Translation performed asynchronously
   - Result broadcast via WebSocket to user

3. **Batch Processing Flow**:
   - Multiple translations queued via batch endpoint
   - Queue worker processes in batches of 10
   - Results cached and notifications sent

## Components and Interfaces

### TranslationService

Primary service class handling all translation operations.

```php
class TranslationService
{
    public function __construct(
        TranslationProviderInterface $provider,
        TranslationCacheService $cache,
        LanguageDetectionService $detector
    ) {}

    /**
     * Translate arbitrary text
     * 
     * @param string $text Text to translate (max 5000 chars)
     * @param string $targetLanguage ISO 639-1 language code
     * @param string|null $sourceLanguage Optional source language
     * @return TranslationResult
     * @throws TranslationException
     */
    public function translate(
        string $text,
        string $targetLanguage,
        ?string $sourceLanguage = null
    ): TranslationResult;

    /**
     * Translate a chat message
     * 
     * @param Message $message Message to translate
     * @param User $user User requesting translation
     * @param string $targetLanguage Target language code
     * @return TranslationResult
     * @throws AuthorizationException
     */
    public function translateMessage(
        Message $message,
        User $user,
        string $targetLanguage
    ): TranslationResult;

    /**
     * Translate a social post
     * 
     * @param Post $post Post to translate
     * @param User $user User requesting translation
     * @param string $targetLanguage Target language code
     * @return TranslationResult
     * @throws AuthorizationException
     */
    public function translatePost(
        Post $post,
        User $user,
        string $targetLanguage
    ): TranslationResult;

    /**
     * Detect language of text
     * 
     * @param string $text Text to analyze
     * @return LanguageDetectionResult
     */
    public function detectLanguage(string $text): LanguageDetectionResult;

    /**
     * Queue translation for batch processing
     * 
     * @param string $text Text to translate
     * @param string $targetLanguage Target language
     * @param string|null $sourceLanguage Optional source language
     * @return string Job ID for tracking
     */
    public function queueTranslation(
        string $text,
        string $targetLanguage,
        ?string $sourceLanguage = null
    ): string;

    /**
     * Get supported languages
     * 
     * @return array<string, string> Language code => name pairs
     */
    public function getSupportedLanguages(): array;
}
```

### TranslationProviderInterface

Abstraction for translation API providers (Google, DeepL, AWS).

```php
interface TranslationProviderInterface
{
    /**
     * Translate text from source to target language
     * 
     * @param string $text Text to translate
     * @param string $targetLanguage Target language code
     * @param string $sourceLanguage Source language code
     * @return ProviderTranslationResult
     * @throws ProviderException
     */
    public function translate(
        string $text,
        string $targetLanguage,
        string $sourceLanguage
    ): ProviderTranslationResult;

    /**
     * Detect language of text
     * 
     * @param string $text Text to analyze
     * @return ProviderDetectionResult
     * @throws ProviderException
     */
    public function detectLanguage(string $text): ProviderDetectionResult;

    /**
     * Get list of supported languages
     * 
     * @return array<string, string> Language code => name pairs
     */
    public function getSupportedLanguages(): array;

    /**
     * Batch translate multiple texts
     * 
     * @param array $requests Array of translation requests
     * @return array<ProviderTranslationResult>
     * @throws ProviderException
     */
    public function batchTranslate(array $requests): array;
}
```

### TranslationCacheService

Manages two-tier caching strategy (Redis + MySQL).

```php
class TranslationCacheService
{
    /**
     * Get cached translation
     * 
     * @param string $cacheKey Unique key for translation
     * @return CachedTranslation|null
     */
    public function get(string $cacheKey): ?CachedTranslation;

    /**
     * Store translation in cache
     * 
     * @param string $cacheKey Unique key
     * @param TranslationResult $result Translation to cache
     * @param int $ttl Time to live in seconds (Redis only)
     * @return void
     */
    public function put(
        string $cacheKey,
        TranslationResult $result,
        int $ttl = 604800
    ): void;

    /**
     * Generate cache key from translation parameters
     * 
     * @param string $text Source text
     * @param string $sourceLanguage Source language code
     * @param string $targetLanguage Target language code
     * @return string Cache key
     */
    public function generateKey(
        string $text,
        string $sourceLanguage,
        string $targetLanguage
    ): string;

    /**
     * Delete cached translations for specific content
     * 
     * @param string $contentType Type: 'message' or 'post'
     * @param int $contentId ID of message or post
     * @return int Number of translations deleted
     */
    public function deleteForContent(string $contentType, int $contentId): int;
}
```

### GoogleTranslateProvider

Concrete implementation for Google Translate API.

```php
class GoogleTranslateProvider implements TranslationProviderInterface
{
    private Google\Cloud\Translate\V2\TranslateClient $client;

    public function __construct()
    {
        $this->client = new TranslateClient([
            'key' => config('services.google_translate.api_key')
        ]);
    }

    public function translate(
        string $text,
        string $targetLanguage,
        string $sourceLanguage
    ): ProviderTranslationResult;

    public function detectLanguage(string $text): ProviderDetectionResult;

    public function getSupportedLanguages(): array;

    public function batchTranslate(array $requests): array;
}
```

### TranslationController

REST API controller for translation endpoints.

```php
class TranslationController extends BaseController
{
    /**
     * GET /api/translations/message/{id}
     * Translate a chat message
     */
    public function translateMessage(
        Request $request,
        int $messageId
    ): JsonResponse;

    /**
     * GET /api/translations/post/{id}
     * Translate a social post
     */
    public function translatePost(
        Request $request,
        int $postId
    ): JsonResponse;

    /**
     * POST /api/translations/text
     * Translate arbitrary text
     */
    public function translateText(Request $request): JsonResponse;

    /**
     * POST /api/translations/batch
     * Queue multiple translations for batch processing
     */
    public function batchTranslate(Request $request): JsonResponse;

    /**
     * GET /api/translations/job/{jobId}
     * Get status of queued translation
     */
    public function getJobStatus(string $jobId): JsonResponse;
}
```

### LanguageController

Controller for language-related endpoints.

```php
class LanguageController extends BaseController
{
    /**
     * GET /api/translations/languages
     * Get list of supported languages
     */
    public function index(): JsonResponse;

    /**
     * POST /api/translations/detect
     * Detect language of text
     */
    public function detect(Request $request): JsonResponse;
}
```

### TranslateMessageJob

Queue job for asynchronous message translation (auto-translate).

```php
class TranslateMessageJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private int $messageId,
        private int $userId,
        private string $targetLanguage
    ) {}

    /**
     * Execute the job
     * Translates message and broadcasts result via WebSocket
     */
    public function handle(TranslationService $service): void;
}
```

### BatchTranslateJob

Queue job for batch translation processing.

```php
class BatchTranslateJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(
        private string $jobId,
        private array $translationRequests
    ) {}

    /**
     * Execute the job
     * Processes up to 10 translations in batch
     */
    public function handle(TranslationService $service): void;
}
```

## Data Models

### Translation Cache Table (MySQL)

Persistent storage for translation cache.

```php
Schema::create('translation_cache', function (Blueprint $table) {
    $table->id();
    $table->string('cache_key', 64)->unique(); // Hash of text + languages
    $table->text('source_text');
    $table->text('translated_text');
    $table->string('source_language', 10);
    $table->string('target_language', 10);
    $table->integer('quality_score')->nullable();
    $table->string('provider', 50)->default('google');
    $table->timestamps();
    
    // Indexes for efficient lookup
    $table->index('cache_key');
    $table->index(['source_language', 'target_language']);
    $table->index('created_at');
});
```

### Translation Logs Table

Analytics and usage tracking.

```php
Schema::create('translation_logs', function (Blueprint $table) {
    $table->id();
    $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
    $table->string('source_language', 10);
    $table->string('target_language', 10);
    $table->integer('character_count');
    $table->boolean('cache_hit')->default(false);
    $table->string('content_type', 20)->nullable(); // 'message', 'post', 'text'
    $table->unsignedBigInteger('content_id')->nullable();
    $table->decimal('estimated_cost', 10, 6)->nullable();
    $table->timestamp('created_at');
    
    // Indexes for analytics queries
    $table->index('user_id');
    $table->index(['source_language', 'target_language']);
    $table->index('created_at');
    $table->index('cache_hit');
});
```

### User Preferences Extension

Add translation preferences to users table.

```php
Schema::table('users', function (Blueprint $table) {
    $table->string('preferred_language', 10)->default('en');
    $table->boolean('auto_translate_enabled')->default(false);
});
```

### Translation Jobs Table

Track batch translation jobs.

```php
Schema::create('translation_jobs', function (Blueprint $table) {
    $table->string('job_id', 36)->primary(); // UUID
    $table->foreignId('user_id')->constrained()->cascadeOnDelete();
    $table->integer('total_requests');
    $table->integer('completed_requests')->default(0);
    $table->string('status', 20)->default('pending'); // pending, processing, completed, failed
    $table->json('results')->nullable();
    $table->timestamps();
    
    $table->index('user_id');
    $table->index('status');
});
```

### Data Transfer Objects

```php
class TranslationResult
{
    public function __construct(
        public string $originalText,
        public string $translatedText,
        public string $sourceLanguage,
        public string $targetLanguage,
        public int $qualityScore,
        public bool $fromCache,
        public Carbon $timestamp
    ) {}
}

class LanguageDetectionResult
{
    public function __construct(
        public string $languageCode,
        public string $languageName,
        public float $confidence
    ) {}
}

class ProviderTranslationResult
{
    public function __construct(
        public string $translatedText,
        public string $detectedSourceLanguage,
        public ?int $qualityScore = null
    ) {}
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

