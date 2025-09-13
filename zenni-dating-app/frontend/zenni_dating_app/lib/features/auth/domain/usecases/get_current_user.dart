import '../models/user.dart';
import '../repositories/auth_repository.dart';

class GetCurrentUser {
  final AuthRepository repository;

  GetCurrentUser(this.repository);

  Future<User?> call() async {
    // TODO: Implement get current user
    throw UnimplementedError();
  }
}