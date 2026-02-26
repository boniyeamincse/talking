<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class PostMedia extends Model
{
    use HasFactory;

    protected $table = 'post_media';

    protected $fillable = [
        'post_id',
        'file_path',
        'file_type',
        'file_size',
        'mime_type',
        'display_order'
    ];

    protected $casts = [
        'file_size' => 'integer',
        'display_order' => 'integer'
    ];

    // Relationships
    public function post(): BelongsTo
    {
        return $this->belongsTo(Post::class);
    }

    // Methods
    public function getUrl(): string
    {
        return Storage::url($this->file_path);
    }
}
