import 'package:dartz/dartz.dart';
import '../repositories/social_feed_repository.dart';

class LikePostUseCase {
  final SocialFeedRepository repository;

  LikePostUseCase(this.repository);

  Future<Either<String, void>> call(LikePostParams params) {
    return repository.likePost(
      postId: params.postId,
      unlike: params.unlike,
    );
  }
}

class LikePostParams {
  final String postId;
  final bool unlike;

  LikePostParams({
    required this.postId,
    this.unlike = false,
  });
}
