import '../repositories/matches_repository.dart';

class ProcessSwipe {
  final MatchesRepository repository;

  ProcessSwipe(this.repository);

  Future<dynamic> call(ProcessSwipeParams params) async {
    // TODO: Implement process swipe
    throw UnimplementedError();
  }
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