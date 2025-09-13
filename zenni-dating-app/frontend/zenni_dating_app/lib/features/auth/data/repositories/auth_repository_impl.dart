import '../../domain/repositories/auth_repository.dart';
import '../datasources/auth_remote_datasource.dart';

class AuthRepositoryImpl implements AuthRepository {
  final AuthRemoteDataSource remoteDataSource;

  AuthRepositoryImpl({required this.remoteDataSource});

  @override
  Future<dynamic> registerUser(RegisterUserParams params) async {
    // TODO: Implement user registration
    throw UnimplementedError();
  }

  @override
  Future<dynamic> loginUser(LoginUserParams params) async {
    // TODO: Implement user login
    throw UnimplementedError();
  }

  @override
  Future<void> logoutUser() async {
    // TODO: Implement user logout
    throw UnimplementedError();
  }

  @override
  Future<dynamic> getCurrentUser() async {
    // TODO: Implement get current user
    throw UnimplementedError();
  }
}