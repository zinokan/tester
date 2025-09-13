import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:equatable/equatable.dart';

part 'messages_event.dart';
part 'messages_state.dart';

class MessagesBloc extends Bloc<MessagesEvent, MessagesState> {
  MessagesBloc() : super(MessagesInitial()) {
    on<LoadMessages>(_onLoadMessages);
  }

  Future<void> _onLoadMessages(
    LoadMessages event,
    Emitter<MessagesState> emit,
  ) async {
    emit(MessagesLoading());
    // TODO: Implement messages loading
    emit(MessagesLoaded(messages: []));
  }
}