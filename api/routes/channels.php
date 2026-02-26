<?php

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Private conversation channel
// Only participants can listen to conversation events
Broadcast::channel('conversation.{conversationId}', function (User $user, int $conversationId) {
    $conversation = Conversation::find($conversationId);
    
    return $conversation && $conversation->isParticipant($user);
});

// User private channel for call signaling
// Only the user can listen to their own channel
Broadcast::channel('user.{userId}', function (User $user, int $userId) {
    return (int) $user->id === (int) $userId;
});

// Voice room channel
// Only participants can listen to room events
Broadcast::channel('voice-room.{roomId}', function (User $user, int $roomId) {
    $room = \App\Models\VoiceRoom::find($roomId);
    return $room && $room->isActive() && $room->isParticipant($user);
});
