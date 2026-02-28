import 'package:banitalk/features/auth/data/models/user_model.dart';

abstract class AuthRepository {
  Future<AuthResult> login(String email, String password);
  Future<AuthResult> register(String name, String username, String email, String password);
  Future<void> logout();
}

class AuthResult {
  final User user;
  final AuthToken token;

  AuthResult({required this.user, required this.token});
}
