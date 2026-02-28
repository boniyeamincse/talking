import 'package:dartz/dartz.dart';
import '../entities/post_entity.dart';
import '../entities/comment_entity.dart';

abstract class SocialFeedRepository {
  Future<Either<String, List<PostEntity>>> getFeed({required int page});
  Future<Either<String, void>> likePost({required String postId, bool unlike = false});
  Future<Either<String, PostEntity>> createPost({
    required String content,
    required List<String> mediaFiles,
    required List<String> mediaTypes,
  });
  Future<Either<String, List<CommentEntity>>> getComments({required String postId});
  Future<Either<String, CommentEntity>> addComment({
    required String postId,
    required String content,
    String? parentId,
  });
  Future<Either<String, void>> likeComment({required String commentId, bool unlike = false});
  Future<Either<String, String>> translateContent({
    required String content,
    required String targetLanguage,
  });
}
