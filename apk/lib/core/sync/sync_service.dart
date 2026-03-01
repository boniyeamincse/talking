import 'dart:async';
import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:banitalk/core/database/app_database.dart';
import 'package:banitalk/core/network/enhanced_api_client.dart';
import 'package:drift/drift.dart' as drift;

/// Sync service for offline support
/// Handles synchronization between local database and server
class SyncService {
  final AppDatabase _database;
  final EnhancedApiClient _apiClient;
  final Connectivity _connectivity = Connectivity();
  
  StreamSubscription<List<ConnectivityResult>>? _connectivitySubscription;
  bool _isSyncing = false;
  
  SyncService({
    required AppDatabase database,
    required EnhancedApiClient apiClient,
  })  : _database = database,
        _apiClient = apiClient;
  
  /// Start listening for connectivity changes
  void startListening() {
    _connectivitySubscription = _connectivity.onConnectivityChanged.listen(
      (List<ConnectivityResult> results) {
        if (results.isNotEmpty && results.first != ConnectivityResult.none) {
          // Connected to internet - start sync
          syncAll();
        }
      },
    );
  }
  
  /// Stop listening for connectivity changes
  void stopListening() {
    _connectivitySubscription?.cancel();
  }
  
  /// Check if device is online
  Future<bool> isOnline() async {
    final result = await _connectivity.checkConnectivity();
    return result.isNotEmpty && result.first != ConnectivityResult.none;
  }
  
  /// Sync all data
  Future<void> syncAll() async {
    if (_isSyncing) return;
    
    _isSyncing = true;
    try {
      await Future.wait([
        syncMessages(),
        syncConversations(),
        syncPendingUploads(),
      ]);
    } finally {
      _isSyncing = false;
    }
  }
  
  /// Sync messages
  Future<void> syncMessages() async {
    if (!await isOnline()) return;
    
    try {
      // Get unsynced messages
      final unsyncedMessages = await _database.getUnsyncedMessages();
      
      for (final message in unsyncedMessages) {
        try {
          // Upload message to server
          final response = await _apiClient.post(
            '/messages',
            data: {
              'conversation_id': message.conversationId,
              'content': message.content,
              'type': message.type,
              'created_at': message.createdAt.toIso8601String(),
            },
          );
          
          if (response.statusCode == 200 || response.statusCode == 201) {
            final serverData = response.data['data'];
            
            // Update local message with server ID
            await _database.updateMessageSyncStatus(
              message.id,
              true,
              serverData['id'] as int,
            );
            
            // Update message status
            await _database.updateMessageStatus(message.id, 'sent');
          }
        } catch (e) {
          print('Failed to sync message ${message.id}: $e');
          // Mark as failed
          await _database.updateMessageStatus(message.id, 'failed');
        }
      }
    } catch (e) {
      print('Message sync error: $e');
    }
  }
  
  /// Sync conversations
  Future<void> syncConversations() async {
    if (!await isOnline()) return;
    
    try {
      // Fetch latest conversations from server
      final response = await _apiClient.get('/conversations');
      
      if (response.statusCode == 200) {
        final conversations = response.data['data'] as List;
        
        for (final conv in conversations) {
          // Update or insert conversation
          await _database.upsertConversation(
            ConversationsCompanion(
              serverId: drift.Value(conv['id'] as int),
              type: drift.Value(conv['type'] as String),
              name: drift.Value(conv['name'] as String?),
              lastMessage: drift.Value(conv['last_message'] as String?),
              lastMessageAt: drift.Value(
                conv['last_message_at'] != null
                    ? DateTime.parse(conv['last_message_at'] as String)
                    : null,
              ),
              unreadCount: drift.Value(conv['unread_count'] as int? ?? 0),
              updatedAt: drift.Value(DateTime.now()),
              isSynced: const drift.Value(true),
            ),
          );
        }
      }
    } catch (e) {
      print('Conversation sync error: $e');
    }
  }
  
  /// Sync pending uploads
  Future<void> syncPendingUploads() async {
    if (!await isOnline()) return;
    
    try {
      final pendingUploads = await _database.getPendingUploads();
      
      for (final upload in pendingUploads) {
        try {
          // Attempt upload
          final response = await _apiClient.post(
            upload.uploadUrl,
            data: {
              'type': upload.type,
              'metadata': upload.metadata,
            },
          );
          
          if (response.statusCode == 200 || response.statusCode == 201) {
            // Upload successful - delete from queue
            await _database.deletePendingUpload(upload.id);
          } else {
            // Upload failed - increment retry count
            await _database.incrementRetryCount(upload.id);
            
            // Delete if too many retries
            if (upload.retryCount >= 3) {
              await _database.deletePendingUpload(upload.id);
            }
          }
        } catch (e) {
          print('Failed to upload ${upload.id}: $e');
          await _database.incrementRetryCount(upload.id);
        }
      }
    } catch (e) {
      print('Upload sync error: $e');
    }
  }
  
  /// Download messages for a conversation
  Future<void> downloadMessages(int conversationId) async {
    if (!await isOnline()) return;
    
    try {
      final response = await _apiClient.get(
        '/conversations/$conversationId/messages',
      );
      
      if (response.statusCode == 200) {
        final messages = response.data['data'] as List;
        
        for (final msg in messages) {
          // Check if message already exists
          final existingMessages = await _database.getConversationMessages(
            conversationId,
          );
          
          final exists = existingMessages.any(
            (m) => m.serverId == msg['id'],
          );
          
          if (!exists) {
            // Insert new message
            await _database.insertMessage(
              MessagesCompanion.insert(
                serverId: drift.Value(msg['id'] as int),
                conversationId: conversationId,
                userId: msg['user_id'] as int,
                content: msg['content'] as String,
                type: msg['type'] as String,
                status: msg['status'] as String,
                createdAt: DateTime.parse(msg['created_at'] as String),
                updatedAt: DateTime.parse(msg['updated_at'] as String),
                isSynced: const drift.Value(true),
                mediaUrl: drift.Value(msg['media_url'] as String?),
                thumbnailUrl: drift.Value(msg['thumbnail_url'] as String?),
              ),
            );
          }
        }
      }
    } catch (e) {
      print('Download messages error: $e');
    }
  }
  
  /// Cache user profile
  Future<void> cacheUserProfile(int userId) async {
    if (!await isOnline()) return;
    
    try {
      final response = await _apiClient.get('/users/$userId');
      
      if (response.statusCode == 200) {
        final user = response.data['data'];
        
        await _database.cacheUser(
          CachedUsersCompanion.insert(
            serverId: userId,
            username: user['username'] as String,
            name: user['name'] as String,
            email: drift.Value(user['email'] as String?),
            avatar: drift.Value(user['avatar'] as String?),
            bio: drift.Value(user['bio'] as String?),
            nativeLanguage: drift.Value(user['native_language'] as String?),
            learningLanguage: drift.Value(user['learning_language'] as String?),
            cachedAt: DateTime.now(),
          ),
        );
      }
    } catch (e) {
      print('Cache user error: $e');
    }
  }
  
  /// Get sync status
  Future<SyncStatus> getSyncStatus() async {
    final unsyncedMessages = await _database.getUnsyncedMessages();
    final pendingUploads = await _database.getPendingUploads();
    final online = await isOnline();
    
    return SyncStatus(
      isOnline: online,
      isSyncing: _isSyncing,
      unsyncedMessages: unsyncedMessages.length,
      pendingUploads: pendingUploads.length,
    );
  }
  
  /// Force sync now
  Future<void> forceSyncNow() async {
    if (await isOnline()) {
      await syncAll();
    }
  }
  
  /// Cleanup old data
  Future<void> cleanup() async {
    await _database.cleanupOldData();
  }
  
  /// Dispose
  void dispose() {
    stopListening();
  }
}

/// Sync status
class SyncStatus {
  final bool isOnline;
  final bool isSyncing;
  final int unsyncedMessages;
  final int pendingUploads;
  
  SyncStatus({
    required this.isOnline,
    required this.isSyncing,
    required this.unsyncedMessages,
    required this.pendingUploads,
  });
  
  bool get hasPendingSync => unsyncedMessages > 0 || pendingUploads > 0;
  
  String get statusMessage {
    if (!isOnline) {
      return 'Offline';
    } else if (isSyncing) {
      return 'Syncing...';
    } else if (hasPendingSync) {
      return 'Pending sync ($unsyncedMessages messages, $pendingUploads uploads)';
    }
    return 'All synced';
  }
}
