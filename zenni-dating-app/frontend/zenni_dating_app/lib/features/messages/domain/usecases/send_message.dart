import '../repositories/messages_repository.dart';

class SendMessage {
  final MessagesRepository repository;

  SendMessage(this.repository);

  Future<dynamic> call(SendMessageParams params) async {
    // TODO: Implement send message
    throw UnimplementedError();
  }
}

class SendMessageParams {
  final int matchId;
  final String content;
  final String type;

  SendMessageParams({
    required this.matchId,
    required this.content,
    required this.type,
  });
}