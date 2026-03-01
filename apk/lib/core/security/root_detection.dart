import 'dart:io';
import 'package:flutter/services.dart';

/// Root/Jailbreak detection service
/// Addresses security concern from audit: No root/jailbreak detection
class RootDetection {
  static const MethodChannel _channel = MethodChannel('banitalk/security');
  
  /// Check if device is rooted (Android) or jailbroken (iOS)
  static Future<bool> isDeviceCompromised() async {
    if (Platform.isAndroid) {
      return await isRooted();
    } else if (Platform.isIOS) {
      return await isJailbroken();
    }
    return false;
  }
  
  /// Check if Android device is rooted
  static Future<bool> isRooted() async {
    if (!Platform.isAndroid) return false;
    
    try {
      // Check for common root indicators
      final indicators = await Future.wait([
        _checkSuBinary(),
        _checkRootApps(),
        _checkBusyBox(),
        _checkRootCloakingApps(),
        _checkTestKeys(),
      ]);
      
      return indicators.any((indicator) => indicator);
    } catch (e) {
      print('Root detection error: $e');
      return false;
    }
  }
  
  /// Check if iOS device is jailbroken
  static Future<bool> isJailbroken() async {
    if (!Platform.isIOS) return false;
    
    try {
      // Check for common jailbreak indicators
      final indicators = await Future.wait([
        _checkCydia(),
        _checkJailbreakApps(),
        _checkSuspiciousPaths(),
        _checkSystemModifications(),
      ]);
      
      return indicators.any((indicator) => indicator);
    } catch (e) {
      print('Jailbreak detection error: $e');
      return false;
    }
  }
  
  // Android Root Detection Methods
  
  /// Check for su binary
  static Future<bool> _checkSuBinary() async {
    final paths = [
      '/system/app/Superuser.apk',
      '/sbin/su',
      '/system/bin/su',
      '/system/xbin/su',
      '/data/local/xbin/su',
      '/data/local/bin/su',
      '/system/sd/xbin/su',
      '/system/bin/failsafe/su',
      '/data/local/su',
      '/su/bin/su',
    ];
    
    for (final path in paths) {
      if (await File(path).exists()) {
        return true;
      }
    }
    return false;
  }
  
  /// Check for root management apps
  static Future<bool> _checkRootApps() async {
    try {
      final result = await _channel.invokeMethod('checkRootApps');
      return result as bool;
    } catch (e) {
      return false;
    }
  }
  
  /// Check for BusyBox
  static Future<bool> _checkBusyBox() async {
    final paths = [
      '/system/xbin/busybox',
      '/system/bin/busybox',
    ];
    
    for (final path in paths) {
      if (await File(path).exists()) {
        return true;
      }
    }
    return false;
  }
  
  /// Check for root cloaking apps
  static Future<bool> _checkRootCloakingApps() async {
    try {
      final result = await _channel.invokeMethod('checkRootCloakingApps');
      return result as bool;
    } catch (e) {
      return false;
    }
  }
  
  /// Check for test keys
  static Future<bool> _checkTestKeys() async {
    try {
      final result = await _channel.invokeMethod('checkTestKeys');
      return result as bool;
    } catch (e) {
      return false;
    }
  }
  
  // iOS Jailbreak Detection Methods
  
  /// Check for Cydia
  static Future<bool> _checkCydia() async {
    final paths = [
      '/Applications/Cydia.app',
      '/Library/MobileSubstrate/MobileSubstrate.dylib',
      '/bin/bash',
      '/usr/sbin/sshd',
      '/etc/apt',
    ];
    
    for (final path in paths) {
      if (await File(path).exists()) {
        return true;
      }
    }
    return false;
  }
  
  /// Check for jailbreak apps
  static Future<bool> _checkJailbreakApps() async {
    try {
      final result = await _channel.invokeMethod('checkJailbreakApps');
      return result as bool;
    } catch (e) {
      return false;
    }
  }
  
  /// Check for suspicious paths
  static Future<bool> _checkSuspiciousPaths() async {
    final paths = [
      '/private/var/lib/apt/',
      '/private/var/lib/cydia',
      '/private/var/mobile/Library/SBSettings/Themes',
      '/Library/MobileSubstrate/DynamicLibraries/LiveClock.plist',
      '/System/Library/LaunchDaemons/com.ikey.bbot.plist',
      '/System/Library/LaunchDaemons/com.saurik.Cydia.Startup.plist',
    ];
    
    for (final path in paths) {
      if (await File(path).exists()) {
        return true;
      }
    }
    return false;
  }
  
  /// Check for system modifications
  static Future<bool> _checkSystemModifications() async {
    try {
      final result = await _channel.invokeMethod('checkSystemModifications');
      return result as bool;
    } catch (e) {
      return false;
    }
  }
  
  /// Get device security status
  static Future<DeviceSecurityStatus> getSecurityStatus() async {
    final isCompromised = await isDeviceCompromised();
    final isRootedDevice = Platform.isAndroid ? await isRooted() : false;
    final isJailbrokenDevice = Platform.isIOS ? await isJailbroken() : false;
    
    return DeviceSecurityStatus(
      isCompromised: isCompromised,
      isRooted: isRootedDevice,
      isJailbroken: isJailbrokenDevice,
      platform: Platform.operatingSystem,
    );
  }
}

/// Device security status
class DeviceSecurityStatus {
  final bool isCompromised;
  final bool isRooted;
  final bool isJailbroken;
  final String platform;
  
  DeviceSecurityStatus({
    required this.isCompromised,
    required this.isRooted,
    required this.isJailbroken,
    required this.platform,
  });
  
  bool get isSecure => !isCompromised;
  
  String get statusMessage {
    if (isRooted) {
      return 'Device is rooted. Some features may be restricted.';
    } else if (isJailbroken) {
      return 'Device is jailbroken. Some features may be restricted.';
    } else if (isCompromised) {
      return 'Device security is compromised. Please use a secure device.';
    }
    return 'Device is secure.';
  }
}
