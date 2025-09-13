import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';

abstract class AuthRemoteDataSource {
  Future<Map<String, dynamic>> registerUser(Map<String, dynamic> userData);
  Future<Map<String, dynamic>> loginUser(String email, String password);
  Future<void> logoutUser();
  Future<Map<String, dynamic>?> getCurrentUser();
}

class AuthRemoteDataSourceImpl implements AuthRemoteDataSource {
  final Dio dio;
  final FirebaseAuth firebaseAuth;

  AuthRemoteDataSourceImpl({
    required this.dio,
    required this.firebaseAuth,
  });

  @override
  Future<Map<String, dynamic>> registerUser(Map<String, dynamic> userData) async {
    // TODO: Implement user registration
    throw UnimplementedError();
  }

  @override
  Future<Map<String, dynamic>> loginUser(String email, String password) async {
    // TODO: Implement user login
    throw UnimplementedError();
  }

  @override
  Future<void> logoutUser() async {
    // TODO: Implement user logout
    throw UnimplementedError();
  }

  @override
  Future<Map<String, dynamic>?> getCurrentUser() async {
    // TODO: Implement get current user
    throw UnimplementedError();
  }
}