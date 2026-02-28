import 'package:equatable/equatable.dart';
import '../../data/models/user_profile_model.dart';

abstract class ProfileState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ProfileInitial extends ProfileState {}

class ProfileLoading extends ProfileState {}

class ProfileLoaded extends ProfileState {
  final UserProfile profile;
  ProfileLoaded(this.profile);
  @override
  List<Object?> get props => [profile];
}

class SearchLoading extends ProfileState {}

class SearchLoaded extends ProfileState {
  final List<UserProfile> results;
  SearchLoaded(this.results);
  @override
  List<Object?> get props => [results];
}

class ProfileError extends ProfileState {
  final String message;
  ProfileError(this.message);
  @override
  List<Object?> get props => [message];
}

class ActionSuccess extends ProfileState {
  final String message;
  ActionSuccess(this.message);
  @override
  List<Object?> get props => [message];
}
