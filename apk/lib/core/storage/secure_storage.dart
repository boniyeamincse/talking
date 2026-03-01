import 'package:flutter_secure_storage/flutter_secure_storage.dart';

/// Secure storage for sensitive data
/// Addresses CRITICAL issue from audit: Insecure token storage in SharedPreferences
class SecureStorage {
  static const _storage = FlutterSecureStorage(
    aOptions: AndroidOptions(
      encryptedSharedPreferences: true,
    ),
    iOptions: IOSOptions(
      accessibility: KeychainAccessibility.first_unlock,
    ),
  );
  
  // Storage keys
  static const String _keyAuthToken = 'auth_token';
  static const String _keyRefreshToken = 'refresh_token';
  static const String _keyUserId = 'user_id';
  static const String _keyUserEmail = 'user_email';
  static const String _keyBiometricEnabled = 'biometric_enabled';
  static const String _keyDeviceId = 'device_id';
  static const String _keyFcmToken = 'fcm_token';
  
  // Auth Token Management
  
  /// Save authentication token securely
  static Future<void> saveAuthToken(String token) async {
    await _storage.write(key: _keyAuthToken, value: token);
  }
  
  /// Get authentication token
  static Future<String?> getAuthToken() async {
    return await _storage.read(key: _keyAuthToken);
  }
  
  /// Delete authentication token
  static Future<void> deleteAuthToken() async {
    await _storage.delete(key: _keyAuthToken);
  }
  
  // Refresh Token Management
  
  /// Save refresh token securely
  static Future<void> saveRefreshToken(String token) async {
    await _storage.write(key: _keyRefreshToken, value: token);
  }
  
  /// Get refresh token
  static Future<String?> getRefreshToken() async {
    return await _storage.read(key: _keyRefreshToken);
  }
  
  /// Delete refresh token
  static Future<void> deleteRefreshToken() async {
    await _storage.delete(key: _keyRefreshToken);
  }
  
  // User Data Management
  
  /// Save user ID
  static Future<void> saveUserId(String userId) async {
    await _storage.write(key: _keyUserId, value: userId);
  }
  
  /// Get user ID
  static Future<String?> getUserId() async {
    return await _storage.read(key: _keyUserId);
  }
  
  /// Save user email
  static Future<void> saveUserEmail(String email) async {
    await _storage.write(key: _keyUserEmail, value: email);
  }
  
  /// Get user email
  static Future<String?> getUserEmail() async {
    return await _storage.read(key: _keyUserEmail);
  }
  
  // Biometric Authentication
  
  /// Enable/disable biometric authentication
  static Future<void> setBiometricEnabled(bool enabled) async {
    await _storage.write(
      key: _keyBiometricEnabled,
      value: enabled.toString(),
    );
  }
  
  /// Check if biometric authentication is enabled
  static Future<bool> isBiometricEnabled() async {
    final value = await _storage.read(key: _keyBiometricEnabled);
    return value == 'true';
  }
  
  // Device Management
  
  /// Save device ID
  static Future<void> saveDeviceId(String deviceId) async {
    await _storage.write(key: _keyDeviceId, value: deviceId);
  }
  
  /// Get device ID
  static Future<String?> getDeviceId() async {
    return await _storage.read(key: _keyDeviceId);
  }
  
  // FCM Token Management
  
  /// Save FCM token for push notifications
  static Future<void> saveFcmToken(String token) async {
    await _storage.write(key: _keyFcmToken, value: token);
  }
  
  /// Get FCM token
  static Future<String?> getFcmToken() async {
    return await _storage.read(key: _keyFcmToken);
  }
  
  // Clear All Data
  
  /// Clear all stored data (logout)
  static Future<void> clearAll() async {
    await _storage.deleteAll();
  }
  
  /// Clear only auth-related data
  static Future<void> clearAuthData() async {
    await deleteAuthToken();
    await deleteRefreshToken();
    await _storage.delete(key: _keyUserId);
    await _storage.delete(key: _keyUserEmail);
  }
  
  // Utility Methods
  
  /// Check if user is logged in
  static Future<bool> isLoggedIn() async {
    final token = await getAuthToken();
    return token != null && token.isNotEmpty;
  }
  
  /// Save complete auth session
  static Future<void> saveAuthSession({
    required String accessToken,
    required String refreshToken,
    required String userId,
    required String email,
  }) async {
    await Future.wait([
      saveAuthToken(accessToken),
      saveRefreshToken(refreshToken),
      saveUserId(userId),
      saveUserEmail(email),
    ]);
  }
}
