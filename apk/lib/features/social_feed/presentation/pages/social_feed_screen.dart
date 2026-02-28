import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:video_player/video_player.dart';
import 'package:chewie/chewie.dart';
import '../../../../core/theme/app_theme.dart';
import '../bloc/social_feed_bloc.dart';
import '../bloc/social_feed_event.dart';
import '../bloc/social_feed_state.dart';
import '../widgets/post_card.dart';
import '../widgets/video_player_widget.dart';
import '../widgets/create_post_bottom_sheet.dart';

class SocialFeedScreen extends StatefulWidget {
  const SocialFeedScreen({super.key});

  @override
  State<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends State<SocialFeedScreen> {
  final ScrollController _scrollController = ScrollController();
  bool _isVideoInitialized = false;

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
    context.read<SocialFeedBloc>().add(LoadFeedEvent(refresh: true));
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent - 200) {
      context.read<SocialFeedBloc>().add(LoadMorePostsEvent());
    }
  }

  void _showCreatePostBottomSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CreatePostBottomSheet(
        onPostCreated: (content, mediaFiles, mediaTypes) {
          context.read<SocialFeedBloc>().add(
                CreatePostEvent(
                  content: content,
                  mediaFiles: mediaFiles,
                  mediaTypes: mediaTypes,
                ),
              );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: BaniTalkTheme.background,
      appBar: AppBar(
        backgroundColor: BaniTalkTheme.surface,
        elevation: 0,
        title: Text(
          'Moments',
          style: TextStyle(
            color: BaniTalkTheme.textBody,
            fontWeight: FontWeight.bold,
            fontSize: 24,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: Icon(
              Icons.add_circle_outline,
              color: BaniTalkTheme.primary,
              size: 28,
            ),
            onPressed: _showCreatePostBottomSheet,
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          context.read<SocialFeedBloc>().add(LoadFeedEvent(refresh: true));
        },
        color: BaniTalkTheme.primary,
        child: BlocBuilder<SocialFeedBloc, SocialFeedState>(
          builder: (context, state) {
            if (state is SocialFeedLoading && state.isRefreshing) {
              return const Center(
                child: CircularProgressIndicator(
                  valueColor: AlwaysStoppedAnimation(BaniTalkTheme.primary),
                ),
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
                        context.read<SocialFeedBloc>().add(LoadFeedEvent(refresh: true));
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

            if (state is SocialFeedLoaded) {
              if (state.posts.isEmpty) {
                return Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(
                        Icons.photo_camera_outlined,
                        size: 64,
                        color: BaniTalkTheme.textSecondary,
                      ),
                      const SizedBox(height: 16),
                      Text(
                        'No moments yet',
                        style: TextStyle(
                          color: BaniTalkTheme.textSecondary,
                          fontSize: 18,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Be the first to share a moment!',
                        style: TextStyle(
                          color: BaniTalkTheme.textSecondary,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 24),
                      ElevatedButton.icon(
                        onPressed: _showCreatePostBottomSheet,
                        icon: const Icon(Icons.add),
                        label: const Text('Create First Moment'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: BaniTalkTheme.primary,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(
                            horizontal: 24,
                            vertical: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              }

              return NotificationListener<ScrollNotification>(
                onNotification: (notification) {
                  if (notification is ScrollEndNotification) {
                    // Handle video auto-play/pause based on visibility
                    _handleVideoVisibility();
                  }
                  return false;
                },
                child: ListView.builder(
                  controller: _scrollController,
                  physics: const AlwaysScrollableScrollPhysics(),
                  itemCount: state.posts.length + (state.hasReachedMax ? 0 : 1),
                  itemBuilder: (context, index) {
                    if (index < state.posts.length) {
                      final post = state.posts[index];
                      return PostCard(
                        post: post,
                        onLike: () {
                          if (post.isLiked) {
                            context.read<SocialFeedBloc>().add(UnlikePostEvent(post.id));
                          } else {
                            context.read<SocialFeedBloc>().add(LikePostEvent(post.id));
                          }
                        },
                        onComment: () {
                          _showCommentsBottomSheet(post.id);
                        },
                        onToggleTranslation: () {
                          context.read<SocialFeedBloc>().add(ToggleTranslationEvent(post.id));
                        },
                        onShare: () {
                          // Implement share functionality
                        },
                      );
                    } else {
                      return const Padding(
                        padding: EdgeInsets.all(16),
                        child: Center(
                          child: CircularProgressIndicator(
                            valueColor: AlwaysStoppedAnimation(BaniTalkTheme.primary),
                          ),
                        ),
                      );
                    }
                  },
                ),
              );
            }

            return const Center(
              child: CircularProgressIndicator(
                valueColor: AlwaysStoppedAnimation(BaniTalkTheme.primary),
              ),
            );
          },
        ),
      ),
    );
  }

  void _handleVideoVisibility() {
    // Implement video visibility logic for auto-play/pause
    // This would track which videos are visible and play/pause accordingly
  }

  void _showCommentsBottomSheet(String postId) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CommentsBottomSheet(postId: postId),
    );
  }
}
