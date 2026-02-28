import 'package:banitalk/core/network/api_client.dart';
import '../../data/models/user_profile_model.dart';
import '../../domain/repositories/profile_repository.dart';

class ProfileRepositoryImpl implements ProfileRepository {
  final ApiClient apiClient;

  ProfileRepositoryImpl({required this.apiClient});

  @override
  Future<UserProfile> getProfile(int userId) async {
    try {
      final response = await apiClient.dio.get('/profiles/$userId');
      return UserProfile.fromJson(response.data['data']);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<UserProfile>> searchUsers(String query) async {
    try {
      final response = await apiClient.dio.get('/users/search', queryParameters: {'q': query});
      final List data = response.data['data'];
      return data.map((e) => UserProfile.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> followUser(int userId) async {
    try {
      await apiClient.dio.post('/users/$userId/follow');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> unfollowUser(int userId) async {
    try {
      await apiClient.dio.post('/users/$userId/unfollow');
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> blockUser(int userId) async {
    try {
      await apiClient.dio.post('/users/$userId/block');
    } catch (e) {
      rethrow;
    }
  }
}
