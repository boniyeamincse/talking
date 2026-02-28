import 'package:equatable/equatable.dart';

enum MessageType { text, image, audio }

class ChatMessage extends Equatable {
  final String id;
  final String conversationId;
  final int senderId;
  final String content;
  final MessageType type;
  final DateTime createdAt;
  final bool isMe;
  final Map<String, dynamic>? metadata;

  const ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.content,
    required this.type,
    required this.createdAt,
    required this.isMe,
    this.metadata,
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json, int currentUserId) {
    return ChatMessage(
      id: json['id'].toString(),
      conversationId: json['conversation_id'].toString(),
      senderId: json['sender_id'],
      content: json['content'] ?? '',
      type: _parseMessageType(json['type']),
      createdAt: DateTime.parse(json['created_at']),
      isMe: json['sender_id'] == currentUserId,
      metadata: json['metadata'],
    );
  }

  static MessageType _parseMessageType(String? type) {
    switch (type) {
      case 'image':
        return MessageType.image;
      case 'audio':
        return MessageType.audio;
      default:
        return MessageType.text;
    }
  }

  @override
  List<Object?> get props => [id, conversationId, senderId, content, type, createdAt, isMe];
}
