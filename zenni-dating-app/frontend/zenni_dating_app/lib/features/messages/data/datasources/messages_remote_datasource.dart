import 'package:dio/dio.dart';

abstract class MessagesRemoteDataSource {
  Future<List<Map<String, dynamic>>> getMessages(int matchId);
  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> messageData);
}

class MessagesRemoteDataSourceImpl implements MessagesRemoteDataSource {
  final Dio dio;

  MessagesRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<Map<String, dynamic>>> getMessages(int matchId) async {
    // TODO: Implement get messages
    throw UnimplementedError();
  }

  @override
  Future<Map<String, dynamic>> sendMessage(Map<String, dynamic> messageData) async {
    // TODO: Implement send message
    throw UnimplementedError();
  }
}