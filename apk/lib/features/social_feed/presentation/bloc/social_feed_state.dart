part of 'social_feed_bloc.dart';

abstract class SocialFeedState extends Equatable {
  const SocialFeedState();

  @override
  List<Object> get props => [];
}

class SocialFeedInitial extends SocialFeedState {}

class SocialFeedLoading extends SocialFeedState {
  final bool isRefreshing;

  const SocialFeedLoading({this.isRefreshing = false});

  @override
  List<Object> get props => [isRefreshing];
}

class SocialFeedLoaded extends SocialFeedState {
  final List<PostEntity> posts;
  final bool hasReachedMax;
  final Map<String, List<CommentEntity>> comments;

  const SocialFeedLoaded({
    required this.posts,
    this.hasReachedMax = false,
    this.comments = const {},
  });

  SocialFeedLoaded copyWith({
    List<PostEntity>? posts,
    bool? hasReachedMax,
    Map<String, List<CommentEntity>>? comments,
  }) {
    return SocialFeedLoaded(
      posts: posts ?? this.posts,
      hasReachedMax: hasReachedMax ?? this.hasReachedMax,
      comments: comments ?? this.comments,
    );
  }

  @override
  List<Object> get props => [posts, hasReachedMax, comments];
}

class SocialFeedError extends SocialFeedState {
  final String message;

  const SocialFeedError(this.message);

  @override
  List<Object> get props => [message];
}

class PostActionLoading extends SocialFeedState {
  final String postId;
  final SocialFeedState previousState;

  const PostActionLoading(this.postId, this.previousState);

  @override
  List<Object> get props => [postId, previousState];
}

class CommentsLoading extends SocialFeedState {
  final String postId;

  const CommentsLoading(this.postId);

  @override
  List<Object> get props => [postId];
}

class CommentsLoaded extends SocialFeedState {
  final String postId;
  final List<CommentEntity> comments;

  const CommentsLoaded({
    required this.postId,
    required this.comments,
  });

  @override
  List<Object> get props => [postId, comments];
}
