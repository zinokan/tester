import '../models/user.dart';
import '../repositories/auth_repository.dart';

class RegisterUser {
  final AuthRepository repository;

  RegisterUser(this.repository);

  Future<User> call(RegisterUserParams params) async {
    // TODO: Implement user registration
    throw UnimplementedError();
  }
}

class RegisterUserParams {
  final String email;
  final String password;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final Gender gender;
  final Gender lookingForGender;

  RegisterUserParams({
    required this.email,
    required this.password,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.gender,
    required this.lookingForGender,
  });
}