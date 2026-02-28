import 'dart:io';
import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import '../../../../core/theme/app_theme.dart';

class MediaPreview extends StatefulWidget {
  final File file;
  final String mediaType;
  final VoidCallback onRemove;

  const MediaPreview({
    super.key,
    required this.file,
    required this.mediaType,
    required this.onRemove,
  });

  @override
  State<MediaPreview> createState() => _MediaPreviewState();
}

class _MediaPreviewState extends State<MediaPreview> {
  VideoPlayerController? _videoController;
  bool _isVideoInitialized = false;

  @override
  void initState() {
    super.initState();
    if (widget.mediaType.startsWith('video/')) {
      _initializeVideo();
    }
  }

  @override
  void dispose() {
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _initializeVideo() async {
    try {
      _videoController = VideoPlayerController.file(widget.file);
      await _videoController!.initialize();
      
      if (mounted) {
        setState(() {
          _isVideoInitialized = true;
        });
      }
    } catch (e) {
      // Handle video initialization error
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: BaniTalkTheme.surface2,
          width: 1,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(12),
        child: Stack(
          children: [
            _buildMediaContent(),
            _buildRemoveButton(),
            if (widget.mediaType.startsWith('video/')) _buildVideoOverlay(),
          ],
        ),
      ),
    );
  }

  Widget _buildMediaContent() {
    if (widget.mediaType.startsWith('image/')) {
      return Image.file(
        widget.file,
        width: double.infinity,
        height: double.infinity,
        fit: BoxFit.cover,
        errorBuilder: (context, error, stackTrace) {
          return Container(
            color: BaniTalkTheme.surface2,
            child: Center(
              child: Icon(
                Icons.broken_image,
                color: BaniTalkTheme.textSecondary,
                size: 32,
              ),
            ),
          );
        },
      );
    } else if (widget.mediaType.startsWith('video/')) {
      if (_isVideoInitialized && _videoController != null) {
        return SizedBox(
          width: double.infinity,
          height: double.infinity,
          child: FittedBox(
            fit: BoxFit.cover,
            child: SizedBox(
              width: _videoController!.value.size.width,
              height: _videoController!.value.size.height,
              child: VideoPlayer(_videoController!),
            ),
          ),
        );
      } else {
        return Container(
          color: BaniTalkTheme.surface2,
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(BaniTalkTheme.primary),
                ),
                const SizedBox(height: 8),
                Text(
                  'Loading video...',
                  style: TextStyle(
                    color: BaniTalkTheme.textSecondary,
                    fontSize: 10,
                  ),
                ),
              ],
            ),
          ),
        );
      }
    }

    return Container(
      color: BaniTalkTheme.surface2,
      child: Center(
        child: Icon(
          Icons.insert_drive_file,
          color: BaniTalkTheme.textSecondary,
          size: 32,
        ),
      ),
    );
  }

  Widget _buildRemoveButton() {
    return Positioned(
      top: 8,
      right: 8,
      child: GestureDetector(
        onTap: widget.onRemove,
        child: Container(
          width: 24,
          height: 24,
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.6),
            shape: BoxShape.circle,
          ),
          child: Icon(
            Icons.close,
            color: Colors.white,
            size: 16,
          ),
        ),
      ),
    );
  }

  Widget _buildVideoOverlay() {
    return Positioned(
      bottom: 8,
      left: 8,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
        decoration: BoxDecoration(
          color: Colors.black.withOpacity(0.6),
          borderRadius: BorderRadius.circular(4),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              Icons.videocam,
              color: Colors.white,
              size: 12,
            ),
            const SizedBox(width: 4),
            Text(
              _formatDuration(_videoController?.value.duration ?? Duration.zero),
              style: const TextStyle(
                color: Colors.white,
                fontSize: 10,
              ),
            ),
          ],
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return '$minutes:$seconds';
  }
}
