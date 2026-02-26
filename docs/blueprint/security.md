# 🔐 Security Requirements – Talkin

## Security Overview

Talkin handles sensitive personal data, real-time communications, and financial transactions (virtual coin purchases). Security is a core engineering requirement — not an afterthought.

---

## Authentication & Authorization

### JWT Authentication

- All API endpoints (except auth endpoints) require a valid `Bearer` JWT token
- Tokens issued at login with a short expiry (e.g., 60 minutes)
- Refresh tokens stored securely (HttpOnly cookie or encrypted local storage)
- Token revocation list maintained in Redis for logout/ban scenarios

```
Authorization: Bearer <jwt_token>
```

### Laravel Sanctum (Alternative / API Tokens)
- Used for personal access tokens for API integrations
- Token hashing with bcrypt before storage
- Per-token ability scopes (e.g., `read:messages`, `send:gift`)

### Role-Based Access Control (RBAC)

- All routes protected by middleware checking `role` field
- Admin routes reject non-admin users with `403 Forbidden`
- Resource ownership checks on write operations (user can only edit own posts)

```php
// Example middleware usage
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::get('/admin/users', [AdminController::class, 'users']);
});
```

---

## API Rate Limiting

Rate limiting protects against brute force, scraping, and abuse.

| Endpoint Group | Limit | Window |
|---|---|---|
| Auth (login/register) | 10 requests | 1 minute per IP |
| Message sending | 60 messages | 1 minute per user |
| Gift sending | 20 gifts | 1 minute per user |
| Translation API calls | 100 requests | 1 minute per user |
| Media uploads | 10 uploads | 1 minute per user |
| Match requests | 10 requests | 1 day per user |
| General API | 300 requests | 1 minute per user |

Exceeded rate limits return `429 Too Many Requests`.

---

## End-to-End Encryption (E2EE)

### Chat Messages

- Messages encrypted on the client before transmission
- Server stores ciphertext only; cannot read message content
- Keys derived from user keypairs (ECDH key exchange)
- Forward secrecy: rotate session keys periodically

```
Client A                          Server                         Client B
   │                               │                               │
   │── Generate shared key ────────┤                               │
   │── Encrypt message ────────────┤                               │
   │── Send ciphertext ───────────►│                               │
   │                               │──── Relay ciphertext ────────►│
   │                               │                    Client B decrypts│
```

### Voice & Video Calls
- DTLS-SRTP encryption for WebRTC media streams (built-in)
- Signaling channel encrypted via HTTPS/WSS
- TURN server credentials rotated regularly

---

## Media Access Control

- All media files stored in private S3 buckets (no public ACL)
- Access via time-limited pre-signed URLs (expire in 15–60 minutes)
- URL generation gated behind authenticated API calls
- Media tied to a user; only accessible by conversation participants

```php
// Generate pre-signed URL (Laravel)
$url = Storage::temporaryUrl(
    $path, 
    now()->addMinutes(30)
);
```

---

## DDoS Protection

| Layer | Protection |
|---|---|
| DNS | Cloudflare proxy (absorbs volumetric attacks) |
| HTTP | Cloudflare WAF + rate limiting |
| API | Laravel rate limiter (per IP + per user) |
| WebSocket | Connection limits + auth required |
| Infrastructure | Cloud provider DDoS mitigation |

---

## Input Validation & Injection Prevention

### All API Inputs
- Server-side validation on every endpoint using Laravel Form Requests
- Sanitize user-generated HTML before storage (strip scripts/iframes)
- Database queries use Eloquent ORM (parameterized queries by default)
- File upload validation: type, size, MIME verification

```php
class SendMessageRequest extends FormRequest {
    public function rules(): array {
        return [
            'body'    => ['required', 'string', 'max:5000'],
            'type'    => ['required', 'in:text,image,video,audio'],
            'media'   => ['nullable', 'file', 'max:51200', 'mimes:jpg,png,mp4,mp3'],
        ];
    }
}
```

### XSS Prevention
- Escape all user content in frontend templates
- Content Security Policy (CSP) headers set
- No `dangerouslySetInnerHTML` without sanitization in React

### CSRF Protection
- Laravel CSRF middleware enabled on all state-changing requests
- SPA uses Authorization header (not cookies) → CSRF less relevant, but headers set

---

## Secure WebRTC Signaling

- Signaling WebSocket requires authenticated connection (JWT validated on connect)
- ICE candidate messages validated against session
- TURN server credentials issued per-session, time-limited
- Signaling messages include session ID to prevent message injection

---

## Password Security

- Passwords hashed with `bcrypt` (cost factor ≥ 12)
- Minimum password requirements: 8 chars, mixed case + number
- Password reset tokens: cryptographically random, expire in 60 minutes, single-use
- Failed login attempts tracked; account locked after 5 failed attempts

---

## Data Privacy

- Personal data stored encrypted at rest (database encryption)
- PII fields (email, phone) stored encrypted
- Users can request full data export (GDPR compliance)
- Users can delete their account and all associated data
- Data retention policy: deleted account data purged within 30 days

---

## Audit Logging

All sensitive actions are logged:

| Action | Logged Fields |
|---|---|
| Login / Logout | user_id, IP, device, timestamp |
| Failed Login | IP, username_attempted, timestamp |
| Account Ban/Suspend | admin_id, user_id, reason, duration |
| Admin Impersonation | admin_id, target_user_id, timestamp |
| Report Resolution | admin_id, report_id, action taken |
| Coin Transactions | user_id, amount, type, timestamp |

---

## Security Headers (HTTP)

All API and web responses must include:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000; includeSubDomains
Content-Security-Policy: default-src 'self'; ...
Referrer-Policy: strict-origin-when-cross-origin
```

---

## Dependency Security

- `composer audit` run in CI/CD on every build
- `npm audit` run on frontend builds
- Automated Dependabot PRs for dependency updates
- No unmaintained packages in production dependencies

---

## Vulnerability Response

1. Security issues reported to `security@talkin.app`
2. 48-hour acknowledgment SLA
3. Critical issues patched within 72 hours
4. CVE assigned if applicable
5. Post-incident report published (within 2 weeks)
