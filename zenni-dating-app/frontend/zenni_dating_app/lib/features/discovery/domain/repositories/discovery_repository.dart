abstract class DiscoveryRepository {
  Future<List<dynamic>> getPotentialMatches(int userId);
}