import '../repositories/discovery_repository.dart';

class GetPotentialMatches {
  final DiscoveryRepository repository;

  GetPotentialMatches(this.repository);

  Future<List<dynamic>> call(GetPotentialMatchesParams params) async {
    // TODO: Implement get potential matches
    throw UnimplementedError();
  }
}

class GetPotentialMatchesParams {
  final int userId;

  GetPotentialMatchesParams({required this.userId});
}