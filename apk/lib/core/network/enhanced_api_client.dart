import 'package:dio/dio.dart';
import 'package:banitalk/core/config/env_config.dart';
import 'package:banitalk/core/network/certificate_pinning.dart';
import 'package:banitalk/core/storage/secure_storage.dart';

/// Enhanced API client with security features
/// Addresses multiple audit issues:
/// - Environment-based configuration
/// - Certificate pinning
/// - Secure token management
/// - Token refresh mechanism
/// - Request/response logging
class EnhancedApiClient {
  late final Dio _dio;
  
  EnhancedApiClient() {
    _dio = Dio(
      BaseOptions(
        baseUrl: EnvConfig.apiBaseUrl,
        connectTimeout: EnvConfig.apiTimeout,
        receiveTimeout: EnvConfig.apiTimeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        },
      ),
    );
    
    _setupInterceptors();
    _setupCertificatePinning();
  }
  
  /// Setup request/response interceptors
  void _setupInterceptors() {
    // Logging interceptor (only in development)
    if (EnvConfig.enableLogging) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          error: true,
          requestHeader: true,
          responseHeader: false,
        ),
      );
    }
    
    // Auth interceptor
    _dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: _onRequest,
        onError: _onError,
      ),
    );
  }
  
  /// Setup certificate pinning
  void _setupCertificatePinning() {
    if (EnvConfig.isProduction || EnvConfig.isStaging) {
      CertificatePinning.setupCertificatePinning(_dio);
    }
  }
  
  /// Handle request - add auth token
  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Add auth token if available
    final token = await SecureStorage.getAuthToken();
    if (token != null) {
      options.headers['Authorization'] = 'Bearer $token';
    }
    
    // Add device ID
    final deviceId = await SecureStorage.getDeviceId();
    if (deviceId != null) {
      options.headers['X-Device-ID'] = deviceId;
    }
    
    // Add app version
    options.headers['X-App-Version'] = '1.0.0';
    options.headers['X-Platform'] = 'mobile';
    
    handler.next(options);
  }
  
  /// Handle errors - implement token refresh
  Future<void> _onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    // Handle 401 - Token expired
    if (err.response?.statusCode == 401) {
      try {
        // Try to refresh token
        final refreshed = await _refreshToken();
        
        if (refreshed) {
          // Retry original request with new token
          final options = err.requestOptions;
          final token = await SecureStorage.getAuthToken();
          options.headers['Authorization'] = 'Bearer $token';
          
          try {
            final response = await _dio.fetch(options);
            return handler.resolve(response);
          } catch (e) {
            return handler.reject(err);
          }
        } else {
          // Refresh failed - logout user
          await _handleLogout();
          return handler.reject(err);
        }
      } catch (e) {
        await _handleLogout();
        return handler.reject(err);
      }
    }
    
    // Handle 403 - Forbidden
    if (err.response?.statusCode == 403) {
      // User doesn't have permission
      // Could show a dialog or navigate to error page
    }
    
    // Handle network errors
    if (err.type == DioExceptionType.connectionTimeout ||
        err.type == DioExceptionType.receiveTimeout ||
        err.type == DioExceptionType.sendTimeout) {
      // Network timeout - could retry or show error
    }
    
    handler.next(err);
  }
  
  /// Refresh authentication token
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await SecureStorage.getRefreshToken();
      if (refreshToken == null) return false;
      
      final response = await _dio.post(
        '/auth/refresh',
        data: {'refresh_token': refreshToken},
      );
      
      if (response.statusCode == 200) {
        final data = response.data['data'];
        await SecureStorage.saveAuthToken(data['access_token']);
        
        // Update refresh token if provided
        if (data['refresh_token'] != null) {
          await SecureStorage.saveRefreshToken(data['refresh_token']);
        }
        
        return true;
      }
      
      return false;
    } catch (e) {
      if (EnvConfig.enableLogging) {
        print('Token refresh failed: $e');
      }
      return false;
    }
  }
  
  /// Handle logout
  Future<void> _handleLogout() async {
    await SecureStorage.clearAuthData();
    // Navigate to login screen
    // This should be handled by your navigation logic
  }
  
  /// Get Dio instance
  Dio get dio => _dio;
  
  // Convenience methods
  
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
  
  Future<Response<T>> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) {
    return _dio.patch<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
    );
  }
}
