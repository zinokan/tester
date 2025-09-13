import '../models/user.dart';
import '../repositories/auth_repository.dart';

class LoginUser {
  final AuthRepository repository;

  LoginUser(this.repository);

  Future<User> call(LoginUserParams params) async {
    // TODO: Implement user login
    throw UnimplementedError();
  }
}

class LoginUserParams {
  final String email;
  final String password;

  LoginUserParams({
    required this.email,
    required this.password,
  });
}