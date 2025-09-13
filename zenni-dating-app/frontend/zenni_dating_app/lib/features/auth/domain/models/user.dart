import 'package:equatable/equatable.dart';

enum Gender { male, female, nonBinary, other }
enum SubscriptionTier { free, plus, gold, platinum }

class User extends Equatable {
  final int? id;
  final String firebaseUid;
  final String email;
  final String firstName;
  final String lastName;
  final DateTime dateOfBirth;
  final Gender gender;
  final Gender lookingForGender;
  final int minAge;
  final int maxAge;
  final int maxDistance;
  final String? bio;
  final String? job;
  final String? education;
  final String? location;
  final double? latitude;
  final double? longitude;
  final SubscriptionTier subscriptionTier;
  final bool isVerified;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;
  final List<Photo> photos;
  final List<Interest> interests;

  const User({
    this.id,
    required this.firebaseUid,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.dateOfBirth,
    required this.gender,
    required this.lookingForGender,
    required this.minAge,
    required this.maxAge,
    required this.maxDistance,
    this.bio,
    this.job,
    this.education,
    this.location,
    this.latitude,
    this.longitude,
    required this.subscriptionTier,
    required this.isVerified,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
    required this.photos,
    required this.interests,
  });

  int get age {
    final now = DateTime.now();
    int age = now.year - dateOfBirth.year;
    if (now.month < dateOfBirth.month || 
        (now.month == dateOfBirth.month && now.day < dateOfBirth.day)) {
      age--;
    }
    return age;
  }

  String get fullName => '$firstName $lastName';

  @override
  List<Object?> get props => [
    id,
    firebaseUid,
    email,
    firstName,
    lastName,
    dateOfBirth,
    gender,
    lookingForGender,
    minAge,
    maxAge,
    maxDistance,
    bio,
    job,
    education,
    location,
    latitude,
    longitude,
    subscriptionTier,
    isVerified,
    isActive,
    createdAt,
    updatedAt,
    photos,
    interests,
  ];

  User copyWith({
    int? id,
    String? firebaseUid,
    String? email,
    String? firstName,
    String? lastName,
    DateTime? dateOfBirth,
    Gender? gender,
    Gender? lookingForGender,
    int? minAge,
    int? maxAge,
    int? maxDistance,
    String? bio,
    String? job,
    String? education,
    String? location,
    double? latitude,
    double? longitude,
    SubscriptionTier? subscriptionTier,
    bool? isVerified,
    bool? isActive,
    DateTime? createdAt,
    DateTime? updatedAt,
    List<Photo>? photos,
    List<Interest>? interests,
  }) {
    return User(
      id: id ?? this.id,
      firebaseUid: firebaseUid ?? this.firebaseUid,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      dateOfBirth: dateOfBirth ?? this.dateOfBirth,
      gender: gender ?? this.gender,
      lookingForGender: lookingForGender ?? this.lookingForGender,
      minAge: minAge ?? this.minAge,
      maxAge: maxAge ?? this.maxAge,
      maxDistance: maxDistance ?? this.maxDistance,
      bio: bio ?? this.bio,
      job: job ?? this.job,
      education: education ?? this.education,
      location: location ?? this.location,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      subscriptionTier: subscriptionTier ?? this.subscriptionTier,
      isVerified: isVerified ?? this.isVerified,
      isActive: isActive ?? this.isActive,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
      photos: photos ?? this.photos,
      interests: interests ?? this.interests,
    );
  }
}

class Photo extends Equatable {
  final int? id;
  final String url;
  final String? caption;
  final int orderIndex;
  final bool isVerified;
  final bool isMain;
  final DateTime createdAt;

  const Photo({
    this.id,
    required this.url,
    this.caption,
    required this.orderIndex,
    required this.isVerified,
    required this.isMain,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    url,
    caption,
    orderIndex,
    isVerified,
    isMain,
    createdAt,
  ];
}

class Interest extends Equatable {
  final int? id;
  final String name;
  final InterestType type;
  final DateTime createdAt;

  const Interest({
    this.id,
    required this.name,
    required this.type,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, name, type, createdAt];
}

enum InterestType {
  hobby,
  sport,
  music,
  movie,
  book,
  food,
  travel,
  art,
  technology,
  fitness,
  other,
}