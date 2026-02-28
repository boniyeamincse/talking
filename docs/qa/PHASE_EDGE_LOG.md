# Edge Cases & Error Handling QA Log

## Overview
Verification of cross-cutting concerns including security (Auth/Authorization), stability (Rate Limiting), and UX consistency (Error Formats).

## Security & Auth Fixes

### 🛡️ Bug E.A: Missing Rate Limiting
- **Issue**: API routes were unprotected by rate limiting, making the system vulnerable to brute-force or DoS attacks.
- **Fix**: Defined an `api` rate limiter (60/min) in `AppServiceProvider` and applied the `throttle:api` middleware globally in `bootstrap/app.php`.

### 🛡️ Bug E.B: Inconsistent Validation Error Format
- **Issue**: Standard Laravel validation errors were returning a different format than custom API responses, violating UX consistency.
- **Fix**: Added a custom exception renderer in `bootstrap/app.php` to normalize `ValidationException` responses.

## Test Results

| Test | Status | Details |
|------|--------|---------|
| **E.1 Unauthorized** | PASSED ✅ | Correctly returned 401 for requests without tokens. |
| **E.2 RBAC (User->Admin)** | PASSED ✅ | Correctly returned 403 for regular users hitting admin routes. |
| **E.3 RBAC (Admin->Super)** | PASSED ✅ | Correctly returned 403 for admins hitting super_admin routes. |
| **E.4 Invalid JSON** | PASSED ✅ | Correctly returned 422 for malformed requests. |
| **E.5 Resource 404** | PASSED ✅ | Correctly handled non-existent Eloquent models with 404. |
| **E.6 Rate Limiting** | PASSED ✅ | Triggered 429 Forbidden on the 61st request in a minute. |
| **E.7 Validation Format** | PASSED ✅ | Confirmed format is now `{success, message, data}`. |

## Conclusion
The API is now robust and secure against unauthorized access and traffic spikes. Error handling is consistent, aiding frontend development and user experience.
