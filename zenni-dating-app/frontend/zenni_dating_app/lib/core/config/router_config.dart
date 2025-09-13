import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../../features/auth/presentation/screens/login_screen.dart';
import '../../features/auth/presentation/screens/register_screen.dart';
import '../../features/auth/presentation/screens/onboarding_screen.dart';
import '../../features/discovery/presentation/screens/discovery_screen.dart';
import '../../features/matches/presentation/screens/matches_screen.dart';
import '../../features/messages/presentation/screens/chat_screen.dart';
import '../../features/profile/presentation/screens/profile_screen.dart';
import '../../features/profile/presentation/screens/edit_profile_screen.dart';
import '../../features/premium/presentation/screens/premium_screen.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/onboarding',
    redirect: (context, state) {
      final authState = context.read<AuthBloc>().state;
      
      // If user is not authenticated and trying to access protected routes
      if (authState is! Authenticated && 
          !state.location.startsWith('/onboarding') &&
          !state.location.startsWith('/login') &&
          !state.location.startsWith('/register')) {
        return '/onboarding';
      }
      
      // If user is authenticated and trying to access auth routes
      if (authState is Authenticated && 
          (state.location.startsWith('/onboarding') ||
           state.location.startsWith('/login') ||
           state.location.startsWith('/register'))) {
        return '/discovery';
      }
      
      return null;
    },
    routes: [
      // Onboarding
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      
      // Authentication
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/register',
        builder: (context, state) => const RegisterScreen(),
      ),
      
      // Main App
      ShellRoute(
        builder: (context, state, child) => MainShell(child: child),
        routes: [
          GoRoute(
            path: '/discovery',
            builder: (context, state) => const DiscoveryScreen(),
          ),
          GoRoute(
            path: '/matches',
            builder: (context, state) => const MatchesScreen(),
          ),
          GoRoute(
            path: '/messages',
            builder: (context, state) => const MatchesScreen(), // Shows matches for messaging
          ),
          GoRoute(
            path: '/profile',
            builder: (context, state) => const ProfileScreen(),
          ),
        ],
      ),
      
      // Chat
      GoRoute(
        path: '/chat/:matchId',
        builder: (context, state) {
          final matchId = state.pathParameters['matchId']!;
          return ChatScreen(matchId: matchId);
        },
      ),
      
      // Profile Management
      GoRoute(
        path: '/edit-profile',
        builder: (context, state) => const EditProfileScreen(),
      ),
      
      // Premium
      GoRoute(
        path: '/premium',
        builder: (context, state) => const PremiumScreen(),
      ),
    ],
  );
}

class MainShell extends StatelessWidget {
  final Widget child;
  
  const MainShell({super.key, required this.child});
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: child,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed,
        currentIndex: _getCurrentIndex(context),
        onTap: (index) => _onTap(context, index),
        items: const [
          BottomNavigationBarItem(
            icon: Icon(Icons.explore),
            label: 'Discover',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.favorite),
            label: 'Matches',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.chat),
            label: 'Messages',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
  
  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).location;
    if (location.startsWith('/discovery')) return 0;
    if (location.startsWith('/matches')) return 1;
    if (location.startsWith('/messages')) return 2;
    if (location.startsWith('/profile')) return 3;
    return 0;
  }
  
  void _onTap(BuildContext context, int index) {
    switch (index) {
      case 0:
        context.go('/discovery');
        break;
      case 1:
        context.go('/matches');
        break;
      case 2:
        context.go('/messages');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }
}