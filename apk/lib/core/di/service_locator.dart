import 'package:get_it/get_it.dart';
import 'package:banitalk/core/network/api_client.dart';
import 'package:banitalk/features/auth/domain/repositories/auth_repository.dart';
import 'package:banitalk/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:banitalk/features/auth/presentation/bloc/auth_bloc.dart';
import 'package:banitalk/features/profile/domain/repositories/profile_repository.dart';
import 'package:banitalk/features/profile/data/repositories/profile_repository_impl.dart';
import 'package:banitalk/features/profile/presentation/bloc/profile_bloc.dart';

final sl = GetIt.instance;

Future<void> init() async {
  // Core
  sl.registerLazySingleton(() => ApiClient());
  
  // Repositories
  sl.registerLazySingleton<AuthRepository>(
    () => AuthRepositoryImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<ProfileRepository>(
    () => ProfileRepositoryImpl(apiClient: sl()),
  );
  
  // Blocs
  sl.registerFactory(() => AuthBloc(authRepository: sl()));
  sl.registerFactory(() => ProfileBloc(profileRepository: sl()));
}
