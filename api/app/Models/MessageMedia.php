<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class MessageMedia extends Model
{
    use HasFactory;

    protected $table = 'message_media';

    protected $fillable = [
        'message_id',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
    ];

    protected $casts = [
        'file_size' => 'integer',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get the message this media belongs to
     */
    public function message(): BelongsTo
    {
        return $this->belongsTo(Message::class);
    }

    /**
     * Get the full URL for the media file
     */
    public function getUrl(): string
    {
        return Storage::url($this->file_path);
    }

    /**
     * Accessor for URL attribute
     */
    public function getUrlAttribute(): string
    {
        return $this->getUrl();
    }
}
