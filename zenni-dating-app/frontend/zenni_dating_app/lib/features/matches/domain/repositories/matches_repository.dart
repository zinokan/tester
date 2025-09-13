abstract class MatchesRepository {
  Future<List<dynamic>> getMatches(int userId);
  Future<dynamic> processSwipe(ProcessSwipeParams params);
}

class ProcessSwipeParams {
  final int swiperId;
  final int swipedId;
  final String type;

  ProcessSwipeParams({
    required this.swiperId,
    required this.swipedId,
    required this.type,
  });
}