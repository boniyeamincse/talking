part of 'social_feed_bloc.dart';

abstract class SocialFeedEvent extends Equatable {
  const SocialFeedEvent();

  @override
  List<Object> get props => [];
}

class LoadFeedEvent extends SocialFeedEvent {
  final bool refresh;

  const LoadFeedEvent({this.refresh = false});

  @override
  List<Object> get props => [refresh];
}

class LoadMorePostsEvent extends SocialFeedEvent {}

class LikePostEvent extends SocialFeedEvent {
  final String postId;

  const LikePostEvent(this.postId);

  @override
  List<Object> get props => [postId];
}

class UnlikePostEvent extends SocialFeedEvent {
  final String postId;

  const UnlikePostEvent(this.postId);

  @override
  List<Object> get props => [postId];
}

class ToggleTranslationEvent extends SocialFeedEvent {
  final String postId;

  const ToggleTranslationEvent(this.postId);

  @override
  List<Object> get props => [postId];
}

class CreatePostEvent extends SocialFeedEvent {
  final String content;
  final List<String> mediaFiles;
  final List<String> mediaTypes;

  const CreatePostEvent({
    required this.content,
    required this.mediaFiles,
    required this.mediaTypes,
  });

  @override
  List<Object> get props => [content, mediaFiles, mediaTypes];
}

class LoadCommentsEvent extends SocialFeedEvent {
  final String postId;

  const LoadCommentsEvent(this.postId);

  @override
  List<Object> get props => [postId];
}

class AddCommentEvent extends SocialFeedEvent {
  final String postId;
  final String content;
  final String? parentId;

  const AddCommentEvent({
    required this.postId,
    required this.content,
    this.parentId,
  });

  @override
  List<Object> get props => [postId, content, parentId];
}

class LikeCommentEvent extends SocialFeedEvent {
  final String commentId;

  const LikeCommentEvent(this.commentId);

  @override
  List<Object> get props => [commentId];
}

class ToggleCommentTranslationEvent extends SocialFeedEvent {
  final String commentId;

  const ToggleCommentTranslationEvent(this.commentId);

  @override
  List<Object> get props => [commentId];
}
