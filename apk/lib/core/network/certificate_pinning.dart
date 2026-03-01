import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:banitalk/core/config/env_config.dart';

/// Certificate pinning for secure API communication
/// Addresses MEDIUM issue from audit: No certificate pinning
class CertificatePinning {
  /// List of allowed certificate fingerprints (SHA-256)
  /// Replace with actual production certificate fingerprints
  static const List<String> _allowedFingerprints = [
    // Production certificate SHA-256 fingerprint
    'YOUR_PRODUCTION_CERT_SHA256_FINGERPRINT_HERE',
    // Staging certificate SHA-256 fingerprint
    'YOUR_STAGING_CERT_SHA256_FINGERPRINT_HERE',
  ];
  
  /// Setup certificate pinning for Dio client
  static void setupCertificatePinning(Dio dio) {
    (dio.httpClientAdapter as IOHttpClientAdapter).createHttpClient = () {
      final client = HttpClient();
      
      // Configure certificate validation
      client.badCertificateCallback = (
        X509Certificate cert,
        String host,
        int port,
      ) {
        // In development, allow all certificates
        if (EnvConfig.isDevelopment) {
          return true;
        }
        
        // In production/staging, verify certificate fingerprint
        return _verifyCertificate(cert, host);
      };
      
      // Set connection timeout
      client.connectionTimeout = EnvConfig.apiTimeout;
      
      return client;
    };
  }
  
  /// Verify certificate against allowed fingerprints
  static bool _verifyCertificate(X509Certificate cert, String host) {
    try {
      // Get certificate SHA-256 fingerprint
      final certFingerprint = _getCertificateFingerprint(cert);
      
      // Check if fingerprint is in allowed list
      final isAllowed = _allowedFingerprints.contains(certFingerprint);
      
      if (!isAllowed && EnvConfig.enableLogging) {
        print('Certificate pinning failed for host: $host');
        print('Certificate fingerprint: $certFingerprint');
        print('Allowed fingerprints: $_allowedFingerprints');
      }
      
      return isAllowed;
    } catch (e) {
      if (EnvConfig.enableLogging) {
        print('Error verifying certificate: $e');
      }
      return false;
    }
  }
  
  /// Get SHA-256 fingerprint of certificate
  static String _getCertificateFingerprint(X509Certificate cert) {
    // Convert certificate SHA-256 to hex string
    final sha256 = cert.sha256;
    return sha256.map((byte) => byte.toRadixString(16).padLeft(2, '0')).join(':').toUpperCase();
  }
  
  /// Validate SSL/TLS configuration
  static bool validateSslConfig() {
    if (EnvConfig.isProduction && _allowedFingerprints.isEmpty) {
      throw Exception(
        'Certificate pinning is not configured for production environment. '
        'Please add production certificate fingerprints.',
      );
    }
    return true;
  }
  
  /// Get certificate information for debugging
  static Map<String, dynamic> getCertificateInfo(X509Certificate cert) {
    return {
      'subject': cert.subject,
      'issuer': cert.issuer,
      'startValidity': cert.startValidity.toIso8601String(),
      'endValidity': cert.endValidity.toIso8601String(),
      'sha256': _getCertificateFingerprint(cert),
    };
  }
}

/// Extension to add certificate pinning to Dio
extension CertificatePinningExtension on Dio {
  /// Enable certificate pinning
  void enableCertificatePinning() {
    CertificatePinning.setupCertificatePinning(this);
  }
}
