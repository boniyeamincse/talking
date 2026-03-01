import 'package:local_auth/local_auth.dart';
import 'package:flutter/services.dart';
import 'package:banitalk/core/storage/secure_storage.dart';

/// Biometric authentication service
/// Addresses MEDIUM issue from audit: No biometric authentication
class BiometricAuth {
  static final LocalAuthentication _auth = LocalAuthentication();
  
  /// Check if biometric authentication is available
  static Future<bool> isAvailable() async {
    try {
      return await _auth.canCheckBiometrics;
    } catch (e) {
      return false;
    }
  }
  
  /// Get available biometric types
  static Future<List<BiometricType>> getAvailableBiometrics() async {
    try {
      return await _auth.getAvailableBiometrics();
    } catch (e) {
      return [];
    }
  }
  
  /// Check if device supports biometrics
  static Future<bool> isDeviceSupported() async {
    try {
      return await _auth.isDeviceSupported();
    } catch (e) {
      return false;
    }
  }
  
  /// Authenticate with biometrics
  static Future<bool> authenticate({
    String reason = 'Please authenticate to continue',
    bool useErrorDialogs = true,
    bool stickyAuth = true,
  }) async {
    try {
      // Check if biometric is enabled in settings
      final isEnabled = await SecureStorage.isBiometricEnabled();
      if (!isEnabled) {
        return false;
      }
      
      // Check if biometric is available
      final canAuthenticate = await isAvailable();
      if (!canAuthenticate) {
        return false;
      }
      
      // Authenticate
      return await _auth.authenticate(
        localizedReason: reason,
        options: AuthenticationOptions(
          useErrorDialogs: useErrorDialogs,
          stickyAuth: stickyAuth,
          biometricOnly: true,
        ),
      );
    } on PlatformException catch (e) {
      print('Biometric authentication error: ${e.message}');
      return false;
    } catch (e) {
      print('Biometric authentication error: $e');
      return false;
    }
  }
  
  /// Authenticate for login
  static Future<bool> authenticateForLogin() async {
    return await authenticate(
      reason: 'Authenticate to login to BaniTalk',
      useErrorDialogs: true,
      stickyAuth: true,
    );
  }
  
  /// Authenticate for sensitive action
  static Future<bool> authenticateForSensitiveAction(String action) async {
    return await authenticate(
      reason: 'Authenticate to $action',
      useErrorDialogs: true,
      stickyAuth: false,
    );
  }
  
  /// Enable biometric authentication
  static Future<bool> enableBiometric() async {
    try {
      // Check if available
      final available = await isAvailable();
      if (!available) {
        return false;
      }
      
      // Test authentication
      final authenticated = await authenticate(
        reason: 'Authenticate to enable biometric login',
      );
      
      if (authenticated) {
        await SecureStorage.setBiometricEnabled(true);
        return true;
      }
      
      return false;
    } catch (e) {
      return false;
    }
  }
  
  /// Disable biometric authentication
  static Future<void> disableBiometric() async {
    await SecureStorage.setBiometricEnabled(false);
  }
  
  /// Get biometric type name
  static String getBiometricTypeName(BiometricType type) {
    switch (type) {
      case BiometricType.face:
        return 'Face ID';
      case BiometricType.fingerprint:
        return 'Fingerprint';
      case BiometricType.iris:
        return 'Iris';
      case BiometricType.strong:
        return 'Strong Biometric';
      case BiometricType.weak:
        return 'Weak Biometric';
    }
  }
  
  /// Get available biometric names
  static Future<List<String>> getAvailableBiometricNames() async {
    final biometrics = await getAvailableBiometrics();
    return biometrics.map((b) => getBiometricTypeName(b)).toList();
  }
}
