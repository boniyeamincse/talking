import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/social_feed_bloc.dart';
import '../bloc/social_feed_event.dart';
import '../bloc/social_feed_state.dart';
import '../../../domain/entities/comment_entity.dart';
import 'comment_widget.dart';
import 'mention_input.dart';

class CommentsBottomSheet extends StatefulWidget {
  final String postId;

  const CommentsBottomSheet({
    super.key,
    required this.postId,
  });

  @override
  State<CommentsBottomSheet> createState() => _CommentsBottomSheetState();
}

class _CommentsBottomSheetState extends State<CommentsBottomSheet> {
  final TextEditingController _commentController = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  String? _replyingToCommentId;
  String? _replyingToUsername;

  @override
  void initState() {
    super.initState();
    context.read<SocialFeedBloc>().add(LoadCommentsEvent(widget.postId));
  }

  @override
  void dispose() {
    _commentController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: BoxDecoration(
        color: BaniTalkTheme.surface,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        children: [
          _buildHeader(),
          Expanded(child: _buildCommentsList()),
          _buildCommentInput(),
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
              'Comments',
              style: TextStyle(
                color: BaniTalkTheme.textBody,
                fontSize: 18,
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
          ),
          const SizedBox(width: 48), // Balance the close button
        ],
      ),
    );
  }

  Widget _buildCommentsList() {
    return BlocBuilder<SocialFeedBloc, SocialFeedState>(
      builder: (context, state) {
        if (state is CommentsLoading) {
          return const Center(
            child: CircularProgressIndicator(
              valueColor: AlwaysStoppedAnimation(BaniTalkTheme.primary),
            ),
          );
        }

        if (state is CommentsLoaded && state.postId == widget.postId) {
          final comments = state.comments;
          
          if (comments.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.comment_outlined,
                    size: 64,
                    color: BaniTalkTheme.textSecondary,
                  ),
                  const SizedBox(height: 16),
                  Text(
                    'No comments yet',
                    style: TextStyle(
                      color: BaniTalkTheme.textSecondary,
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Be the first to comment!',
                    style: TextStyle(
                      color: BaniTalkTheme.textSecondary,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            padding: const EdgeInsets.all(16),
            itemCount: comments.length,
            itemBuilder: (context, index) {
              final comment = comments[index];
              return CommentWidget(
                comment: comment,
                onReply: () => _replyToComment(comment),
                onLike: () => _likeComment(comment.id),
                onTranslate: () => _translateComment(comment.id),
                onReplyToReply: (replyComment) => _replyToComment(replyComment),
              );
            },
          );
        }

        if (state is SocialFeedError) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.error_outline,
                  size: 64,
                  color: BaniTalkTheme.textSecondary,
                ),
                const SizedBox(height: 16),
                Text(
                  state.message,
                  style: TextStyle(
                    color: BaniTalkTheme.textSecondary,
                    fontSize: 16,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () {
                    context.read<SocialFeedBloc>().add(LoadCommentsEvent(widget.postId));
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: BaniTalkTheme.primary,
                    foregroundColor: Colors.white,
                  ),
                  child: const Text('Retry'),
                ),
              ],
            ),
          );
        }

        return const SizedBox.shrink();
      },
    );
  }

  Widget _buildCommentInput() {
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (_replyingToUsername != null) ...[
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              margin: const EdgeInsets.only(bottom: 8),
              decoration: BoxDecoration(
                color: BaniTalkTheme.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  Icon(
                    Icons.reply,
                    color: BaniTalkTheme.primary,
                    size: 16,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Replying to @$_replyingToUsername',
                      style: TextStyle(
                        color: BaniTalkTheme.primary,
                        fontSize: 12,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                  GestureDetector(
                    onTap: _cancelReply,
                    child: Icon(
                      Icons.close,
                      color: BaniTalkTheme.primary,
                      size: 16,
                    ),
                  ),
                ],
              ),
            ),
          ],
          Row(
            children: [
              Expanded(
                child: MentionInput(
                  controller: _commentController,
                  focusNode: _focusNode,
                  hintText: _replyingToUsername != null 
                      ? 'Write a reply...' 
                      : 'Add a comment...',
                  onMentionAdded: (username) {
                    // Handle mention added
                  },
                ),
              ),
              const SizedBox(width: 8),
              GestureDetector(
                onTap: _canPostComment() ? _postComment : null,
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: _canPostComment() ? BaniTalkTheme.primary : BaniTalkTheme.surface2,
                    shape: BoxShape.circle,
                  ),
                  child: Icon(
                    Icons.send,
                    color: _canPostComment() ? Colors.white : BaniTalkTheme.textSecondary,
                    size: 20,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }

  void _replyToComment(CommentEntity comment) {
    setState(() {
      _replyingToCommentId = comment.id;
      _replyingToUsername = comment.username;
      _commentController.text = '@${comment.username} ';
      _focusNode.requestFocus();
    });
  }

  void _cancelReply() {
    setState(() {
      _replyingToCommentId = null;
      _replyingToUsername = null;
      _commentController.clear();
    });
  }

  bool _canPostComment() {
    return _commentController.text.trim().isNotEmpty;
  }

  void _postComment() {
    if (!_canPostComment()) return;

    final content = _commentController.text.trim();
    
    context.read<SocialFeedBloc>().add(
          AddCommentEvent(
            postId: widget.postId,
            content: content,
            parentId: _replyingToCommentId,
          ),
        );

    _commentController.clear();
    _cancelReply();
    _focusNode.unfocus();
  }

  void _likeComment(String commentId) {
    context.read<SocialFeedBloc>().add(LikeCommentEvent(commentId));
  }

  void _translateComment(String commentId) {
    context.read<SocialFeedBloc>().add(ToggleCommentTranslationEvent(commentId));
  }
}
