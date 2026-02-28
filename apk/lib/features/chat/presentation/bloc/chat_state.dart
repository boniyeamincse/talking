import 'package:equatable/equatable.dart';
import '../../data/models/chat_conversation_model.dart';
import '../../data/models/chat_message_model.dart';

abstract class ChatState extends Equatable {
  @override
  List<Object?> get props => [];
}

class ChatInitial extends ChatState {}

class ChatLoading extends ChatState {}

class ConversationsLoaded extends ChatState {
  final List<ChatConversation> conversations;
  ConversationsLoaded(this.conversations);
  @override
  List<Object?> get props => [conversations];
}

class MessagesLoaded extends ChatState {
  final String conversationId;
  final List<ChatMessage> messages;
  MessagesLoaded(this.conversationId, this.messages);
  @override
  List<Object?> get props => [conversationId, messages];
}

class ChatError extends ChatState {
  final String message;
  ChatError(this.message);
  @override
  List<Object?> get props => [message];
}
