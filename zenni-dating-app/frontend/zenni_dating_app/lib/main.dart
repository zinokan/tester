import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:go_router/go_router.dart';

import 'core/config/app_config.dart';
import 'core/config/firebase_config.dart';
import 'core/config/router_config.dart';
import 'core/config/theme_config.dart';
import 'core/di/injection_container.dart';
import 'features/auth/presentation/bloc/auth_bloc.dart';
import 'features/discovery/presentation/bloc/discovery_bloc.dart';
import 'features/matches/presentation/bloc/matches_bloc.dart';
import 'features/messages/presentation/bloc/messages_bloc.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Initialize Firebase
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  
  // Initialize Hive
  await Hive.initFlutter();
  
  // Initialize dependency injection
  await initializeDependencies();
  
  runApp(const ZenniApp());
}

class ZenniApp extends StatelessWidget {
  const ZenniApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiBlocProvider(
      providers: [
        BlocProvider(create: (context) => getIt<AuthBloc>()),
        BlocProvider(create: (context) => getIt<DiscoveryBloc>()),
        BlocProvider(create: (context) => getIt<MatchesBloc>()),
        BlocProvider(create: (context) => getIt<MessagesBloc>()),
      ],
      child: MaterialApp.router(
        title: AppConfig.appName,
        debugShowCheckedModeBanner: false,
        theme: ThemeConfig.lightTheme,
        darkTheme: ThemeConfig.darkTheme,
        themeMode: ThemeMode.system,
        routerConfig: AppRouter.router,
      ),
    );
  }
}