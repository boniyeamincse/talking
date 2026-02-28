import 'package:equatable/equatable.dart';

abstract class ProfileEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadProfile extends ProfileEvent {
  final int userId;
  LoadProfile(this.userId);
  @override
  List<Object?> get props => [userId];
}

class SearchUsers extends ProfileEvent {
  final String query;
  SearchUsers(this.query);
  @override
  List<Object?> get props => [query];
}

class FollowUserEvent extends ProfileEvent {
  final int userId;
  FollowUserEvent(this.userId);
  @override
  List<Object?> get props => [userId];
}

class UnfollowUserEvent extends ProfileEvent {
  final int userId;
  UnfollowUserEvent(this.userId);
  @override
  List<Object?> get props => [userId];
}

class BlockUserEvent extends ProfileEvent {
  final int userId;
  BlockUserEvent(this.userId);
  @override
  List<Object?> get props => [userId];
}
