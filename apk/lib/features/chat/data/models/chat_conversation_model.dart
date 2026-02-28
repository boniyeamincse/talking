import 'package:equatable/equatable.dart';
import 'chat_message_model.dart';

class ChatConversation extends Equatable {
  final String id;
  final String participantName;
  final String? participantAvatar;
  final String? lastMessage;
  final DateTime? lastMessageTime;
  final int unreadCount;
  final bool isOnline;

  const ChatConversation({
    required this.id,
    required this.participantName,
    this.participantAvatar,
    this.lastMessage,
    this.lastMessageTime,
    this.unreadCount = 0,
    this.isOnline = false,
  });

  factory ChatConversation.fromJson(Map<String, dynamic> json) {
    return ChatConversation(
      id: json['id'].toString(),
      participantName: json['participant_name'] ?? 'Unknown',
      participantAvatar: json['participant_avatar'],
      lastMessage: json['last_message'],
      lastMessageTime: json['last_message_time'] != null 
          ? DateTime.parse(json['last_message_time']) 
          : null,
      unreadCount: json['unread_count'] ?? 0,
      isOnline: json['is_online'] ?? false,
    );
  }

  @override
  List<Object?> get props => [id, participantName, lastMessage, unreadCount, isOnline];
}
