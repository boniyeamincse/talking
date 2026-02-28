enum UserBadge { vip, nativeSpeaker, aiCoach }

class UserProfile {
  final int id;
  final String name;
  final String username;
  final String email;
  final String? avatarUrl;
  final String? bio;
  final int followersCount;
  final int followingCount;
  final int giftsCount;
  final bool isFollowing;
  final bool isOnline;
  final List<UserBadge> badges;

  UserProfile({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    this.avatarUrl,
    this.bio,
    this.followersCount = 0,
    this.followingCount = 0,
    this.giftsCount = 0,
    this.isFollowing = false,
    this.isOnline = false,
    this.badges = const [],
  });

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['id'],
      name: json['name'],
      username: json['username'],
      email: json['email'],
      avatarUrl: json['avatar_url'],
      bio: json['bio'],
      followersCount: json['followers_count'] ?? 0,
      followingCount: json['following_count'] ?? 0,
      giftsCount: json['gifts_count'] ?? 0,
      isFollowing: json['is_following'] ?? false,
      isOnline: json['is_online'] ?? false,
      badges: (json['badges'] as List?)
              ?.map((e) => _parseBadge(e))
              .whereType<UserBadge>()
              .toList() ??
          [],
    );
  }

  static UserBadge? _parseBadge(String badge) {
    switch (badge.toLowerCase()) {
      case 'vip':
        return UserBadge.vip;
      case 'native_speaker':
        return UserBadge.nativeSpeaker;
      case 'ai_coach':
        return UserBadge.aiCoach;
      default:
        return null;
    }
  }

  UserProfile copyWith({
    bool? isFollowing,
    int? followersCount,
  }) {
    return UserProfile(
      id: id,
      name: name,
      username: username,
      email: email,
      avatarUrl: avatarUrl,
      bio: bio,
      followersCount: followersCount ?? this.followersCount,
      followingCount: followingCount,
      giftsCount: giftsCount,
      isFollowing: isFollowing ?? this.isFollowing,
      isOnline: isOnline,
      badges: badges,
    );
  }
}
