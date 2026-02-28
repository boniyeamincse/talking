import 'package:dartz/dartz.dart';
import '../repositories/social_feed_repository.dart';

class TranslateContentUseCase {
  final SocialFeedRepository repository;

  TranslateContentUseCase(this.repository);

  Future<Either<String, String>> call(TranslateContentParams params) {
    return repository.translateContent(
      content: params.content,
      targetLanguage: params.targetLanguage,
    );
  }
}

class TranslateContentParams {
  final String content;
  final String targetLanguage;

  TranslateContentParams({
    required this.content,
    required this.targetLanguage,
  });
}
