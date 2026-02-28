import 'package:dio/dio.dart';
import 'package:banitalk/core/network/api_client.dart';
import 'package:banitalk/features/auth/data/models/user_model.dart';
import 'package:banitalk/features/auth/domain/repositories/auth_repository.dart';

class AuthRepositoryImpl implements AuthRepository {
  final ApiClient apiClient;

  AuthRepositoryImpl({required this.apiClient});

  @override
  Future<AuthResult> login(String email, String password) async {
    // MOCK LOGIN FOR TESTING
    if (email == 'test@example.com' && password == 'password123') {
      return AuthResult(
        user: User(id: 1, name: 'Boni Test', username: 'boni_test', email: email),
        token: AuthToken(token: 'mock_token_123'),
      );
    }

    try {
      final response = await apiClient.dio.post('/auth/login', data: {
        'email': email,
        'password': password,
      });

      final data = response.data['data'];
      return AuthResult(
        user: User.fromJson(data['user']),
        token: AuthToken.fromJson(data['token']),
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<AuthResult> register(String name, String username, String email, String password) async {
    try {
      final response = await apiClient.dio.post('/auth/register', data: {
        'name': name,
        'username': username,
        'email': email,
        'password': password,
        'password_confirmation': password,
      });

      final data = response.data['data'];
      return AuthResult(
        user: User.fromJson(data['user']),
        token: AuthToken.fromJson(data['token']),
      );
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> logout() async {
    try {
      await apiClient.dio.post('/auth/logout');
    } catch (e) {
      rethrow;
    }
  }
}
