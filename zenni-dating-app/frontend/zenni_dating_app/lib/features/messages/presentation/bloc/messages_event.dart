part of 'messages_bloc.dart';

abstract class MessagesEvent extends Equatable {
  const MessagesEvent();

  @override
  List<Object?> get props => [];
}

class LoadMessages extends MessagesEvent {
  final int matchId;

  const LoadMessages({required this.matchId});

  @override
  List<Object?> get props => [matchId];
}