import '../../domain/repositories/messages_repository.dart';
import '../datasources/messages_remote_datasource.dart';

class MessagesRepositoryImpl implements MessagesRepository {
  final MessagesRemoteDataSource remoteDataSource;

  MessagesRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<dynamic>> getMessages(int matchId) async {
    // TODO: Implement get messages
    throw UnimplementedError();
  }

  @override
  Future<dynamic> sendMessage(SendMessageParams params) async {
    // TODO: Implement send message
    throw UnimplementedError();
  }
}