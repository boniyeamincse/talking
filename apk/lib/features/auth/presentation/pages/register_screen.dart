import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';
import 'package:banitalk/core/theme/app_theme.dart';
import 'package:banitalk/shared/widgets/custom_text_field.dart';
import 'package:banitalk/shared/widgets/primary_button.dart';
import 'package:banitalk/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:banitalk/features/auth/presentation/bloc/auth_event.dart';
import 'package:banitalk/features/auth/presentation/bloc/auth_state.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _usernameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: BaniTalkTheme.textBody),
        ),
      ),
      body: BlocListener<AuthBloc, AuthState>(
        listener: (context, state) {
          if (state is AuthAuthenticated) {
            context.go('/onboarding'); // Navigate to onboarding
          } else if (state is AuthError) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(content: Text(state.message), backgroundColor: Colors.red),
            );
          }
        },
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const SizedBox(height: 20),
                const Text(
                  'Create Account',
                  style: TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.w800,
                    color: BaniTalkTheme.textBody,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Join thousands of global citizens today.',
                  style: TextStyle(
                    fontSize: 14,
                    color: BaniTalkTheme.textSecondary,
                  ),
                ),
                const SizedBox(height: 32),
                CustomTextField(
                  controller: _nameController,
                  label: 'FULL NAME',
                  hint: 'e.g. Boni Yeamin',
                  validator: (v) => v!.isNotEmpty ? null : 'Required',
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  controller: _usernameController,
                  label: 'USERNAME',
                  hint: 'e.g. boni_cse',
                  validator: (v) => v!.length >= 3 ? null : 'Too short',
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  controller: _emailController,
                  label: 'EMAIL ADDRESS',
                  hint: 'e.g. boni@example.com',
                  keyboardType: TextInputType.emailAddress,
                  validator: (v) => v!.contains('@') ? null : 'Invalid email',
                ),
                const SizedBox(height: 20),
                CustomTextField(
                  controller: _passwordController,
                  label: 'PASSWORD',
                  hint: 'Min 8 characters',
                  isPassword: true,
                  validator: (v) => v!.length >= 8 ? null : 'Too short',
                ),
                const SizedBox(height: 48),
                BlocBuilder<AuthBloc, AuthState>(
                  builder: (context, state) {
                    return PrimaryButton(
                      text: 'Create Account',
                      isLoading: state is AuthLoading,
                      onTap: () {
                        if (_formKey.currentState!.validate()) {
                          context.read<AuthBloc>().add(
                                RegisterEvent(
                                  name: _nameController.text,
                                  username: _usernameController.text,
                                  email: _emailController.text,
                                  password: _passwordController.text,
                                ),
                              );
                        }
                      },
                    );
                  },
                ),
                const SizedBox(height: 32),
                const Center(
                  child: Text(
                    'By signing up, you agree to our Terms & Privacy.',
                    style: TextStyle(color: BaniTalkTheme.textSecondary, fontSize: 11),
                  ),
                ),
                const SizedBox(height: 48),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _usernameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }
}
