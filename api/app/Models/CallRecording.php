<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class CallRecording extends Model
{
    use HasFactory;

    protected $fillable = [
        'call_id',
        'file_path',
        'file_size',
        'duration',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'duration' => 'integer',
    ];

    // Relationships
    public function call(): BelongsTo
    {
        return $this->belongsTo(Call::class);
    }

    // Methods
    public function getUrl(): string
    {
        return Storage::url($this->file_path);
    }
}
