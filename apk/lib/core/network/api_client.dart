import 'package:dio/dio.dart';
import 'auth_interceptor.dart';

class ApiClient {
  static const String baseUrl = 'http://localhost:8000/api/v1';
  
  final Dio dio;

  ApiClient() : dio = Dio(
    BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    ),
  ) {
    dio.interceptors.add(LogInterceptor(responseBody: true, requestBody: true));
    dio.interceptors.add(AuthInterceptor());
  }
}
