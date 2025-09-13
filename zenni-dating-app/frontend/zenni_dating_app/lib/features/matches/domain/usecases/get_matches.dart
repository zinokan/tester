import '../repositories/matches_repository.dart';

class GetMatches {
  final MatchesRepository repository;

  GetMatches(this.repository);

  Future<List<dynamic>> call(GetMatchesParams params) async {
    // TODO: Implement get matches
    throw UnimplementedError();
  }
}

class GetMatchesParams {
  final int userId;

  GetMatchesParams({required this.userId});
}