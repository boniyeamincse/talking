import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/profile_repository.dart';
import 'profile_event.dart';
import 'profile_state.dart';

class ProfileBloc extends Bloc<ProfileEvent, ProfileState> {
  final ProfileRepository profileRepository;

  ProfileBloc({required this.profileRepository}) : super(ProfileInitial()) {
    on<LoadProfile>(_onLoadProfile);
    on<SearchUsers>(_onSearchUsers);
    on<FollowUserEvent>(_onFollowUser);
    on<UnfollowUserEvent>(_onUnfollowUser);
    on<BlockUserEvent>(_onBlockUser);
  }

  Future<void> _onLoadProfile(LoadProfile event, Emitter<ProfileState> emit) async {
    emit(ProfileLoading());
    try {
      final profile = await profileRepository.getProfile(event.userId);
      emit(ProfileLoaded(profile));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onSearchUsers(SearchUsers event, Emitter<ProfileState> emit) async {
    if (event.query.isEmpty) {
      emit(SearchLoaded(const []));
      return;
    }
    emit(SearchLoading());
    try {
      final results = await profileRepository.searchUsers(event.query);
      emit(SearchLoaded(results));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onFollowUser(FollowUserEvent event, Emitter<ProfileState> emit) async {
    try {
      await profileRepository.followUser(event.userId);
      // Ideally we should reload the profile or update the state
      emit(ActionSuccess('Followed successfully'));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onUnfollowUser(UnfollowUserEvent event, Emitter<ProfileState> emit) async {
    try {
      await profileRepository.unfollowUser(event.userId);
      emit(ActionSuccess('Unfollowed successfully'));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }

  Future<void> _onBlockUser(BlockUserEvent event, Emitter<ProfileState> emit) async {
    try {
      await profileRepository.blockUser(event.userId);
      emit(ActionSuccess('User blocked'));
    } catch (e) {
      emit(ProfileError(e.toString()));
    }
  }
}
