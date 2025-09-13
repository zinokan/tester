import '../repositories/messages_repository.dart';

class GetMessages {
  final MessagesRepository repository;

  GetMessages(this.repository);

  Future<List<dynamic>> call(GetMessagesParams params) async {
    // TODO: Implement get messages
    throw UnimplementedError();
  }
}

class GetMessagesParams {
  final int matchId;

  GetMessagesParams({required this.matchId});
}