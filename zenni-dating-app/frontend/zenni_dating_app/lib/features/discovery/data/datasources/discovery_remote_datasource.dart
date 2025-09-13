import 'package:dio/dio.dart';

abstract class DiscoveryRemoteDataSource {
  Future<List<Map<String, dynamic>>> getPotentialMatches(int userId);
}

class DiscoveryRemoteDataSourceImpl implements DiscoveryRemoteDataSource {
  final Dio dio;

  DiscoveryRemoteDataSourceImpl({required this.dio});

  @override
  Future<List<Map<String, dynamic>>> getPotentialMatches(int userId) async {
    // TODO: Implement get potential matches
    throw UnimplementedError();
  }
}