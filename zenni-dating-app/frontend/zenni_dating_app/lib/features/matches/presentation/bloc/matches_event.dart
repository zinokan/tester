part of 'matches_bloc.dart';

abstract class MatchesEvent extends Equatable {
  const MatchesEvent();

  @override
  List<Object?> get props => [];
}

class LoadMatches extends MatchesEvent {
  final int userId;

  const LoadMatches({required this.userId});

  @override
  List<Object?> get props => [userId];
}