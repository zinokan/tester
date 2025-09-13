import '../repositories/auth_repository.dart';

class LogoutUser {
  final AuthRepository repository;

  LogoutUser(this.repository);

  Future<void> call() async {
    // TODO: Implement user logout
    throw UnimplementedError();
  }
}