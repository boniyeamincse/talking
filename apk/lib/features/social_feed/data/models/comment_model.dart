import '../../domain/entities/comment_entity.dart';

class CommentModel {
  final String id;
  final String postId;
  final String userId;
  final String username;
  final String userAvatar;
  final String content;
  final String? translatedContent;
  final String? parentId;
  final List<CommentModel> replies;
  final int likesCount;
  final bool isLiked;
  final DateTime createdAt;
  final bool isTranslationEnabled;

  CommentModel({
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

  factory CommentModel.fromJson(Map<String, dynamic> json) {
    return CommentModel(
      id: json['id'].toString(),
      postId: json['post_id'].toString(),
      userId: json['user_id'].toString(),
      username: json['username'] ?? '',
      userAvatar: json['user_avatar'] ?? '',
      content: json['content'] ?? '',
      translatedContent: json['translated_content'],
      parentId: json['parent_id'],
      replies: (json['replies'] as List<dynamic>?)
          ?.map((reply) => CommentModel.fromJson(reply))
          .toList() ?? [],
      likesCount: json['likes_count'] ?? 0,
      isLiked: json['is_liked'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      isTranslationEnabled: json['is_translation_enabled'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'post_id': postId,
      'user_id': userId,
      'username': username,
      'user_avatar': userAvatar,
      'content': content,
      if (translatedContent != null) 'translated_content': translatedContent,
      if (parentId != null) 'parent_id': parentId,
      'replies': replies.map((reply) => reply.toJson()).toList(),
      'likes_count': likesCount,
      'is_liked': isLiked,
      'created_at': createdAt.toIso8601String(),
      'is_translation_enabled': isTranslationEnabled,
    };
  }

  CommentEntity toEntity() {
    return CommentEntity(
      id: id,
      postId: postId,
      userId: userId,
      username: username,
      userAvatar: userAvatar,
      content: content,
      translatedContent: translatedContent,
      parentId: parentId,
      replies: replies.map((reply) => reply.toEntity()).toList(),
      likesCount: likesCount,
      isLiked: isLiked,
      createdAt: createdAt,
      isTranslationEnabled: isTranslationEnabled,
    );
  }

  factory CommentModel.fromEntity(CommentEntity entity) {
    return CommentModel(
      id: entity.id,
      postId: entity.postId,
      userId: entity.userId,
      username: entity.username,
      userAvatar: entity.userAvatar,
      content: entity.content,
      translatedContent: entity.translatedContent,
      parentId: entity.parentId,
      replies: entity.replies.map((reply) => CommentModel.fromEntity(reply)).toList(),
      likesCount: entity.likesCount,
      isLiked: entity.isLiked,
      createdAt: entity.createdAt,
      isTranslationEnabled: entity.isTranslationEnabled,
    );
  }
}
