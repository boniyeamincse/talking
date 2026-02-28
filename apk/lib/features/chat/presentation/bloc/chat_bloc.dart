import 'dart:async';
import 'package:flutter_bloc/flutter_bloc.dart';
import '../../domain/repositories/chat_repository.dart';
import '../../data/models/chat_message_model.dart';
import 'chat_event.dart';
import 'chat_state.dart';

class ChatBloc extends Bloc<ChatEvent, ChatState> {
  final ChatRepository chatRepository;
  StreamSubscription? _messageSubscription;

  ChatBloc({required this.chatRepository}) : super(ChatInitial()) {
    on<LoadConversations>(_onLoadConversations);
    on<LoadMessages>(_onLoadMessages);
    on<SendMessageEvent>(_onSendMessage);
    on<ReceiveMessage>(_onReceiveMessage);

    // Subscribe to real-time messages
    _messageSubscription = chatRepository.messageStream.listen((message) {
      add(ReceiveMessage(message));
    });
  }

  Future<void> _onLoadConversations(LoadConversations event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    try {
      final conversations = await chatRepository.getConversations();
      emit(ConversationsLoaded(conversations));
    } catch (e) {
      emit(ChatError(e.toString()));
    }
  }

  Future<void> _onLoadMessages(LoadMessages event, Emitter<ChatState> emit) async {
    emit(ChatLoading());
    try {
      final messages = await chatRepository.getMessages(event.conversationId);
      emit(MessagesLoaded(event.conversationId, messages));
    } catch (e) {
      emit(ChatError(e.toString()));
    }
  }

  Future<void> _onSendMessage(SendMessageEvent event, Emitter<ChatState> emit) async {
    // Current messages in state
    if (state is MessagesLoaded) {
      final currentState = state as MessagesLoaded;
      
      try {
        final message = await chatRepository.sendMessage(
          event.conversationId,
          event.content,
          event.type,
        );
        
        // Add new message to current list
        final updatedMessages = List<ChatMessage>.from(currentState.messages)..add(message);
        emit(MessagesLoaded(event.conversationId, updatedMessages));
      } catch (e) {
        emit(ChatError(e.toString()));
      }
    }
  }

  void _onReceiveMessage(ReceiveMessage event, Emitter<ChatState> emit) {
    if (state is MessagesLoaded) {
      final currentState = state as MessagesLoaded;
      // Only add to stream if it belongs to the active conversation
      if (currentState.conversationId == event.message.conversationId) {
        final updatedMessages = List<ChatMessage>.from(currentState.messages)..add(event.message);
        emit(MessagesLoaded(currentState.conversationId, updatedMessages));
      }
    }
  }

  @override
  Future<void> close() {
    _messageSubscription?.cancel();
    chatRepository.disposeWebSocket();
    return super.close();
  }
}
