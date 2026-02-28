import 'package:dartz/dartz.dart';
import 'package:dio/dio.dart';
import '../../../core/network/api_client.dart';
import '../../domain/entities/post_entity.dart';
import '../../domain/entities/comment_entity.dart';
import '../../domain/repositories/social_feed_repository.dart';
import '../models/post_model.dart';
import '../models/comment_model.dart';

class SocialFeedRepositoryImpl implements SocialFeedRepository {
  final ApiClient apiClient;

  SocialFeedRepositoryImpl({required this.apiClient});

  @override
  Future<Either<String, List<PostEntity>>> getFeed({required int page}) async {
    try {
      final response = await apiClient.dio.get('/posts', queryParameters: {'page': page});
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        final posts = data.map((json) => PostModel.fromJson(json).toEntity()).toList();
        return Right(posts);
      } else {
        return Left('Failed to load feed');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, void>> likePost({required String postId, bool unlike = false}) async {
    try {
      final response = await apiClient.dio.post(
        unlike ? '/posts/$postId/unlike' : '/posts/$postId/like',
      );
      
      if (response.statusCode == 200) {
        return const Right(null);
      } else {
        return Left('Failed to ${unlike ? 'unlike' : 'like'} post');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, PostEntity>> createPost({
    required String content,
    required List<String> mediaFiles,
    required List<String> mediaTypes,
  }) async {
    try {
      final formData = FormData.fromMap({
        'content': content,
        'media_files': mediaFiles.map((file) => MultipartFile.fromString(file)).toList(),
        'media_types': mediaTypes,
      });

      final response = await apiClient.dio.post('/posts', data: formData);
      
      if (response.statusCode == 201) {
        final post = PostModel.fromJson(response.data['data']).toEntity();
        return Right(post);
      } else {
        return Left('Failed to create post');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, List<CommentEntity>>> getComments({required String postId}) async {
    try {
      final response = await apiClient.dio.get('/posts/$postId/comments');
      
      if (response.statusCode == 200) {
        final List<dynamic> data = response.data['data'];
        final comments = data.map((json) => CommentModel.fromJson(json).toEntity()).toList();
        return Right(comments);
      } else {
        return Left('Failed to load comments');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, CommentEntity>> addComment({
    required String postId,
    required String content,
    String? parentId,
  }) async {
    try {
      final response = await apiClient.dio.post(
        '/posts/$postId/comments',
        data: {
          'content': content,
          if (parentId != null) 'parent_id': parentId,
        },
      );
      
      if (response.statusCode == 201) {
        final comment = CommentModel.fromJson(response.data['data']).toEntity();
        return Right(comment);
      } else {
        return Left('Failed to add comment');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, void>> likeComment({required String commentId, bool unlike = false}) async {
    try {
      final response = await apiClient.dio.post(
        unlike ? '/comments/$commentId/unlike' : '/comments/$commentId/like',
      );
      
      if (response.statusCode == 200) {
        return const Right(null);
      } else {
        return Left('Failed to ${unlike ? 'unlike' : 'like'} comment');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }

  @override
  Future<Either<String, String>> translateContent({
    required String content,
    required String targetLanguage,
  }) async {
    try {
      final response = await apiClient.dio.post('/translate', data: {
        'content': content,
        'target_language': targetLanguage,
      });
      
      if (response.statusCode == 200) {
        final translatedContent = response.data['translated_content'];
        return Right(translatedContent);
      } else {
        return Left('Failed to translate content');
      }
    } on DioException catch (e) {
      return Left(e.response?.data['message'] ?? 'Network error');
    } catch (e) {
      return Left('Unexpected error: ${e.toString()}');
    }
  }
}
