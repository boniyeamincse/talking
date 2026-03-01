import 'package:flutter/foundation.dart';

/// Environment configuration for different build flavors
/// Addresses CRITICAL issue from audit: Hardcoded API URLs
enum Environment { dev, staging, prod }

class EnvConfig {
  static Environment _environment = Environment.dev;
  
  /// Set the current environment
  static void setEnvironment(Environment env) {
    _environment = env;
  }
  
  /// Get API base URL based on environment
  static String get apiBaseUrl {
    switch (_environment) {
      case Environment.dev:
        return const String.fromEnvironment(
          'API_URL',
          defaultValue: 'http://10.0.2.2:8000/api/v1', // Android emulator
        );
      case Environment.staging:
        return const String.fromEnvironment(
          'API_URL',
          defaultValue: 'https://staging-api.banitalk.com/api/v1',
        );
      case Environment.prod:
        return const String.fromEnvironment(
          'API_URL',
          defaultValue: 'https://api.banitalk.com/api/v1',
        );
    }
  }
  
  /// Get WebSocket URL based on environment
  static String get wsUrl {
    switch (_environment) {
      case Environment.dev:
        return const String.fromEnvironment(
          'WS_URL',
          defaultValue: 'ws://10.0.2.2:6001',
        );
      case Environment.staging:
        return 'wss://staging-api.banitalk.com';
      case Environment.prod:
        return 'wss://api.banitalk.com';
    }
  }
  
  /// Check if running in production
  static bool get isProduction => _environment == Environment.prod;
  
  /// Check if running in development
  static bool get isDevelopment => _environment == Environment.dev;
  
  /// Check if running in staging
  static bool get isStaging => _environment == Environment.staging;
  
  /// Get app name based on environment
  static String get appName {
    switch (_environment) {
      case Environment.dev:
        return 'BaniTalk Dev';
      case Environment.staging:
        return 'BaniTalk Staging';
      case Environment.prod:
        return 'BaniTalk';
    }
  }
  
  /// Get environment name
  static String get environmentName {
    return _environment.toString().split('.').last;
  }
  
  /// Enable debug logging
  static bool get enableLogging => !isProduction;
  
  /// Enable crash reporting
  static bool get enableCrashReporting => isProduction || isStaging;
  
  /// API timeout duration
  static Duration get apiTimeout {
    return isProduction 
        ? const Duration(seconds: 30)
        : const Duration(seconds: 60);
  }
}
