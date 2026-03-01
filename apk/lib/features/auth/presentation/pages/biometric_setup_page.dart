import 'package:flutter/material.dart';
import 'package:banitalk/core/security/biometric_auth.dart';
import 'package:banitalk/core/storage/secure_storage.dart';

/// Biometric setup page
class BiometricSetupPage extends StatefulWidget {
  const BiometricSetupPage({super.key});

  @override
  State<BiometricSetupPage> createState() => _BiometricSetupPageState();
}

class _BiometricSetupPageState extends State<BiometricSetupPage> {
  bool _isLoading = true;
  bool _isAvailable = false;
  bool _isEnabled = false;
  List<String> _availableBiometrics = [];

  @override
  void initState() {
    super.initState();
    _checkBiometricStatus();
  }

  Future<void> _checkBiometricStatus() async {
    final available = await BiometricAuth.isAvailable();
    final enabled = await SecureStorage.isBiometricEnabled();
    final biometrics = await BiometricAuth.getAvailableBiometricNames();

    setState(() {
      _isAvailable = available;
      _isEnabled = enabled;
      _availableBiometrics = biometrics;
      _isLoading = false;
    });
  }

  Future<void> _toggleBiometric(bool value) async {
    if (value) {
      // Enable biometric
      final success = await BiometricAuth.enableBiometric();
      if (success) {
        setState(() => _isEnabled = true);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Biometric authentication enabled'),
              backgroundColor: Colors.green,
            ),
          );
        }
      } else {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Failed to enable biometric authentication'),
              backgroundColor: Colors.red,
            ),
          );
        }
      }
    } else {
      // Disable biometric
      await BiometricAuth.disableBiometric();
      setState(() => _isEnabled = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Biometric authentication disabled'),
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Biometric Authentication'),
        elevation: 0,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header
                  Center(
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor.withOpacity(0.1),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.fingerprint,
                        size: 64,
                        color: Theme.of(context).primaryColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),

                  // Title
                  Text(
                    'Secure Your Account',
                    style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Use biometric authentication for quick and secure access to your account.',
                    style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.grey[600],
                        ),
                  ),
                  const SizedBox(height: 32),

                  // Status Card
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Biometric Login',
                                style: Theme.of(context)
                                    .textTheme
                                    .titleMedium
                                    ?.copyWith(
                                      fontWeight: FontWeight.bold,
                                    ),
                              ),
                              Switch(
                                value: _isEnabled && _isAvailable,
                                onChanged: _isAvailable
                                    ? _toggleBiometric
                                    : null,
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Text(
                            _isAvailable
                                ? 'Enable biometric authentication for faster login'
                                : 'Biometric authentication is not available on this device',
                            style: Theme.of(context)
                                .textTheme
                                .bodySmall
                                ?.copyWith(
                                  color: Colors.grey[600],
                                ),
                          ),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 24),

                  // Available Biometrics
                  if (_isAvailable && _availableBiometrics.isNotEmpty) ...[
                    Text(
                      'Available Methods',
                      style:
                          Theme.of(context).textTheme.titleMedium?.copyWith(
                                fontWeight: FontWeight.bold,
                              ),
                    ),
                    const SizedBox(height: 16),
                    ..._availableBiometrics.map(
                      (biometric) => Card(
                        child: ListTile(
                          leading: Icon(
                            _getBiometricIcon(biometric),
                            color: Theme.of(context).primaryColor,
                          ),
                          title: Text(biometric),
                          trailing: const Icon(Icons.check_circle,
                              color: Colors.green),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                  // Benefits
                  Text(
                    'Benefits',
                    style: Theme.of(context).textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                  ),
                  const SizedBox(height: 16),
                  _buildBenefitItem(
                    icon: Icons.speed,
                    title: 'Quick Access',
                    description: 'Login instantly without typing your password',
                  ),
                  _buildBenefitItem(
                    icon: Icons.security,
                    title: 'Enhanced Security',
                    description:
                        'Your biometric data never leaves your device',
                  ),
                  _buildBenefitItem(
                    icon: Icons.privacy_tip,
                    title: 'Privacy Protected',
                    description:
                        'Biometric authentication is encrypted and secure',
                  ),
                  const SizedBox(height: 32),

                  // Note
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: Colors.blue.withOpacity(0.3),
                      ),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.info_outline, color: Colors.blue[700]),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'You can always use your password to login if biometric authentication fails.',
                            style: TextStyle(
                              color: Colors.blue[700],
                              fontSize: 13,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
    );
  }

  Widget _buildBenefitItem({
    required IconData icon,
    required String title,
    required String description,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: Theme.of(context).primaryColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Icon(
              icon,
              color: Theme.of(context).primaryColor,
              size: 24,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  description,
                  style: TextStyle(
                    color: Colors.grey[600],
                    fontSize: 14,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  IconData _getBiometricIcon(String biometric) {
    if (biometric.toLowerCase().contains('face')) {
      return Icons.face;
    } else if (biometric.toLowerCase().contains('fingerprint')) {
      return Icons.fingerprint;
    } else if (biometric.toLowerCase().contains('iris')) {
      return Icons.remove_red_eye;
    }
    return Icons.security;
  }
}
