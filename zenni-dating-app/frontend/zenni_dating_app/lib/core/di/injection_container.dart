import 'package:get_it/get_it.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

import '../../features/auth/data/datasources/auth_remote_datasource.dart';
import '../../features/auth/data/repositories/auth_repository_impl.dart';
import '../../features/auth/domain/repositories/auth_repository.dart';
import '../../features/auth/domain/usecases/register_user.dart';
import '../../features/auth/domain/usecases/login_user.dart';
import '../../features/auth/domain/usecases/logout_user.dart';
import '../../features/auth/domain/usecases/get_current_user.dart';
import '../../features/auth/presentation/bloc/auth_bloc.dart';

import '../../features/discovery/data/datasources/discovery_remote_datasource.dart';
import '../../features/discovery/data/repositories/discovery_repository_impl.dart';
import '../../features/discovery/domain/repositories/discovery_repository.dart';
import '../../features/discovery/domain/usecases/get_potential_matches.dart';
import '../../features/discovery/presentation/bloc/discovery_bloc.dart';

import '../../features/matches/data/datasources/matches_remote_datasource.dart';
import '../../features/matches/data/repositories/matches_repository_impl.dart';
import '../../features/matches/domain/repositories/matches_repository.dart';
import '../../features/matches/domain/usecases/get_matches.dart';
import '../../features/matches/domain/usecases/process_swipe.dart';
import '../../features/matches/presentation/bloc/matches_bloc.dart';

import '../../features/messages/data/datasources/messages_remote_datasource.dart';
import '../../features/messages/data/repositories/messages_repository_impl.dart';
import '../../features/messages/domain/repositories/messages_repository.dart';
import '../../features/messages/domain/usecases/send_message.dart';
import '../../features/messages/domain/usecases/get_messages.dart';
import '../../features/messages/presentation/bloc/messages_bloc.dart';

final getIt = GetIt.instance;

Future<void> initializeDependencies() async {
  // External dependencies
  final sharedPreferences = await SharedPreferences.getInstance();
  getIt.registerLazySingleton(() => sharedPreferences);
  
  getIt.registerLazySingleton(() => FirebaseAuth.instance);
  getIt.registerLazySingleton(() => FirebaseFirestore.instance);
  
  getIt.registerLazySingleton(() => Dio(BaseOptions(
    baseUrl: 'http://localhost:8080/api',
    connectTimeout: const Duration(seconds: 30),
    receiveTimeout: const Duration(seconds: 30),
  )));
  
  // Data sources
  getIt.registerLazySingleton(() => AuthRemoteDataSourceImpl(
    dio: getIt(),
    firebaseAuth: getIt(),
  ));
  
  getIt.registerLazySingleton(() => DiscoveryRemoteDataSourceImpl(
    dio: getIt(),
  ));
  
  getIt.registerLazySingleton(() => MatchesRemoteDataSourceImpl(
    dio: getIt(),
  ));
  
  getIt.registerLazySingleton(() => MessagesRemoteDataSourceImpl(
    dio: getIt(),
  ));
  
  // Repositories
  getIt.registerLazySingleton<AuthRepository>(() => AuthRepositoryImpl(
    remoteDataSource: getIt(),
  ));
  
  getIt.registerLazySingleton<DiscoveryRepository>(() => DiscoveryRepositoryImpl(
    remoteDataSource: getIt(),
  ));
  
  getIt.registerLazySingleton<MatchesRepository>(() => MatchesRepositoryImpl(
    remoteDataSource: getIt(),
  ));
  
  getIt.registerLazySingleton<MessagesRepository>(() => MessagesRepositoryImpl(
    remoteDataSource: getIt(),
  ));
  
  // Use cases
  getIt.registerLazySingleton(() => RegisterUser(getIt()));
  getIt.registerLazySingleton(() => LoginUser(getIt()));
  getIt.registerLazySingleton(() => LogoutUser(getIt()));
  getIt.registerLazySingleton(() => GetCurrentUser(getIt()));
  
  getIt.registerLazySingleton(() => GetPotentialMatches(getIt()));
  
  getIt.registerLazySingleton(() => GetMatches(getIt()));
  getIt.registerLazySingleton(() => ProcessSwipe(getIt()));
  
  getIt.registerLazySingleton(() => SendMessage(getIt()));
  getIt.registerLazySingleton(() => GetMessages(getIt()));
  
  // Blocs
  getIt.registerFactory(() => AuthBloc(
    registerUser: getIt(),
    loginUser: getIt(),
    logoutUser: getIt(),
    getCurrentUser: getIt(),
  ));
  
  getIt.registerFactory(() => DiscoveryBloc(
    getPotentialMatches: getIt(),
  ));
  
  getIt.registerFactory(() => MatchesBloc(
    getMatches: getIt(),
    processSwipe: getIt(),
  ));
  
  getIt.registerFactory(() => MessagesBloc(
    sendMessage: getIt(),
    getMessages: getIt(),
  ));
}