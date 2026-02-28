import '../data/models/chat_conversation_model.dart';
import '../data/models/chat_message_model.dart';

abstract class ChatRepository {
  Future<List<ChatConversation>> getConversations();
  Future<List<ChatMessage>> getMessages(String conversationId);
  Future<ChatMessage> sendMessage(String conversationId, String content, MessageType type);
  Future<void> markAsRead(String conversationId);
  
  // WebSocket methods
  void initWebSocket(String token);
  void disposeWebSocket();
  Stream<ChatMessage> get messageStream;
}
