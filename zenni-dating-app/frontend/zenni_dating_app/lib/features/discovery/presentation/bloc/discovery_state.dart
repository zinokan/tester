part of 'discovery_bloc.dart';

abstract class DiscoveryState extends Equatable {
  const DiscoveryState();

  @override
  List<Object?> get props => [];
}

class DiscoveryInitial extends DiscoveryState {}

class DiscoveryLoading extends DiscoveryState {}

class DiscoveryLoaded extends DiscoveryState {
  final List<User> matches;

  const DiscoveryLoaded({required this.matches});

  @override
  List<Object?> get props => [matches];
}

class DiscoveryError extends DiscoveryState {
  final String message;

  const DiscoveryError({required this.message});

  @override
  List<Object?> get props => [message];
}