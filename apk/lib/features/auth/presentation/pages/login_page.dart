import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:banitalk/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:banitalk/core/security/biometric_auth.dart';
import 'package:banitalk/core/security/root_detection.dart';
import 'package:banitalk/core/storage/secure_storage.dart';

/// Enhanced login page with biometric authentication
class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  bool _biometricAvailable = false;
  bool _biometricEnabled = false;
  bool _isDeviceSecure = true;

  @override
  void initState() {
    super.initState();
    _checkBiometric();
    _checkDeviceSecurity();
  }

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _checkBiometric() async {
    final available = await BiometricAuth.isAvailable();
    final enabled = await SecureStorage.isBiometricEnabled();
    
    setState(() {
      _biometricAvailable = available;
      _biometricEnabled = enabled;
    });

    // Auto-trigger biometric if enabled
    if (available && enabled) {
      _loginWithBiometric();
    }
  }

  Future<void> _checkDeviceSecurity() async {
    final status = await RootDetection.getSecurityStatus();
    
    setState(() {
      _isDeviceSecure = status.isSecure;
    });

    if (!status.isSecure) {
      _showSecurityWarning(status);
    }
  }

  void _showSecurityWarning(DeviceSecurityStatus status) {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        title: const Row(
          children: [
            Icon(Icons.warning, color: Colors.orange),
            SizedBox(width: 8),
            Text('Security Warning'),
          ],
        ),
        content: Text(status.statusMessage),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('I Understand'),
          ),
        ],
      ),
    );
  }

  Future<void> _loginWithBiometric() async {
    final authenticated = await BiometricAuth.authenticateForLogin();
    
    if (authenticated) {
      // Get saved credentials
      final email = await SecureStorage.getUserEmail();
      
      if (email != null && mounted) {
        // Trigger biometric login
        context.read<AuthBloc>().add(BiometricLoginRequested(email: email));
      }
    }
  }

  void _login() {
    if (_formKey.currentState!.validate()) {
      context.read<AuthBloc>().add(
            LoginRequested(
              email: _emailController.text.trim(),
              password: _passwordController.text,
            ),
          );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: BlocConsumer<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text(state.message),
                backgroundColor: Colors.red,
              ),
            );
          } else if (state is Authenticated) {
            Navigator.pushReplacementNamed(context, '/home');
          }
        },
        builder: (context, state) {
          final isLoading = state is AuthLoading;

          return SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(24),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    const SizedBox(height: 40),

                    // Logo
                    Center(
                      child: Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: Theme.of(context).primaryColor,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.chat_bubble,
                          size: 50,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Title
                    Text(
                      'Welcome Back',
                      style: Theme.of(context).textTheme.headlineMedium?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Login to continue learning languages',
                      style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                            color: Colors.grey[600],
                          ),
                      textAlign: TextAlign.center,
                    ),
                    const SizedBox(height: 40),

                    // Email Field
                    TextFormField(
                      controller: _emailController,
                      keyboardType: TextInputType.emailAddress,
                      decoration: InputDecoration(
                        labelText: 'Email',
                        prefixIcon: const Icon(Icons.email_outlined),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your email';
                        }
                        if (!value.contains('@')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),

                    // Password Field
                    TextFormField(
                      controller: _passwordController,
                      obscureText: _obscurePassword,
                      decoration: InputDecoration(
                        labelText: 'Password',
                        prefixIcon: const Icon(Icons.lock_outlined),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _obscurePassword
                                ? Icons.visibility_outlined
                                : Icons.visibility_off_outlined,
                          ),
                          onPressed: () {
                            setState(() {
                              _obscurePassword = !_obscurePassword;
                            });
                          },
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      validator: (value) {
                        if (value == null || value.isEmpty) {
                          return 'Please enter your password';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 8),

                    // Forgot Password
                    Align(
                      alignment: Alignment.centerRight,
                      child: TextButton(
                        onPressed: () {
                          Navigator.pushNamed(context, '/forgot-password');
                        },
                        child: const Text('Forgot Password?'),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Login Button
                    ElevatedButton(
                      onPressed: isLoading ? null : _login,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                      child: isLoading
                          ? const SizedBox(
                              height: 20,
                              width: 20,
                              child: CircularProgressIndicator(
                                strokeWidth: 2,
                                valueColor:
                                    AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            )
                          : const Text(
                              'Login',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                    ),
                    const SizedBox(height: 16),

                    // Biometric Login Button
                    if (_biometricAvailable && _biometricEnabled)
                      OutlinedButton.icon(
                        onPressed: isLoading ? null : _loginWithBiometric,
                        icon: const Icon(Icons.fingerprint),
                        label: const Text('Login with Biometric'),
                        style: OutlinedButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                      ),
                    const SizedBox(height: 24),

                    // Divider
                    Row(
                      children: [
                        Expanded(child: Divider(color: Colors.grey[300])),
                        Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          child: Text(
                            'OR',
                            style: TextStyle(color: Colors.grey[600]),
                          ),
                        ),
                        Expanded(child: Divider(color: Colors.grey[300])),
                      ],
                    ),
                    const SizedBox(height: 24),

                    // Social Login Buttons
                    OutlinedButton.icon(
                      onPressed: () {
                        // TODO: Implement Google login
                      },
                      icon: Image.asset(
                        'assets/icons/google.png',
                        width: 24,
                        height: 24,
                      ),
                      label: const Text('Continue with Google'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 12),
                    OutlinedButton.icon(
                      onPressed: () {
                        // TODO: Implement Apple login
                      },
                      icon: const Icon(Icons.apple, size: 24),
                      label: const Text('Continue with Apple'),
                      style: OutlinedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    ),
                    const SizedBox(height: 32),

                    // Sign Up Link
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          "Don't have an account? ",
                          style: TextStyle(color: Colors.grey[600]),
                        ),
                        TextButton(
                          onPressed: () {
                            Navigator.pushNamed(context, '/register');
                          },
                          child: const Text(
                            'Sign Up',
                            style: TextStyle(fontWeight: FontWeight.bold),
                          ),
                        ),
                      ],
                    ),

                    // Security Status
                    if (!_isDeviceSecure)
                      Container(
                        margin: const EdgeInsets.only(top: 16),
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.orange.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(
                            color: Colors.orange.withOpacity(0.3),
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning, color: Colors.orange),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                'Device security compromised',
                                style: TextStyle(
                                  color: Colors.orange[700],
                                  fontSize: 12,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}
