import 'package:get_it/get_it.dart';
import 'package:banitalk/core/network/api_client.dart';
import 'package:banitalk/features/auth/domain/repositories/auth_repository.dart';
import 'package:banitalk/features/auth/data/repositories/auth_repository_impl.dart';
import 'package:banitalk/features/profile/presentation/bloc/profile_bloc.dart';
import 'package:banitalk/features/chat/domain/repositories/chat_repository.dart';
import 'package:banitalk/features/chat/data/repositories/chat_repository_impl.dart';
import 'package:banitalk/features/chat/presentation/bloc/chat_bloc.dart';
import 'package:banitalk/features/call/domain/repositories/call_repository.dart';
import 'package:banitalk/features/call/data/repositories/call_repository_impl.dart';
import 'package:banitalk/features/call/presentation/bloc/call_bloc.dart';
import 'package:banitalk/features/social_feed/presentation/bloc/social_feed_bloc.dart';
import 'package:banitalk/features/social_feed/domain/usecases/get_feed_usecase.dart';
import 'package:banitalk/features/social_feed/domain/usecases/like_post_usecase.dart';
import 'package:banitalk/features/social_feed/domain/usecases/create_post_usecase.dart';
import 'package:banitalk/features/social_feed/domain/usecases/get_comments_usecase.dart';
import 'package:banitalk/features/social_feed/domain/usecases/add_comment_usecase.dart';
import 'package:banitalk/features/social_feed/domain/usecases/translate_content_usecase.dart';
import 'package:banitalk/features/social_feed/domain/repositories/social_feed_repository.dart';
import 'package:banitalk/features/social_feed/data/repositories/social_feed_repository_impl.dart';

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
  sl.registerLazySingleton<ChatRepository>(
    () => ChatRepositoryImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<CallRepository>(
    () => CallRepositoryImpl(apiClient: sl()),
  );
  sl.registerLazySingleton<SocialFeedRepository>(
    () => SocialFeedRepositoryImpl(apiClient: sl()),
  );
  
  // Use Cases
  sl.registerLazySingleton(() => GetFeedUseCase(sl()));
  sl.registerLazySingleton(() => LikePostUseCase(sl()));
  sl.registerLazySingleton(() => CreatePostUseCase(sl()));
  sl.registerLazySingleton(() => GetCommentsUseCase(sl()));
  sl.registerLazySingleton(() => AddCommentUseCase(sl()));
  sl.registerLazySingleton(() => TranslateContentUseCase(sl()));
  
  // Blocs
  sl.registerFactory(() => AuthBloc(authRepository: sl()));
  sl.registerFactory(() => ProfileBloc(profileRepository: sl()));
  sl.registerFactory(() => ChatBloc(chatRepository: sl()));
  sl.registerFactory(() => CallBloc(callRepository: sl()));
  sl.registerFactory(() => SocialFeedBloc(
    getFeedUseCase: sl(),
    likePostUseCase: sl(),
    createPostUseCase: sl(),
    getCommentsUseCase: sl(),
    addCommentUseCase: sl(),
    translateContentUseCase: sl(),
  ));
}
