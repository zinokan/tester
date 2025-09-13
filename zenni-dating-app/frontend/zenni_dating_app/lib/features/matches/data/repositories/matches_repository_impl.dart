import '../../domain/repositories/matches_repository.dart';
import '../datasources/matches_remote_datasource.dart';

class MatchesRepositoryImpl implements MatchesRepository {
  final MatchesRemoteDataSource remoteDataSource;

  MatchesRepositoryImpl({required this.remoteDataSource});

  @override
  Future<List<dynamic>> getMatches(int userId) async {
    // TODO: Implement get matches
    throw UnimplementedError();
  }

  @override
  Future<dynamic> processSwipe(ProcessSwipeParams params) async {
    // TODO: Implement process swipe
    throw UnimplementedError();
  }
}