import 'package:dartz/dartz.dart';
import '../entities/comment_entity.dart';
import '../repositories/social_feed_repository.dart';

class AddCommentUseCase {
  final SocialFeedRepository repository;

  AddCommentUseCase(this.repository);

  Future<Either<String, CommentEntity>> call(AddCommentParams params) {
    return repository.addComment(
      postId: params.postId,
      content: params.content,
      parentId: params.parentId,
    );
  }
}

class AddCommentParams {
  final String postId;
  final String content;
  final String? parentId;

  AddCommentParams({
    required this.postId,
    required this.content,
    this.parentId,
  });
}
