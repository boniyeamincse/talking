<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CreateVoiceRoomRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string|max:1000',
            'is_public' => 'nullable|boolean',
            'capacity' => 'nullable|integer|min:2|max:500',
        ];
    }

    public function messages(): array
    {
        return [
            'capacity.min' => 'Room capacity must be at least 2 participants',
            'capacity.max' => 'Room capacity cannot exceed 500 participants',
        ];
    }
}
