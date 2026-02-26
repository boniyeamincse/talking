<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SendReactionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'emoji' => 'required|string|max:10',
        ];
    }

    public function messages(): array
    {
        return [
            'emoji.required' => 'An emoji is required',
            'emoji.max' => 'Invalid emoji format',
        ];
    }
}
