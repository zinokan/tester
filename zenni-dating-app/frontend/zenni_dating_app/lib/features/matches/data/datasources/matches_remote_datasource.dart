import 'package:dio/dio.dart';

abstract class MatchesRemoteDataSource {
  Future<List<Map<String, dynamic>>> getMatches(int userId);
  Future<Map<String, dynamic>> processSwipe(Map<String, dynamic> swipeData);
}

class MatchesRemoteDataSourceImpl implements MatchesRemoteDataSource {
  final Dio dio;

  MatchesRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<Map<String, dynamic>>> getMatches(int userId) async {
    // TODO: Implement get matches
    throw UnimplementedError();
  }

  @override
  Future<Map<String, dynamic>> processSwipe(Map<String, dynamic> swipeData) async {
    // TODO: Implement process swipe
    throw UnimplementedError();
  }
}