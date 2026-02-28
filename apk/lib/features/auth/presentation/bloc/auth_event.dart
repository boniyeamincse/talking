import 'package:equatable/equatable.dart';

abstract class AuthEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoginEvent extends AuthEvent {
  final String email;
  final String password;

  LoginEvent({required this.email, required this.password});

  @override
  List<Object?> get props => [email, password];
}

class RegisterEvent extends AuthEvent {
  final String name;
  final String username;
  final String email;
  final String password;

  RegisterEvent({
    required this.name,
    required this.username,
    required this.email,
    required this.password,
  });

  @override
  List<Object?> get props => [name, username, email, password];
}

class LogoutEvent extends AuthEvent {}
