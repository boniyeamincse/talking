import 'package:equatable/equatable.dart';
import '../../data/models/chat_message_model.dart';

abstract class ChatEvent extends Equatable {
  @override
  List<Object?> get props => [];
}

class LoadConversations extends ChatEvent {}

class LoadMessages extends ChatEvent {
  final String conversationId;
  LoadMessages(this.conversationId);
  @override
  List<Object?> get props => [conversationId];
}

class SendMessageEvent extends ChatEvent {
  final String conversationId;
  final String content;
  final MessageType type;
  SendMessageEvent(this.conversationId, this.content, this.type);
  @override
  List<Object?> get props => [conversationId, content, type];
}

class ReceiveMessage extends ChatEvent {
  final ChatMessage message;
  ReceiveMessage(this.message);
  @override
  List<Object?> get props => [message];
}
