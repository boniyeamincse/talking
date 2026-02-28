import 'package:equatable/equatable.dart';

class CommentEntity extends Equatable {
  final String id;
  final String postId;
  final String userId;
  final String username;
  final String userAvatar;
  final String content;
  final String? translatedContent;
  final String? parentId;
  final List<CommentEntity> replies;
  final int likesCount;
  final bool isLiked;
  final DateTime createdAt;
  final bool isTranslationEnabled;

  const CommentEntity({
    required this.id,
    required this.postId,
    required this.userId,
    required this.username,
    required this.userAvatar,
    required this.content,
    this.translatedContent,
    this.parentId,
    this.replies = const [],
    required this.likesCount,
    required this.isLiked,
    required this.createdAt,
    this.isTranslationEnabled = false,
  });

  CommentEntity copyWith({
    String? id,
    String? postId,
    String? userId,
    String? username,
    String? userAvatar,
    String? content,
    String? translatedContent,
    String? parentId,
    List<CommentEntity>? replies,
    int? likesCount,
    bool? isLiked,
    DateTime? createdAt,
    bool? isTranslationEnabled,
  }) {
    return CommentEntity(
      id: id ?? this.id,
      postId: postId ?? this.postId,
      userId: userId ?? this.userId,
      username: username ?? this.username,
      userAvatar: userAvatar ?? this.userAvatar,
      content: content ?? this.content,
      translatedContent: translatedContent ?? this.translatedContent,
      parentId: parentId ?? this.parentId,
      replies: replies ?? this.replies,
      likesCount: likesCount ?? this.likesCount,
      isLiked: isLiked ?? this.isLiked,
      createdAt: createdAt ?? this.createdAt,
      isTranslationEnabled: isTranslationEnabled ?? this.isTranslationEnabled,
    );
  }

  bool get hasReplies => replies.isNotEmpty;
  int get totalReplies => replies.length + replies.fold(0, (sum, reply) => sum + reply.totalReplies);

  @override
  List<Object?> get props => [
        id,
        postId,
        userId,
        username,
        userAvatar,
        content,
        translatedContent,
        parentId,
        replies,
        likesCount,
        isLiked,
        createdAt,
        isTranslationEnabled,
      ];
}
