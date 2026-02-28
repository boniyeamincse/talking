import '../../domain/entities/post_entity.dart';

class PostModel {
  final String id;
  final String userId;
  final String username;
  final String userAvatar;
  final String content;
  final String? translatedContent;
  final List<String> mediaUrls;
  final List<String> mediaTypes;
  final int likesCount;
  final int commentsCount;
  final bool isLiked;
  final DateTime createdAt;
  final bool isTranslationEnabled;

  PostModel({
    required this.id,
    required this.userId,
    required this.username,
    required this.userAvatar,
    required this.content,
    this.translatedContent,
    required this.mediaUrls,
    required this.mediaTypes,
    required this.likesCount,
    required this.commentsCount,
    required this.isLiked,
    required this.createdAt,
    this.isTranslationEnabled = false,
  });

  factory PostModel.fromJson(Map<String, dynamic> json) {
    return PostModel(
      id: json['id'].toString(),
      userId: json['user_id'].toString(),
      username: json['username'] ?? '',
      userAvatar: json['user_avatar'] ?? '',
      content: json['content'] ?? '',
      translatedContent: json['translated_content'],
      mediaUrls: List<String>.from(json['media_urls'] ?? []),
      mediaTypes: List<String>.from(json['media_types'] ?? []),
      likesCount: json['likes_count'] ?? 0,
      commentsCount: json['comments_count'] ?? 0,
      isLiked: json['is_liked'] ?? false,
      createdAt: DateTime.parse(json['created_at']),
      isTranslationEnabled: json['is_translation_enabled'] ?? false,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user_id': userId,
      'username': username,
      'user_avatar': userAvatar,
      'content': content,
      if (translatedContent != null) 'translated_content': translatedContent,
      'media_urls': mediaUrls,
      'media_types': mediaTypes,
      'likes_count': likesCount,
      'comments_count': commentsCount,
      'is_liked': isLiked,
      'created_at': createdAt.toIso8601String(),
      'is_translation_enabled': isTranslationEnabled,
    };
  }

  PostEntity toEntity() {
    return PostEntity(
      id: id,
      userId: userId,
      username: username,
      userAvatar: userAvatar,
      content: content,
      translatedContent: translatedContent,
      mediaUrls: mediaUrls,
      mediaTypes: mediaTypes,
      likesCount: likesCount,
      commentsCount: commentsCount,
      isLiked: isLiked,
      createdAt: createdAt,
      isTranslationEnabled: isTranslationEnabled,
    );
  }

  factory PostModel.fromEntity(PostEntity entity) {
    return PostModel(
      id: entity.id,
      userId: entity.userId,
      username: entity.username,
      userAvatar: entity.userAvatar,
      content: entity.content,
      translatedContent: entity.translatedContent,
      mediaUrls: entity.mediaUrls,
      mediaTypes: entity.mediaTypes,
      likesCount: entity.likesCount,
      commentsCount: entity.commentsCount,
      isLiked: entity.isLiked,
      createdAt: entity.createdAt,
      isTranslationEnabled: entity.isTranslationEnabled,
    );
  }
}
