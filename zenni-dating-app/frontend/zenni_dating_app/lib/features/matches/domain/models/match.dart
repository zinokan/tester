import 'package:equatable/equatable.dart';
import '../../auth/domain/models/user.dart';

class Match extends Equatable {
  final int? id;
  final User user1;
  final User user2;
  final bool isActive;
  final DateTime? lastMessageAt;
  final DateTime createdAt;
  final DateTime updatedAt;

  const Match({
    this.id,
    required this.user1,
    required this.user2,
    required this.isActive,
    this.lastMessageAt,
    required this.createdAt,
    required this.updatedAt,
  });

  User getOtherUser(User currentUser) {
    if (user1.id == currentUser.id) {
      return user2;
    } else if (user2.id == currentUser.id) {
      return user1;
    }
    throw Exception('User is not part of this match');
  }

  @override
  List<Object?> get props => [
    id,
    user1,
    user2,
    isActive,
    lastMessageAt,
    createdAt,
    updatedAt,
  ];
}

class Swipe extends Equatable {
  final int? id;
  final int swiperId;
  final int swipedId;
  final SwipeType type;
  final DateTime createdAt;

  const Swipe({
    this.id,
    required this.swiperId,
    required this.swipedId,
    required this.type,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [id, swiperId, swipedId, type, createdAt];
}

enum SwipeType { like, pass, superLike }