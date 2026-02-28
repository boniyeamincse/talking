import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:intl/intl.dart';
import '../../../domain/entities/comment_entity.dart';
import '../../../../core/theme/app_theme.dart';
import 'translation_toggle.dart';

class CommentWidget extends StatelessWidget {
  final CommentEntity comment;
  final VoidCallback onReply;
  final VoidCallback onLike;
  final VoidCallback onTranslate;
  final VoidCallback? onReplyToReply;

  const CommentWidget({
    super.key,
    required this.comment,
    required this.onReply,
    required this.onLike,
    required this.onTranslate,
    this.onReplyToReply,
  });

  @override
  Widget build(BuildContext context) {
    final isReply = comment.parentId != null;
    
    return Container(
      margin: EdgeInsets.only(
        bottom: 16,
        left: isReply ? 32 : 0,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              CircleAvatar(
                radius: 16,
                backgroundColor: BaniTalkTheme.surface2,
                backgroundImage: comment.userAvatar.isNotEmpty
                    ? CachedNetworkImageProvider(comment.userAvatar)
                    : null,
                child: comment.userAvatar.isEmpty
                    ? Icon(
                        Icons.person,
                        color: BaniTalkTheme.textSecondary,
                        size: 18,
                      )
                    : null,
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          comment.username,
                          style: TextStyle(
                            color: BaniTalkTheme.textBody,
                            fontWeight: FontWeight.w600,
                            fontSize: 14,
                          ),
                        ),
                        if (isReply) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: BaniTalkTheme.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: Text(
                              'Reply',
                              style: TextStyle(
                                color: BaniTalkTheme.primary,
                                fontSize: 10,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                        ],
                        const Spacer(),
                        Text(
                          _formatTimestamp(comment.createdAt),
                          style: TextStyle(
                            color: BaniTalkTheme.textSecondary,
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    _buildCommentContent(),
                    const SizedBox(height: 8),
                    _buildCommentActions(),
                  ],
                ),
              ),
            ],
          ),
          if (comment.hasReplies) ...[
            const SizedBox(height: 12),
            _buildRepliesSection(),
          ],
        ],
      ),
    );
  }

  Widget _buildCommentContent() {
    final displayContent = comment.isTranslationEnabled && 
                          comment.translatedContent != null
        ? comment.translatedContent!
        : comment.content;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          displayContent,
          style: TextStyle(
            color: BaniTalkTheme.textBody,
            fontSize: 14,
            height: 1.4,
          ),
        ),
        const SizedBox(height: 8),
        TranslationToggle(
          isEnabled: comment.isTranslationEnabled,
          onTap: onTranslate,
        ),
      ],
    );
  }

  Widget _buildCommentActions() {
    return Row(
      children: [
        _buildActionButton(
          icon: comment.isLiked ? Icons.favorite : Icons.favorite_border,
          label: comment.likesCount > 0 ? comment.likesCount.toString() : 'Like',
          isActive: comment.isLiked,
          onTap: onLike,
        ),
        const SizedBox(width: 16),
        _buildActionButton(
          icon: Icons.reply,
          label: 'Reply',
          onTap: onReply,
        ),
        if (comment.hasReplies) ...[
          const SizedBox(width: 16),
          GestureDetector(
            onTap: () {
              // Toggle replies visibility
            },
            child: Text(
              '${comment.totalReplies} ${comment.totalReplies == 1 ? 'reply' : 'replies'}',
              style: TextStyle(
                color: BaniTalkTheme.primary,
                fontSize: 12,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ],
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
            size: 16,
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

  Widget _buildRepliesSection() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (comment.replies.isNotEmpty) ...[
          ...comment.replies.map((reply) => CommentWidget(
            key: ValueKey(reply.id),
            comment: reply,
            onReply: () => onReplyToReply?.call(reply),
            onLike: () => onLike,
            onTranslate: () => onTranslate,
            onReplyToReply: onReplyToReply,
          )),
        ],
        if (comment.totalReplies > comment.replies.length) ...[
          const SizedBox(height: 8),
          GestureDetector(
            onTap: () {
              // Load more replies
            },
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: BaniTalkTheme.surface2,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                'View ${comment.totalReplies - comment.replies.length} more replies',
                style: TextStyle(
                  color: BaniTalkTheme.primary,
                  fontSize: 12,
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ),
        ],
      ],
    );
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
      return DateFormat('MMM d').format(timestamp);
    }
  }
}
