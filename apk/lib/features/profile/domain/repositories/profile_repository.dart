import '../data/models/user_profile_model.dart';

abstract class ProfileRepository {
  Future<UserProfile> getProfile(int userId);
  Future<List<UserProfile>> searchUsers(String query);
  Future<void> followUser(int userId);
  Future<void> unfollowUser(int userId);
  Future<void> blockUser(int userId);
}
