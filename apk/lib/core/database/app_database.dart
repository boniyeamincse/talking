import 'dart:io';
import 'package:drift/drift.dart';
import 'package:drift/native.dart';
import 'package:path_provider/path_provider.dart';
import 'package:path/path.dart' as p;

part 'app_database.g.dart';

/// Messages table for offline support
class Messages extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get serverId => integer().nullable()(); // ID from server
  IntColumn get conversationId => integer()();
  IntColumn get userId => integer()();
  TextColumn get content => text()();
  TextColumn get type => text()(); // text, image, audio, video
  TextColumn get status => text()(); // sending, sent, delivered, read, failed
  DateTimeColumn get createdAt => dateTime()();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
  TextColumn get mediaUrl => text().nullable()();
  TextColumn get thumbnailUrl => text().nullable()();
}

/// Conversations table for offline support
class Conversations extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get serverId => integer().nullable()();
  TextColumn get type => text()(); // private, group
  TextColumn get name => text().nullable()();
  TextColumn get lastMessage => text().nullable()();
  DateTimeColumn get lastMessageAt => dateTime().nullable()();
  IntColumn get unreadCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get updatedAt => dateTime()();
  BoolColumn get isSynced => boolean().withDefault(const Constant(false))();
}

/// Conversation participants table
class ConversationParticipants extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get conversationId => integer()();
  IntColumn get userId => integer()();
  TextColumn get userName => text()();
  TextColumn get userAvatar => text().nullable()();
  DateTimeColumn get joinedAt => dateTime()();
}

/// Cached user profiles
class CachedUsers extends Table {
  IntColumn get id => integer().autoIncrement()();
  IntColumn get serverId => integer().unique()();
  TextColumn get username => text()();
  TextColumn get name => text()();
  TextColumn get email => text().nullable()();
  TextColumn get avatar => text().nullable()();
  TextColumn get bio => text().nullable()();
  TextColumn get nativeLanguage => text().nullable()();
  TextColumn get learningLanguage => text().nullable()();
  DateTimeColumn get cachedAt => dateTime()();
}

/// Pending uploads (for retry mechanism)
class PendingUploads extends Table {
  IntColumn get id => integer().autoIncrement()();
  TextColumn get type => text()(); // message, post, profile_picture
  TextColumn get localPath => text()();
  TextColumn get uploadUrl => text()();
  TextColumn get metadata => text()(); // JSON string
  IntColumn get retryCount => integer().withDefault(const Constant(0))();
  DateTimeColumn get createdAt => dateTime()();
}

/// App database with offline support
@DriftDatabase(tables: [
  Messages,
  Conversations,
  ConversationParticipants,
  CachedUsers,
  PendingUploads,
])
class AppDatabase extends _$AppDatabase {
  AppDatabase() : super(_openConnection());

  @override
  int get schemaVersion => 1;
  
  // Messages CRUD
  
  /// Get messages for a conversation
  Future<List<Message>> getConversationMessages(int conversationId) {
    return (select(messages)
      ..where((m) => m.conversationId.equals(conversationId))
      ..orderBy([(m) => OrderingTerm.desc(m.createdAt)]))
      .get();
  }
  
  /// Insert a new message
  Future<int> insertMessage(MessagesCompanion message) {
    return into(messages).insert(message);
  }
  
  /// Update message status
  Future<void> updateMessageStatus(int id, String status) {
    return (update(messages)..where((m) => m.id.equals(id)))
      .write(MessagesCompanion(status: Value(status)));
  }
  
  /// Update message sync status
  Future<void> updateMessageSyncStatus(int id, bool synced, int? serverId) {
    return (update(messages)..where((m) => m.id.equals(id)))
      .write(MessagesCompanion(
        isSynced: Value(synced),
        serverId: Value(serverId),
      ));
  }
  
  /// Get unsynced messages
  Future<List<Message>> getUnsyncedMessages() {
    return (select(messages)
      ..where((m) => m.isSynced.equals(false))
      ..orderBy([(m) => OrderingTerm.asc(m.createdAt)]))
      .get();
  }
  
  /// Delete old messages (cleanup)
  Future<int> deleteOldMessages(DateTime before) {
    return (delete(messages)
      ..where((m) => m.createdAt.isSmallerThanValue(before)))
      .go();
  }
  
  // Conversations CRUD
  
  /// Get all conversations
  Future<List<Conversation>> getAllConversations() {
    return (select(conversations)
      ..orderBy([(c) => OrderingTerm.desc(c.updatedAt)]))
      .get();
  }
  
  /// Get conversation by ID
  Future<Conversation?> getConversation(int id) {
    return (select(conversations)..where((c) => c.id.equals(id)))
      .getSingleOrNull();
  }
  
  /// Insert or update conversation
  Future<int> upsertConversation(ConversationsCompanion conversation) {
    return into(conversations).insertOnConflictUpdate(conversation);
  }
  
  /// Update conversation last message
  Future<void> updateConversationLastMessage(
    int id,
    String lastMessage,
    DateTime lastMessageAt,
  ) {
    return (update(conversations)..where((c) => c.id.equals(id)))
      .write(ConversationsCompanion(
        lastMessage: Value(lastMessage),
        lastMessageAt: Value(lastMessageAt),
        updatedAt: Value(DateTime.now()),
      ));
  }
  
  /// Increment unread count
  Future<void> incrementUnreadCount(int conversationId) async {
    final conversation = await getConversation(conversationId);
    if (conversation != null) {
      await (update(conversations)..where((c) => c.id.equals(conversationId)))
        .write(ConversationsCompanion(
          unreadCount: Value(conversation.unreadCount + 1),
        ));
    }
  }
  
  /// Reset unread count
  Future<void> resetUnreadCount(int conversationId) {
    return (update(conversations)..where((c) => c.id.equals(conversationId)))
      .write(const ConversationsCompanion(unreadCount: Value(0)));
  }
  
  // Conversation Participants
  
  /// Get participants for a conversation
  Future<List<ConversationParticipant>> getConversationParticipants(
    int conversationId,
  ) {
    return (select(conversationParticipants)
      ..where((p) => p.conversationId.equals(conversationId)))
      .get();
  }
  
  /// Add participant to conversation
  Future<int> addParticipant(ConversationParticipantsCompanion participant) {
    return into(conversationParticipants).insert(participant);
  }
  
  // Cached Users
  
  /// Get cached user by server ID
  Future<CachedUser?> getCachedUser(int serverId) {
    return (select(cachedUsers)..where((u) => u.serverId.equals(serverId)))
      .getSingleOrNull();
  }
  
  /// Cache user profile
  Future<int> cacheUser(CachedUsersCompanion user) {
    return into(cachedUsers).insertOnConflictUpdate(user);
  }
  
  /// Delete old cached users
  Future<int> deleteOldCachedUsers(DateTime before) {
    return (delete(cachedUsers)
      ..where((u) => u.cachedAt.isSmallerThanValue(before)))
      .go();
  }
  
  // Pending Uploads
  
  /// Add pending upload
  Future<int> addPendingUpload(PendingUploadsCompanion upload) {
    return into(pendingUploads).insert(upload);
  }
  
  /// Get all pending uploads
  Future<List<PendingUpload>> getPendingUploads() {
    return select(pendingUploads).get();
  }
  
  /// Increment retry count
  Future<void> incrementRetryCount(int id) async {
    final upload = await (select(pendingUploads)
      ..where((u) => u.id.equals(id)))
      .getSingleOrNull();
    
    if (upload != null) {
      await (update(pendingUploads)..where((u) => u.id.equals(id)))
        .write(PendingUploadsCompanion(
          retryCount: Value(upload.retryCount + 1),
        ));
    }
  }
  
  /// Delete pending upload
  Future<int> deletePendingUpload(int id) {
    return (delete(pendingUploads)..where((u) => u.id.equals(id))).go();
  }
  
  // Cleanup operations
  
  /// Clear all data (logout)
  Future<void> clearAllData() async {
    await delete(messages).go();
    await delete(conversations).go();
    await delete(conversationParticipants).go();
    await delete(cachedUsers).go();
    await delete(pendingUploads).go();
  }
  
  /// Cleanup old data
  Future<void> cleanupOldData() async {
    final thirtyDaysAgo = DateTime.now().subtract(const Duration(days: 30));
    await deleteOldMessages(thirtyDaysAgo);
    await deleteOldCachedUsers(thirtyDaysAgo);
  }
}

/// Open database connection
LazyDatabase _openConnection() {
  return LazyDatabase(() async {
    final dbFolder = await getApplicationDocumentsDirectory();
    final file = File(p.join(dbFolder.path, 'banitalk.db'));
    return NativeDatabase(file);
  });
}
