import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

import '../../domain/models/user.dart';
import '../../domain/usecases/get_potential_matches.dart';

part 'discovery_event.dart';
part 'discovery_state.dart';

class DiscoveryBloc extends Bloc<DiscoveryEvent, DiscoveryState> {
  final GetPotentialMatches getPotentialMatches;

  DiscoveryBloc({
    required this.getPotentialMatches,
  }) : super(DiscoveryInitial()) {
    on<LoadPotentialMatches>(_onLoadPotentialMatches);
  }

  Future<void> _onLoadPotentialMatches(
    LoadPotentialMatches event,
    Emitter<DiscoveryState> emit,
  ) async {
    emit(DiscoveryLoading());
    try {
      final matches = await getPotentialMatches(GetPotentialMatchesParams(
        userId: event.userId,
      ));
      emit(DiscoveryLoaded(matches: matches));
    } catch (e) {
      emit(DiscoveryError(message: e.toString()));
    }
  }
}