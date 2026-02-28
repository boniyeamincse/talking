class User {
  final int id;
  final String name;
  final String username;
  final String email;
  final String? avatarUrl;

  User({
    required this.id,
    required this.name,
    required this.username,
    required this.email,
    this.avatarUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'],
      username: json['username'],
      email: json['email'],
      avatarUrl: json['avatar_url'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'username': username,
      'email': email,
      'avatar_url': avatarUrl,
    };
  }
}

class AuthToken {
  final String token;
  final String tokenType;

  AuthToken({
    required this.token,
    this.tokenType = 'Bearer',
  });

  factory AuthToken.fromJson(Map<String, dynamic> json) {
    return AuthToken(
      token: json['token'],
      tokenType: json['token_type'] ?? 'Bearer',
    );
  }

  String get fullToken => '$tokenType $token';
}
