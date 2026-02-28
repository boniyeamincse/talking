import 'package:equatable/equatable.dart';

class PostEntity extends Equatable {
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

  const PostEntity({
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

  PostEntity copyWith({
    String? id,
    String? userId,
    String? username,
    String? userAvatar,
    String? content,
    String? translatedContent,
    List<String>? mediaUrls,
    List<String>? mediaTypes,
    int? likesCount,
    int? commentsCount,
    bool? isLiked,
    DateTime? createdAt,
    bool? isTranslationEnabled,
  }) {
    return PostEntity(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      username: username ?? this.username,
      userAvatar: userAvatar ?? this.userAvatar,
      content: content ?? this.content,
      translatedContent: translatedContent ?? this.translatedContent,
      mediaUrls: mediaUrls ?? this.mediaUrls,
      mediaTypes: mediaTypes ?? this.mediaTypes,
      likesCount: likesCount ?? this.likesCount,
      commentsCount: commentsCount ?? this.commentsCount,
      isLiked: isLiked ?? this.isLiked,
      createdAt: createdAt ?? this.createdAt,
      isTranslationEnabled: isTranslationEnabled ?? this.isTranslationEnabled,
    );
  }

  @override
  List<Object?> get props => [
        id,
        userId,
        username,
        userAvatar,
        content,
        translatedContent,
        mediaUrls,
        mediaTypes,
        likesCount,
        commentsCount,
        isLiked,
        createdAt,
        isTranslationEnabled,
      ];
}
