<?php

namespace App\Http\Controllers\Api;

use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Http\Resources\UserResource;
use App\Models\Language;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserLanguage;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class AuthController extends BaseController
{
    /**
     * Register a new user
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        try {
            DB::beginTransaction();

            // Create user
            $user = User::create([
                'name' => $request->name,
                'username' => $request->username,
                'email' => $request->email,
                'password' => $request->password,
                'role' => 'user',
                'status' => 'active',
            ]);

            // Create profile
            Profile::create([
                'user_id' => $user->id,
                'country_code' => $request->country_code,
            ]);

            // Add native language
            if ($request->native_language) {
                $nativeLanguage = Language::where('code', $request->native_language)->first();
                if ($nativeLanguage) {
                    UserLanguage::create([
                        'user_id' => $user->id,
                        'language_id' => $nativeLanguage->id,
                        'type' => 'native',
                        'proficiency' => 'native',
                    ]);
                }
            }

            // Add learning language
            if ($request->learning_language) {
                $learningLanguage = Language::where('code', $request->learning_language)->first();
                if ($learningLanguage) {
                    UserLanguage::create([
                        'user_id' => $user->id,
                        'language_id' => $learningLanguage->id,
                        'type' => 'learning',
                        'proficiency' => 'beginner',
                    ]);
                }
            }

            DB::commit();

            // Send email verification
            event(new Registered($user));

            // Create token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Load relationships
            $user->load(['profile', 'languages.language']);

            return $this->successResponse([
                'user' => new UserResource($user),
                'token' => $token,
            ], 'Account created successfully. Please verify your email.', 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Registration failed: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Login user
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // Rate limiting
        $key = 'login:' . $request->ip();
        if (RateLimiter::tooManyAttempts($key, 5)) {
            $seconds = RateLimiter::availableIn($key);
            return $this->errorResponse(
                "Too many login attempts. Please try again in {$seconds} seconds.",
                null,
                429
            );
        }

        // Find user
        $user = User::where('email', $request->email)->first();

        // Check credentials
        if (!$user || !Hash::check($request->password, $user->password)) {
            RateLimiter::hit($key, 900); // 15 minutes
            return $this->errorResponse('Invalid credentials', null, 401);
        }

        // Check if user is banned or suspended
        if ($user->isBanned()) {
            return $this->errorResponse('Your account has been banned', null, 403);
        }

        if ($user->isSuspended()) {
            return $this->errorResponse('Your account has been suspended', null, 403);
        }

        // Clear rate limiter
        RateLimiter::clear($key);

        // Update last seen
        $user->update(['last_seen_at' => now()]);

        // Create token
        $token = $user->createToken('auth_token', ['*'], now()->addDays(60))->plainTextToken;

        // Load relationships
        $user->load(['profile', 'languages.language']);

        return $this->successResponse([
            'user' => new UserResource($user),
            'token' => $token,
            'expires_at' => now()->addDays(60)->toISOString(),
        ], 'Login successful');
    }

    /**
     * Logout user
     */
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(null, 'Logged out successfully');
    }

    /**
     * Refresh token
     */
    public function refresh(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Delete current token
        $request->user()->currentAccessToken()->delete();

        // Create new token
        $token = $user->createToken('auth_token', ['*'], now()->addDays(60))->plainTextToken;

        return $this->successResponse([
            'token' => $token,
            'expires_at' => now()->addDays(60)->toISOString(),
        ], 'Token refreshed successfully');
    }

    /**
     * Send password reset link
     */
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        $status = Password::sendResetLink(
            $request->only('email')
        );

        if ($status === Password::RESET_LINK_SENT) {
            return $this->successResponse(null, 'Password reset link sent to your email');
        }

        // Always return success to prevent email enumeration
        return $this->successResponse(null, 'If that email exists, a password reset link has been sent');
    }

    /**
     * Reset password
     */
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();

                // Revoke all tokens
                $user->tokens()->delete();

                event(new PasswordReset($user));
            }
        );

        if ($status === Password::PASSWORD_RESET) {
            return $this->successResponse(null, 'Password reset successfully');
        }

        return $this->errorResponse('Invalid or expired reset token', null, 400);
    }

    /**
     * Verify email
     */
    public function verifyEmail(Request $request, $id, $hash): JsonResponse
    {
        $user = User::findOrFail($id);

        if (!hash_equals((string) $hash, sha1($user->getEmailForVerification()))) {
            return $this->errorResponse('Invalid verification link', null, 400);
        }

        if ($user->hasVerifiedEmail()) {
            return $this->successResponse(null, 'Email already verified');
        }

        $user->markEmailAsVerified();

        return $this->successResponse(null, 'Email verified successfully');
    }

    /**
     * Resend verification email
     */
    public function resendVerification(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->hasVerifiedEmail()) {
            return $this->errorResponse('Email already verified', null, 400);
        }

        $user->sendEmailVerificationNotification();

        return $this->successResponse(null, 'Verification email sent');
    }
}
