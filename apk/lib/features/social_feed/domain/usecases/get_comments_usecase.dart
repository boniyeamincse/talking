import 'package:dartz/dartz.dart';
import '../entities/comment_entity.dart';
import '../repositories/social_feed_repository.dart';

class GetCommentsUseCase {
  final SocialFeedRepository repository;

  GetCommentsUseCase(this.repository);

  Future<Either<String, List<CommentEntity>>> call(GetCommentsParams params) {
    return repository.getComments(postId: params.postId);
  }
}

class GetCommentsParams {
  final String postId;

  GetCommentsParams({required this.postId});
}
