import 'package:dartz/dartz.dart';
import '../entities/post_entity.dart';
import '../repositories/social_feed_repository.dart';

class GetFeedUseCase {
  final SocialFeedRepository repository;

  GetFeedUseCase(this.repository);

  Future<Either<String, List<PostEntity>>> call(GetFeedParams params) {
    return repository.getFeed(page: params.page);
  }
}

class GetFeedParams {
  final int page;

  GetFeedParams({required this.page});
}
