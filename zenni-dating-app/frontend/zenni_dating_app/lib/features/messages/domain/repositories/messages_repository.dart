abstract class MessagesRepository {
  Future<List<dynamic>> getMessages(int matchId);
  Future<dynamic> sendMessage(SendMessageParams params);
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