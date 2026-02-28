import 'package:flutter/material.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../../../../core/theme/app_theme.dart';

class VideoPlayerWidget extends StatefulWidget {
  final String videoUrl;
  final bool autoPlay;
  final bool showControls;
  final bool looping;
  final Widget? placeholder;

  const VideoPlayerWidget({
    super.key,
    required this.videoUrl,
    this.autoPlay = false,
    this.showControls = true,
    this.looping = false,
    this.placeholder,
  });

  @override
  State<VideoPlayerWidget> createState() => _VideoPlayerWidgetState();
}

class _VideoPlayerWidgetState extends State<VideoPlayerWidget> {
  VideoPlayerController? _videoPlayerController;
  ChewieController? _chewieController;
  bool _isInitialized = false;
  bool _isLoading = true;
  bool _hasError = false;

  @override
  void initState() {
    super.initState();
    _initializeVideo();
  }

  @override
  void dispose() {
    _chewieController?.dispose();
    _videoPlayerController?.dispose();
    super.dispose();
  }

  Future<void> _initializeVideo() async {
    try {
      _videoPlayerController = VideoPlayerController.networkUrl(Uri.parse(widget.videoUrl));
      
      await _videoPlayerController!.initialize();

      if (widget.showControls) {
        _chewieController = ChewieController(
          videoPlayerController: _videoPlayerController!,
          autoPlay: widget.autoPlay,
          looping: widget.looping,
          showControls: widget.showControls,
          allowMuting: true,
          allowFullScreen: true,
          allowPlaybackSpeedChanging: true,
          aspectRatio: _videoPlayerController!.value.aspectRatio,
          errorBuilder: (context, errorMessage) {
            return _buildErrorWidget(errorMessage);
          },
        );
      } else {
        if (widget.autoPlay) {
          await _videoPlayerController!.play();
        }
        if (widget.looping) {
          _videoPlayerController!.setLooping(true);
        }
      }

      if (mounted) {
        setState(() {
          _isInitialized = true;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _hasError = true;
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return widget.placeholder ?? _buildLoadingWidget();
    }

    if (_hasError) {
      return _buildErrorWidget('Failed to load video');
    }

    if (!_isInitialized) {
      return _buildLoadingWidget();
    }

    if (widget.showControls && _chewieController != null) {
      return SizedBox(
        width: double.infinity,
        child: Chewie(controller: _chewieController!),
      );
    }

    if (_videoPlayerController != null && _videoPlayerController!.value.isInitialized) {
      return SizedBox(
        width: double.infinity,
        child: AspectRatio(
          aspectRatio: _videoPlayerController!.value.aspectRatio,
          child: Stack(
            fit: StackFit.expand,
            children: [
              VideoPlayer(_videoPlayerController!),
              if (!widget.showControls) _buildCustomControls(),
            ],
          ),
        ),
      );
    }

    return _buildLoadingWidget();
  }

  Widget _buildLoadingWidget() {
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
                fontSize: 12,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorWidget(String errorMessage) {
    return Container(
      color: BaniTalkTheme.surface2,
      child: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(
              Icons.videocam_off,
              color: BaniTalkTheme.textSecondary,
              size: 48,
            ),
            const SizedBox(height: 8),
            Text(
              errorMessage,
              style: TextStyle(
                color: BaniTalkTheme.textSecondary,
                fontSize: 12,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 8),
            IconButton(
              icon: Icon(
                Icons.refresh,
                color: BaniTalkTheme.primary,
              ),
              onPressed: _retryInitialization,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCustomControls() {
    return GestureDetector(
      onTap: () {
        if (_videoPlayerController != null) {
          if (_videoPlayerController!.value.isPlaying) {
            _videoPlayerController!.pause();
          } else {
            _videoPlayerController!.play();
          }
          setState(() {});
        }
      },
      child: Container(
        color: Colors.transparent,
        child: Stack(
          children: [
            Center(
              child: AnimatedOpacity(
                opacity: _videoPlayerController?.value.isPlaying == true ? 0.0 : 1.0,
                duration: const Duration(milliseconds: 300),
                child: Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.black.withOpacity(0.5),
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    _videoPlayerController?.value.isPlaying == true
                        ? Icons.pause
                        : Icons.play_arrow,
                    color: Colors.white,
                    size: 32,
                  ),
                ),
              ),
            ),
            Positioned(
              bottom: 8,
              right: 8,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.5),
                  borderRadius: BorderRadius.circular(4),
                ),
                child: Text(
                  _formatDuration(_videoPlayerController?.value.position ?? Duration.zero),
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                  ),
                ),
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

  Future<void> _retryInitialization() async {
    setState(() {
      _isLoading = true;
      _hasError = false;
      _isInitialized = false;
    });

    await _videoPlayerController?.dispose();
    await _chewieController?.dispose();

    await _initializeVideo();
  }
}

class AutoPlayVideoManager {
  static final Map<String, VideoPlayerController> _activeControllers = {};
  static const int _maxConcurrentVideos = 3;

  static void registerVideo(String key, VideoPlayerController controller) {
    if (_activeControllers.length >= _maxConcurrentVideos) {
      _pauseOldestVideo();
    }
    _activeControllers[key] = controller;
  }

  static void unregisterVideo(String key) {
    _activeControllers.remove(key)?.pause();
  }

  static void playVideo(String key) {
    final controller = _activeControllers[key];
    if (controller != null && controller.value.isInitialized) {
      // Pause all other videos
      for (final otherController in _activeControllers.values) {
        if (otherController != controller) {
          otherController.pause();
        }
      }
      controller.play();
    }
  }

  static void pauseVideo(String key) {
    _activeControllers[key]?.pause();
  }

  static void pauseAll() {
    for (final controller in _activeControllers.values) {
      controller.pause();
    }
  }

  static void _pauseOldestVideo() {
    if (_activeControllers.isNotEmpty) {
      final oldestKey = _activeControllers.keys.first;
      _activeControllers[oldestKey]?.pause();
    }
  }
}
