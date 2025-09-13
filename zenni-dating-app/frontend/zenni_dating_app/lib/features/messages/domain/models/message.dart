import 'package:equatable/equatable.dart';
import '../../auth/domain/models/user.dart';

class Message extends Equatable {
  final int? id;
  final int matchId;
  final User sender;
  final String content;
  final MessageType type;
  final String? attachmentUrl;
  final bool isRead;
  final DateTime? readAt;
  final DateTime createdAt;

  const Message({
    this.id,
    required this.matchId,
    required this.sender,
    required this.content,
    required this.type,
    this.attachmentUrl,
    required this.isRead,
    this.readAt,
    required this.createdAt,
  });

  @override
  List<Object?> get props => [
    id,
    matchId,
    sender,
    content,
    type,
    attachmentUrl,
    isRead,
    readAt,
    createdAt,
  ];
}

enum MessageType { text, image, gif, emoji, sticker }