import 'package:banitalk/features/profile/presentation/pages/profile_screen.dart';
import 'package:banitalk/features/profile/presentation/pages/social_search_screen.dart';
import 'package:banitalk/features/profile/presentation/bloc/profile_bloc.dart';
import 'package:banitalk/shared/widgets/main_layout.dart';
import '../../di/service_locator.dart';

import 'package:banitalk/features/chat/presentation/pages/chat_list_screen.dart';
import 'package:banitalk/features/chat/presentation/pages/chat_window_page.dart';
import 'package:banitalk/features/chat/presentation/bloc/chat_bloc.dart';

class AppRouter {
  static final GlobalKey<NavigatorState> _rootNavigatorKey = GlobalKey<NavigatorState>();
  static final GlobalKey<NavigatorState> _shellNavigatorKey = GlobalKey<NavigatorState>();

  static final router = GoRouter(
    navigatorKey: _rootNavigatorKey,
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/login',
        builder: (context, state) => BlocProvider(
          create: (_) => sl<AuthBloc>(),
          child: const LoginScreen(),
        ),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => BlocProvider(
          create: (_) => sl<AuthBloc>(),
          child: const RegisterScreen(),
        ),
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      ShellRoute(
        navigatorKey: _shellNavigatorKey,
        builder: (context, state, child) => MainLayout(child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (context, state) => const Scaffold(
              body: Center(child: Text('BaniTalk - Home Hub')),
            ),
          ),
          GoRoute(
            path: '/search',
            builder: (context, state) => BlocProvider(
              create: (_) => sl<ProfileBloc>(),
              child: const SocialSearchScreen(),
            ),
          ),
          GoRoute(
            path: '/chat',
            builder: (context, state) => BlocProvider(
              create: (_) => sl<ChatBloc>(),
              child: const ChatListScreen(),
            ),
          ),
          GoRoute(
            path: '/profile/:id',
            builder: (context, state) {
              final id = int.parse(state.pathParameters['id']!);
              return BlocProvider(
                create: (_) => sl<ProfileBloc>(),
                child: ProfileScreen(userId: id),
              );
            },
          ),
        ],
      ),
      GoRoute(
        path: '/chat/:id',
        parentNavigatorKey: _rootNavigatorKey,
        builder: (context, state) {
          final id = state.pathParameters['id']!;
          final title = state.uri.queryParameters['title'] ?? 'Chat';
          return BlocProvider(
            create: (_) => sl<ChatBloc>(),
            child: ChatWindowPage(conversationId: id, title: title),
          );
        },
      ),
    ],
  );
}
