import 'package:flutter/material.dart';
import 'package:banitalk/core/theme/app_theme.dart';
import 'package:banitalk/core/routing/app_router.dart';
import 'package:banitalk/core/di/service_locator.dart' as di;

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await di.init();
  runApp(const BaniTalkApp());
}

class BaniTalkApp extends StatelessWidget {
  const BaniTalkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'BaniTalk',
      debugShowCheckedModeBanner: false,
      theme: BaniTalkTheme.darkTheme,
      routerConfig: AppRouter.router,
    );
  }
}
