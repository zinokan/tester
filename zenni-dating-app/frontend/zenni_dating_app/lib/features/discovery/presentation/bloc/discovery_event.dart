part of 'discovery_bloc.dart';

abstract class DiscoveryEvent extends Equatable {
  const DiscoveryEvent();

  @override
  List<Object?> get props => [];
}

class LoadPotentialMatches extends DiscoveryEvent {
  final int userId;

  const LoadPotentialMatches({required this.userId});

  @override
  List<Object?> get props => [userId];
}