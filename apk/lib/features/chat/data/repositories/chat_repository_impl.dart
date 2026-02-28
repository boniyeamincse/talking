import 'dart:async';
import 'package:laravel_echo/laravel_echo.dart';
import 'package:pusher_client/pusher_client.dart';
import 'package:banitalk/core/network/api_client.dart';
import '../../data/models/chat_conversation_model.dart';
import '../../data/models/chat_message_model.dart';
import '../../domain/repositories/chat_repository.dart';

class ChatRepositoryImpl implements ChatRepository {
  final ApiClient apiClient;
  Echo? _echo;
  final _messageController = StreamController<ChatMessage>.broadcast();

  ChatRepositoryImpl({required this.apiClient});

  @override
  Stream<ChatMessage> get messageStream => _messageController.stream;

  @override
  void initWebSocket(String token) {
    PusherOptions options = PusherOptions(
      host: 'localhost', // Change to your pusher host
      port: 6001,
      encrypted: false,
      cluster: 'mt1',
      auth: PusherAuth(
        '${apiClient.dio.options.baseUrl}/broadcasting/auth',
        headers: {
          'Authorization': 'Bearer $token',
        },
      ),
    );

    PusherClient pusher = PusherClient('local', options, autoConnect: true);

    _echo = Echo(
      client: pusher,
      broadcaster: EchoBroadcasterType.Pusher,
    );

    _echo?.private('chat').listen('MessageSent', (data) {
      // Assuming 1 is current user for testing, normally you'd get this from AuthBloc
      final message = ChatMessage.fromJson(data['message'], 1);
      _messageController.add(message);
    });
  }

  @override
  void disposeWebSocket() {
    _echo?.disconnect();
    _messageController.close();
  }

  @override
  Future<List<ChatConversation>> getConversations() async {
    try {
      final response = await apiClient.dio.get('/chat/conversations');
      final List data = response.data['data'];
      return data.map((e) => ChatConversation.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<List<ChatMessage>> getMessages(String conversationId) async {
    try {
      final response = await apiClient.dio.get('/chat/conversations/$conversationId/messages');
      final List data = response.data['data'];
      // Assuming 1 is current user id for now
      return data.map((e) => ChatMessage.fromJson(e, 1)).toList();
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<ChatMessage> sendMessage(String conversationId, String content, MessageType type) async {
    try {
      final response = await apiClient.dio.post(
        '/chat/conversations/$conversationId/messages',
        data: {
          'content': content,
          'type': type.name,
        },
      );
      return ChatMessage.fromJson(response.data['data'], 1);
    } catch (e) {
      rethrow;
    }
  }

  @override
  Future<void> markAsRead(String conversationId) async {
    try {
      await apiClient.dio.post('/chat/conversations/$conversationId/read');
    } catch (e) {
      rethrow;
    }
  }
}
