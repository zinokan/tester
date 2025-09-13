import '../models/user.dart';

abstract class AuthRepository {
  Future<User> registerUser(RegisterUserParams params);
  Future<User> loginUser(LoginUserParams params);
  Future<void> logoutUser();
  Future<User?> getCurrentUser();
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

class LoginUserParams {
  final String email;
  final String password;

  LoginUserParams({
    required this.email,
    required this.password,
  });
}