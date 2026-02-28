import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_player/video_player.dart';
import '../../../../core/theme/app_theme.dart';
import 'media_preview.dart';

class CreatePostBottomSheet extends StatefulWidget {
  final Function(String content, List<String> mediaFiles, List<String> mediaTypes) onPostCreated;

  const CreatePostBottomSheet({
    super.key,
    required this.onPostCreated,
  });

  @override
  State<CreatePostBottomSheet> createState() => _CreatePostBottomSheetState();
}

class _CreatePostBottomSheetState extends State<CreatePostBottomSheet> {
  final TextEditingController _contentController = TextEditingController();
  final List<File> _mediaFiles = [];
  final List<String> _mediaTypes = [];
  bool _isPosting = false;

  @override
  void dispose() {
    _contentController.dispose();
    for (final file in _mediaFiles) {
      file.deleteSync();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.9,
      decoration: BoxDecoration(
        color: BaniTalkTheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          _buildHeader(),
          Expanded(child: _buildContent()),
          _buildBottomActions(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          bottom: BorderSide(
            color: BaniTalkTheme.surface2,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          IconButton(
            onPressed: () => Navigator.pop(context),
            icon: Icon(
              Icons.close,
              color: BaniTalkTheme.textBody,
            ),
          ),
          Expanded(
            child: Text(
              'Create Moment',
              style: TextStyle(
                color: BaniTalkTheme.textBody,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          Container(
            width: 48,
            height: 48,
            margin: const EdgeInsets.only(left: 8),
            decoration: BoxDecoration(
              color: _canPost() ? BaniTalkTheme.primary : BaniTalkTheme.surface2,
              borderRadius: BorderRadius.circular(24),
            ),
            child: IconButton(
              onPressed: _canPost() && !_isPosting ? _createPost : null,
              icon: _isPosting
                  ? SizedBox(
                      width: 20,
                      height: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation(
                          _canPost() ? Colors.white : BaniTalkTheme.textSecondary,
                        ),
                      ),
                    )
                  : Icon(
                      Icons.send,
                      color: _canPost() ? Colors.white : BaniTalkTheme.textSecondary,
                      size: 20,
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildTextInput(),
          const SizedBox(height: 16),
          _buildMediaSection(),
        ],
      ),
    );
  }

  Widget _buildTextInput() {
    return TextField(
      controller: _contentController,
      maxLines: null,
      maxLength: 500,
      style: TextStyle(
        color: BaniTalkTheme.textBody,
        fontSize: 16,
      ),
      decoration: InputDecoration(
        hintText: 'Share your moment with the world...',
        hintStyle: TextStyle(
          color: BaniTalkTheme.textSecondary,
          fontSize: 16,
        ),
        border: InputBorder.none,
        counterText: '',
      ),
      onChanged: (value) {
        setState(() {});
      },
    );
  }

  Widget _buildMediaSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_mediaFiles.isNotEmpty) ...[
          _buildMediaPreview(),
          const SizedBox(height: 16),
        ],
        _buildMediaPicker(),
      ],
    );
  }

  Widget _buildMediaPreview() {
    return SizedBox(
      height: 200,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _mediaFiles.length,
        itemBuilder: (context, index) {
          return Container(
            width: 150,
            margin: const EdgeInsets.only(right: 8),
            child: MediaPreview(
              file: _mediaFiles[index],
              mediaType: _mediaTypes[index],
              onRemove: () => _removeMedia(index),
            ),
          );
        },
      ),
    );
  }

  Widget _buildMediaPicker() {
    return Row(
      children: [
        _buildMediaPickerButton(
          icon: Icons.photo_library,
          label: 'Gallery',
          onTap: _pickFromGallery,
        ),
        const SizedBox(width: 12),
        _buildMediaPickerButton(
          icon: Icons.camera_alt,
          label: 'Camera',
          onTap: _captureFromCamera,
        ),
        const SizedBox(width: 12),
        _buildMediaPickerButton(
          icon: Icons.videocam,
          label: 'Video',
          onTap: _recordVideo,
        ),
      ],
    );
  }

  Widget _buildMediaPickerButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
  }) {
    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: BaniTalkTheme.surface2,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: BaniTalkTheme.surface2,
            ),
          ),
          child: Column(
            children: [
              Icon(
                icon,
                color: BaniTalkTheme.primary,
                size: 24,
              ),
              const SizedBox(height: 4),
              Text(
                label,
                style: TextStyle(
                  color: BaniTalkTheme.textBody,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBottomActions() {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border(
          top: BorderSide(
            color: BaniTalkTheme.surface2,
            width: 1,
          ),
        ),
      ),
      child: Row(
        children: [
          Icon(
            Icons.public,
            color: BaniTalkTheme.textSecondary,
            size: 16,
          ),
          const SizedBox(width: 4),
          Text(
            'Everyone can see this',
            style: TextStyle(
              color: BaniTalkTheme.textSecondary,
              fontSize: 12,
            ),
          ),
          const Spacer(),
          Text(
            '${_contentController.text.length}/500',
            style: TextStyle(
              color: BaniTalkTheme.textSecondary,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }

  bool _canPost() {
    return _contentController.text.trim().isNotEmpty || _mediaFiles.isNotEmpty;
  }

  Future<void> _pickFromGallery() async {
    if (_mediaFiles.length >= 5) {
      _showMessage('Maximum 5 media files allowed');
      return;
    }

    final ImagePicker picker = ImagePicker();
    final List<XFile> pickedFiles = await picker.pickMultiImage();

    for (final file in pickedFiles) {
      if (_mediaFiles.length >= 5) break;
      
      final mediaFile = File(file.path);
      final mediaType = _getMediaType(file.path);
      
      setState(() {
        _mediaFiles.add(mediaFile);
        _mediaTypes.add(mediaType);
      });
    }
  }

  Future<void> _captureFromCamera() async {
    if (_mediaFiles.length >= 5) {
      _showMessage('Maximum 5 media files allowed');
      return;
    }

    final ImagePicker picker = ImagePicker();
    final XFile? photo = await picker.pickImage(source: ImageSource.camera);

    if (photo != null) {
      final mediaFile = File(photo.path);
      final mediaType = _getMediaType(photo.path);
      
      setState(() {
        _mediaFiles.add(mediaFile);
        _mediaTypes.add(mediaType);
      });
    }
  }

  Future<void> _recordVideo() async {
    if (_mediaFiles.length >= 5) {
      _showMessage('Maximum 5 media files allowed');
      return;
    }

    final ImagePicker picker = ImagePicker();
    final XFile? video = await picker.pickVideo(source: ImageSource.camera);

    if (video != null) {
      final mediaFile = File(video.path);
      final mediaType = _getMediaType(video.path);
      
      setState(() {
        _mediaFiles.add(mediaFile);
        _mediaTypes.add(mediaType);
      });
    }
  }

  void _removeMedia(int index) {
    setState(() {
      _mediaFiles.removeAt(index);
      _mediaTypes.removeAt(index);
    });
  }

  String _getMediaType(String filePath) {
    final extension = filePath.toLowerCase().split('.').last;
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].contains(extension)) {
      return 'image/$extension';
    } else if (['mp4', 'mov', 'avi', 'mkv', 'webm'].contains(extension)) {
      return 'video/$extension';
    }
    
    return 'application/octet-stream';
  }

  Future<void> _createPost() async {
    if (!_canPost() || _isPosting) return;

    setState(() {
      _isPosting = true;
    });

    try {
      // In a real app, you would upload files to server first
      // For now, we'll use local file paths
      final mediaPaths = _mediaFiles.map((file) => file.path).toList();
      
      widget.onPostCreated(
        _contentController.text.trim(),
        mediaPaths,
        _mediaTypes,
      );

      Navigator.pop(context);
    } catch (e) {
      _showMessage('Failed to create post: ${e.toString()}');
    } finally {
      setState(() {
        _isPosting = false;
      });
    }
  }

  void _showMessage(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: BaniTalkTheme.surface,
        contentTextStyle: TextStyle(color: BaniTalkTheme.textBody),
      ),
    );
  }
}
