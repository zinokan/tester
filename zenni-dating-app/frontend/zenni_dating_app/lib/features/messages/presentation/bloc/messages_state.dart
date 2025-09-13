part of 'messages_bloc.dart';

abstract class MessagesState extends Equatable {
  const MessagesState();

  @override
  List<Object?> get props => [];
}

class MessagesInitial extends MessagesState {}

class MessagesLoading extends MessagesState {}

class MessagesLoaded extends MessagesState {
  final List<dynamic> messages;

  const MessagesLoaded({required this.messages});

  @override
  List<Object?> get props => [messages];
}

class MessagesError extends MessagesState {
  final String message;

  const MessagesError({required this.message});

  @override
  List<Object?> get props => [message];
}