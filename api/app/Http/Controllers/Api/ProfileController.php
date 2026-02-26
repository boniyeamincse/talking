<?php

namespace App\Http\Controllers\Api;

use App\Http\Resources\ProfileResource;
use App\Http\Resources\UserResource;
use App\Models\Language;
use App\Models\Profile;
use App\Models\User;
use App\Models\UserLanguage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ProfileController extends BaseController
{
    /**
     * Get own profile
     */
    public function me(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;
        $user = $request->user()->load(['languages.language']);

        return $this->successResponse([
            'profile' => new ProfileResource($profile),
            'languages' => $user->languages->map(function ($ul) {
                return [
                    'code' => $ul->language->code,
                    'name' => $ul->language->name,
                    'type' => $ul->type,
                    'proficiency' => $ul->proficiency,
                ];
            }),
        ]);
    }

    /**
     * Update profile
     */
    public function update(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'display_name' => ['sometimes', 'string', 'max:100'],
            'bio' => ['sometimes', 'string', 'max:500'],
            'country_code' => ['sometimes', 'string', 'size:2'],
            'date_of_birth' => ['sometimes', 'date', 'before:today'],
            'gender' => ['sometimes', Rule::in(['male', 'female', 'other', 'prefer_not_to_say'])],
            'is_public' => ['sometimes', 'boolean'],
            'cultural_interests' => ['sometimes', 'array', 'max:20'],
            'cultural_interests.*' => ['string', 'min:2', 'max:50'],
            'learning_goal' => ['sometimes', Rule::in(['casual', 'study', 'cultural_exchange', 'friendship'])],
        ]);

        $profile = $request->user()->profile;
        $profile->update($validated);

        return $this->successResponse(
            new ProfileResource($profile),
            'Profile updated successfully'
        );
    }

    /**
     * Upload profile photo
     */
    public function uploadPhoto(Request $request): JsonResponse
    {
        $request->validate([
            'photo' => ['required', 'image', 'mimes:jpeg,png,jpg,webp', 'max:5120'], // 5MB
        ]);

        $user = $request->user();
        $profile = $user->profile;

        // Delete old avatar if exists
        if ($profile->avatar) {
            $oldPath = str_replace(Storage::url(''), '', $profile->avatar);
            Storage::disk('public')->delete($oldPath);
        }

        // Upload new avatar
        $path = $request->file('photo')->store("avatars/{$user->uuid}", 'public');
        $url = Storage::url($path);

        $profile->update(['avatar' => $url]);

        return $this->successResponse([
            'avatar' => $url,
        ], 'Profile photo uploaded successfully');
    }

    /**
     * Update languages
     */
    public function updateLanguages(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'native' => ['sometimes', 'array'],
            'native.*.code' => ['required', 'string', 'exists:languages,code'],
            'native.*.proficiency' => ['sometimes', Rule::in(['beginner', 'elementary', 'intermediate', 'advanced', 'fluent', 'native'])],
            'learning' => ['sometimes', 'array'],
            'learning.*.code' => ['required', 'string', 'exists:languages,code'],
            'learning.*.proficiency' => ['sometimes', Rule::in(['beginner', 'elementary', 'intermediate', 'advanced', 'fluent', 'native'])],
        ]);

        try {
            DB::beginTransaction();

            $user = $request->user();

            // Delete existing languages
            UserLanguage::where('user_id', $user->id)->delete();

            // Add native languages
            if (isset($validated['native'])) {
                foreach ($validated['native'] as $lang) {
                    $language = Language::where('code', $lang['code'])->first();
                    if ($language) {
                        UserLanguage::create([
                            'user_id' => $user->id,
                            'language_id' => $language->id,
                            'type' => 'native',
                            'proficiency' => $lang['proficiency'] ?? 'native',
                        ]);
                    }
                }
            }

            // Add learning languages
            if (isset($validated['learning'])) {
                foreach ($validated['learning'] as $lang) {
                    $language = Language::where('code', $lang['code'])->first();
                    if ($language) {
                        UserLanguage::create([
                            'user_id' => $user->id,
                            'language_id' => $language->id,
                            'type' => 'learning',
                            'proficiency' => $lang['proficiency'] ?? 'beginner',
                        ]);
                    }
                }
            }

            DB::commit();

            $user->load(['languages.language']);

            return $this->successResponse(
                $user->languages->map(function ($ul) {
                    return [
                        'code' => $ul->language->code,
                        'name' => $ul->language->name,
                        'type' => $ul->type,
                        'proficiency' => $ul->proficiency,
                    ];
                }),
                'Languages updated successfully'
            );

        } catch (\Exception $e) {
            DB::rollBack();
            return $this->errorResponse('Failed to update languages: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * Get user profile by ID
     */
    public function show(Request $request, $id): JsonResponse
    {
        $user = User::with(['profile', 'languages.language'])->findOrFail($id);

        // Check if profile is public
        if (!$user->profile->is_public && $user->id !== $request->user()->id) {
            return $this->errorResponse('This profile is private', null, 403);
        }

        return $this->successResponse([
            'user' => new UserResource($user),
            'profile' => new ProfileResource($user->profile),
        ]);
    }
}
