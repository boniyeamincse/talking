import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../../domain/entities/post_entity.dart';
import '../../../../core/theme/app_theme.dart';
import 'video_player_widget.dart';
import 'translation_toggle.dart';

class PostCard extends StatefulWidget {
  final PostEntity post;
  final VoidCallback onLike;
  final VoidCallback onComment;
  final VoidCallback onToggleTranslation;
  final VoidCallback onShare;

  const PostCard({
    super.key,
    required this.post,
    required this.onLike,
    required this.onComment,
    required this.onToggleTranslation,
    required this.onShare,
  });

  @override
  State<PostCard> createState() => _PostCardState();
}

class _PostCardState extends State<PostCard> {
  bool _isExpanded = false;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: BaniTalkTheme.surface,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _buildHeader(),
          _buildContent(),
          if (widget.post.mediaUrls.isNotEmpty) _buildMedia(),
          _buildActions(),
          _buildStats(),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          CircleAvatar(
            radius: 20,
            backgroundColor: BaniTalkTheme.surface2,
            backgroundImage: widget.post.userAvatar.isNotEmpty
                ? CachedNetworkImageProvider(widget.post.userAvatar)
                : null,
            child: widget.post.userAvatar.isEmpty
                ? Icon(
                    Icons.person,
                    color: BaniTalkTheme.textSecondary,
                    size: 24,
                  )
                : null,
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.post.username,
                  style: TextStyle(
                    color: BaniTalkTheme.textBody,
                    fontWeight: FontWeight.w600,
                    fontSize: 16,
                  ),
                ),
                Text(
                  _formatTimestamp(widget.post.createdAt),
                  style: TextStyle(
                    color: BaniTalkTheme.textSecondary,
                    fontSize: 12,
                  ),
                ),
              ],
            ),
          ),
          IconButton(
            icon: Icon(
              Icons.more_horiz,
              color: BaniTalkTheme.textSecondary,
            ),
            onPressed: () {
              _showMoreOptions();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildContent() {
    final displayContent = widget.post.isTranslationEnabled && 
                          widget.post.translatedContent != null
        ? widget.post.translatedContent!
        : widget.post.content;

    final needsExpansion = displayContent.length > 200;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            _isExpanded || !needsExpansion
                ? displayContent
                : '${displayContent.substring(0, 200)}...',
            style: TextStyle(
              color: BaniTalkTheme.textBody,
              fontSize: 14,
              height: 1.4,
            ),
          ),
          if (needsExpansion)
            GestureDetector(
              onTap: () {
                setState(() {
                  _isExpanded = !_isExpanded;
                });
              },
              child: Text(
                _isExpanded ? 'Show less' : 'Show more',
                style: TextStyle(
                  color: BaniTalkTheme.primary,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ),
          const SizedBox(height: 8),
          TranslationToggle(
            isEnabled: widget.post.isTranslationEnabled,
            onTap: widget.onToggleTranslation,
          ),
        ],
      ),
    );
  }

  Widget _buildMedia() {
    return SizedBox(
      height: _calculateMediaHeight(),
      child: PageView.builder(
        itemCount: widget.post.mediaUrls.length,
        itemBuilder: (context, index) {
          final mediaUrl = widget.post.mediaUrls[index];
          final mediaType = widget.post.mediaTypes[index];

          if (mediaType.startsWith('image/')) {
            return _buildImage(mediaUrl);
          } else if (mediaType.startsWith('video/')) {
            return _buildVideo(mediaUrl);
          }
          return const SizedBox.shrink();
        },
      ),
    );
  }

  Widget _buildImage(String imageUrl) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: CachedNetworkImage(
          imageUrl: imageUrl,
          fit: BoxFit.cover,
          width: double.infinity,
          placeholder: (context, url) => Container(
            color: BaniTalkTheme.surface2,
            child: Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(BaniTalkTheme.primary),
              ),
            ),
          ),
          errorWidget: (context, url, error) => Container(
            color: BaniTalkTheme.surface2,
            child: Center(
              child: Icon(
                Icons.broken_image,
                color: BaniTalkTheme.textSecondary,
                size: 48,
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildVideo(String videoUrl) {
    return Container(
      margin: const EdgeInsets.symmetric(vertical: 8),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: VideoPlayerWidget(
          videoUrl: videoUrl,
          autoPlay: false,
          showControls: true,
        ),
      ),
    );
  }

  Widget _buildActions() {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          _buildActionButton(
            icon: widget.post.isLiked ? Icons.favorite : Icons.favorite_border,
            label: 'Like',
            isActive: widget.post.isLiked,
            onTap: widget.onLike,
          ),
          const SizedBox(width: 24),
          _buildActionButton(
            icon: Icons.comment_outlined,
            label: 'Comment',
            onTap: widget.onComment,
          ),
          const SizedBox(width: 24),
          _buildActionButton(
            icon: Icons.share_outlined,
            label: 'Share',
            onTap: widget.onShare,
          ),
          const Spacer(),
          _buildActionButton(
            icon: Icons.bookmark_border,
            label: 'Save',
            onTap: () {
              // Implement save functionality
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required IconData icon,
    required String label,
    required VoidCallback onTap,
    bool isActive = false,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Row(
        children: [
          Icon(
            icon,
            color: isActive ? BaniTalkTheme.primary : BaniTalkTheme.textSecondary,
            size: 20,
          ),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: isActive ? BaniTalkTheme.primary : BaniTalkTheme.textSecondary,
              fontSize: 12,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStats() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.post.likesCount > 0)
            Text(
              '${widget.post.likesCount} likes',
              style: TextStyle(
                color: BaniTalkTheme.textBody,
                fontWeight: FontWeight.w600,
                fontSize: 12,
              ),
            ),
          if (widget.post.commentsCount > 0)
            GestureDetector(
              onTap: widget.onComment,
              child: Text(
                '${widget.post.commentsCount} comments',
                style: TextStyle(
                  color: BaniTalkTheme.textSecondary,
                  fontSize: 12,
                ),
              ),
            ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  double _calculateMediaHeight() {
    if (widget.post.mediaUrls.isEmpty) return 0;
    
    // Calculate height based on media type and aspect ratio
    // For images: 16:9 aspect ratio
    // For videos: 16:9 aspect ratio
    return MediaQuery.of(context).size.width * 9 / 16;
  }

  String _formatTimestamp(DateTime timestamp) {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inMinutes < 1) {
      return 'Just now';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inDays < 1) {
      return '${difference.inHours}h ago';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}d ago';
    } else {
      return DateFormat('MMM d, yyyy').format(timestamp);
    }
  }

  void _showMoreOptions() {
    showModalBottomSheet(
      context: context,
      backgroundColor: BaniTalkTheme.surface,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 40,
            height: 4,
            margin: const EdgeInsets.symmetric(vertical: 12),
            decoration: BoxDecoration(
              color: BaniTalkTheme.surface2,
              borderRadius: BorderRadius.circular(2),
            ),
          ),
          ListTile(
            leading: Icon(Icons.report_outlined, color: BaniTalkTheme.textSecondary),
            title: Text('Report Post', style: TextStyle(color: BaniTalkTheme.textBody)),
            onTap: () {
              Navigator.pop(context);
              // Implement report functionality
            },
          ),
          ListTile(
            leading: Icon(Icons.block_outlined, color: BaniTalkTheme.textSecondary),
            title: Text('Block User', style: TextStyle(color: BaniTalkTheme.textBody)),
            onTap: () {
              Navigator.pop(context);
              // Implement block functionality
            },
          ),
          const SizedBox(height: 20),
        ],
      ),
    );
  }
}
