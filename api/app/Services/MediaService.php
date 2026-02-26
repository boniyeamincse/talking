<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class MediaService
{
    // File size limits in bytes
    private const IMAGE_MAX_SIZE = 10 * 1024 * 1024; // 10MB
    private const VIDEO_MAX_SIZE = 50 * 1024 * 1024; // 50MB
    private const AUDIO_MAX_SIZE = 20 * 1024 * 1024; // 20MB

    // Supported MIME types
    private const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private const VIDEO_TYPES = ['video/mp4', 'video/webm'];
    private const AUDIO_TYPES = ['audio/mpeg', 'audio/wav', 'audio/ogg'];

    /**
     * Validate a media file
     *
     * @param UploadedFile $file
     * @return array ['type' => string, 'size' => int, 'mime' => string]
     * @throws ValidationException
     */
    public function validateMediaFile(UploadedFile $file): array
    {
        $mimeType = $file->getMimeType();
        $fileSize = $file->getSize();
        $mediaType = $this->getMediaType($mimeType);

        // Validate file type
        if (!$mediaType) {
            throw ValidationException::withMessages([
                'file' => ['Unsupported file type. Supported types: images (JPEG, PNG, GIF, WebP), videos (MP4, WebM), audio (MP3, WAV, OGG).']
            ]);
        }

        // Validate file size based on type
        $maxSize = match ($mediaType) {
            'image' => self::IMAGE_MAX_SIZE,
            'video' => self::VIDEO_MAX_SIZE,
            'audio' => self::AUDIO_MAX_SIZE,
            default => 0,
        };

        if ($fileSize > $maxSize) {
            $maxSizeMB = $maxSize / (1024 * 1024);
            throw ValidationException::withMessages([
                'file' => ["File size exceeds maximum allowed size of {$maxSizeMB}MB for {$mediaType} files."]
            ]);
        }

        return [
            'type' => $mediaType,
            'size' => $fileSize,
            'mime' => $mimeType,
        ];
    }

    /**
     * Store a media file
     *
     * @param UploadedFile $file
     * @param string $type
     * @return string File path
     */
    public function storeMediaFile(UploadedFile $file, string $type): string
    {
        $directory = "chat/media/{$type}s";
        $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
        
        return $file->storeAs($directory, $filename, 'public');
    }

    /**
     * Delete a media file
     *
     * @param string $path
     * @return bool
     */
    public function deleteMediaFile(string $path): bool
    {
        return Storage::disk('public')->delete($path);
    }

    /**
     * Get media type from MIME type
     *
     * @param string $mimeType
     * @return string|null 'image', 'video', 'audio', or null if unsupported
     */
    public function getMediaType(string $mimeType): ?string
    {
        if (in_array($mimeType, self::IMAGE_TYPES)) {
            return 'image';
        }
        
        if (in_array($mimeType, self::VIDEO_TYPES)) {
            return 'video';
        }
        
        if (in_array($mimeType, self::AUDIO_TYPES)) {
            return 'audio';
        }
        
        return null;
    }
}
