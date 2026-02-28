import 'package:dartz/dartz.dart';
import '../entities/post_entity.dart';
import '../repositories/social_feed_repository.dart';

class CreatePostUseCase {
  final SocialFeedRepository repository;

  CreatePostUseCase(this.repository);

  Future<Either<String, PostEntity>> call(CreatePostParams params) {
    return repository.createPost(
      content: params.content,
      mediaFiles: params.mediaFiles,
      mediaTypes: params.mediaTypes,
    );
  }
}

class CreatePostParams {
  final String content;
  final List<String> mediaFiles;
  final List<String> mediaTypes;

  CreatePostParams({
    required this.content,
    required this.mediaFiles,
    required this.mediaTypes,
  });
}
