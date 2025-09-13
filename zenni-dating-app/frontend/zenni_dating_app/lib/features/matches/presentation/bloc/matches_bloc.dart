import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'matches_event.dart';
part 'matches_state.dart';

class MatchesBloc extends Bloc<MatchesEvent, MatchesState> {
  MatchesBloc() : super(MatchesInitial()) {
    on<LoadMatches>(_onLoadMatches);
  }

  Future<void> _onLoadMatches(
    LoadMatches event,
    Emitter<MatchesState> emit,
  ) async {
    emit(MatchesLoading());
    // TODO: Implement matches loading
    emit(MatchesLoaded(matches: []));
  }
}