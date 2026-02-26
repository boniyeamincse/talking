<?php

namespace App\Services;

use App\Models\User;
use App\Models\VoiceRoom;
use App\Models\VoiceRoomParticipant;
use App\Models\SpeakerRequest;
use App\Models\Block;
use App\Events\ParticipantJoined;
use App\Events\ParticipantLeft;
use App\Events\RoleChanged;
use App\Events\SpeakerRequested;
use App\Events\ReactionSent;
use App\Events\RoomUpdated;
use App\Events\RoomClosed;
use App\Events\ParticipantKicked;
use Illuminate\Support\Facades\DB;
use Illuminate\Pagination\LengthAwarePaginator;

class VoiceRoomService
{
    public function createRoom(User $host, array $settings): VoiceRoom
    {
        return DB::transaction(function () use ($host, $settings) {
            // Set defaults
            $settings['host_id'] = $host->id;
            $settings['capacity'] = $settings['capacity'] ?? 50;
            $settings['is_public'] = $settings['is_public'] ?? true;
            $settings['state'] = 'active';

            // Create room
            $room = VoiceRoom::create($settings);

            // Add host as first participant
            VoiceRoomParticipant::create([
                'room_id' => $room->id,
                'user_id' => $host->id,
                'role' => 'host',
                'joined_at' => now(),
            ]);

            return $room->fresh();
        });
    }

    public function updateRoomSettings(VoiceRoom $room, User $user, array $settings): VoiceRoom
    {
        if (!$room->canManageRoom($user)) {
            throw new \Exception('Only the host can update room settings');
        }

        $room->updateSettings($settings);
        broadcast(new RoomUpdated($room))->toOthers();

        return $room->fresh();
    }

    public function closeRoom(VoiceRoom $room, User $user): VoiceRoom
    {
        if (!$room->canManageRoom($user)) {
            throw new \Exception('Only the host can close the room');
        }

        DB::transaction(function () use ($room) {
            $room->close();
            
            // Remove all participants
            $room->participants()->delete();
            
            broadcast(new RoomClosed($room->id));
        });

        return $room->fresh();
    }

    public function joinRoom(VoiceRoom $room, User $user): VoiceRoomParticipant
    {
        // Validate room is active
        if (!$room->isActive()) {
            throw new \Exception('This room is no longer active');
        }

        // Validate room not at capacity
        if ($room->isFull()) {
            throw new \Exception('This room is at capacity');
        }

        // Check block relationships with host
        $isBlocked = Block::where(function ($query) use ($user, $room) {
            $query->where('blocker_id', $room->host_id)
                  ->where('blocked_id', $user->id);
        })->orWhere(function ($query) use ($user, $room) {
            $query->where('blocker_id', $user->id)
                  ->where('blocked_id', $room->host_id);
        })->exists();

        if ($isBlocked) {
            throw new \Exception('Unable to join this room');
        }

        // Add participant with audience role
        $participant = VoiceRoomParticipant::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'role' => 'audience',
            'joined_at' => now(),
        ]);

        broadcast(new ParticipantJoined($room, $participant));

        return $participant->fresh(['user']);
    }

    public function leaveRoom(VoiceRoom $room, User $user): void
    {
        $participant = $room->participants()->where('user_id', $user->id)->first();
        
        if (!$participant) {
            return;
        }

        $wasHost = $participant->isHost();
        
        DB::transaction(function () use ($room, $participant, $wasHost, $user) {
            $participant->delete();
            
            broadcast(new ParticipantLeft($room->id, $user->id));

            if ($wasHost) {
                $this->transferHost($room);
            }
        });
    }

    public function requestToSpeak(VoiceRoom $room, User $user): SpeakerRequest
    {
        // Validate user is participant
        if (!$room->isParticipant($user)) {
            throw new \Exception('You must be in the room to request to speak');
        }

        // Validate user is not already speaker
        $role = $room->getParticipantRole($user);
        if (in_array($role, ['host', 'co_host', 'speaker'])) {
            throw new \Exception('You already have permission to speak');
        }

        // Create speaker request
        $request = SpeakerRequest::create([
            'room_id' => $room->id,
            'user_id' => $user->id,
            'status' => 'pending',
        ]);

        broadcast(new SpeakerRequested($request->load('user')));

        return $request;
    }

    public function promoteToSpeaker(VoiceRoom $room, User $manager, User $target): VoiceRoomParticipant
    {
        // Validate manager can manage speakers
        if (!$room->canManageSpeakers($manager)) {
            throw new \Exception('Only host or co-hosts can promote speakers');
        }

        // Validate target is participant
        $participant = $room->participants()->where('user_id', $target->id)->first();
        if (!$participant) {
            throw new \Exception('User is not in the room');
        }

        // Validate speaker limit not exceeded
        if ($room->getSpeakerCount() >= 20) {
            throw new \Exception('Speaker limit reached (maximum 20 speakers)');
        }

        $oldRole = $participant->role;
        
        DB::transaction(function () use ($participant, $room, $target, $oldRole) {
            $participant->promoteToSpeaker();
            
            // Remove any pending speaker request
            SpeakerRequest::where('room_id', $room->id)
                ->where('user_id', $target->id)
                ->delete();
            
            broadcast(new RoleChanged($room->id, $target->id, 'speaker', $oldRole));
        });

        return $participant->fresh();
    }

    public function demoteToAudience(VoiceRoom $room, User $manager, User $target): VoiceRoomParticipant
    {
        // Validate manager can manage speakers
        if (!$room->canManageSpeakers($manager)) {
            throw new \Exception('Only host or co-hosts can demote speakers');
        }

        // Validate target is not host
        if ($room->host_id === $target->id) {
            throw new \Exception('Cannot demote the host');
        }

        $participant = $room->participants()->where('user_id', $target->id)->first();
        if (!$participant) {
            throw new \Exception('User is not in the room');
        }

        // Check role hierarchy for co-hosts
        if ($participant->isCoHost() && $manager->id !== $room->host_id) {
            throw new \Exception('Only the host can demote co-hosts');
        }

        $oldRole = $participant->role;
        $participant->demoteToAudience();
        
        broadcast(new RoleChanged($room->id, $target->id, 'audience', $oldRole));

        return $participant->fresh();
    }

    public function kickParticipant(VoiceRoom $room, User $manager, User $target): void
    {
        // Validate manager can manage participants
        if (!$room->canManageSpeakers($manager)) {
            throw new \Exception('Only host or co-hosts can kick participants');
        }

        // Validate target is not host
        if ($room->host_id === $target->id) {
            throw new \Exception('Cannot kick the host');
        }

        $participant = $room->participants()->where('user_id', $target->id)->first();
        if (!$participant) {
            return;
        }

        // Check role hierarchy - co-hosts cannot kick other co-hosts
        if ($participant->isCoHost() && $manager->id !== $room->host_id) {
            throw new \Exception('Co-hosts cannot kick other co-hosts');
        }

        $participant->delete();
        broadcast(new ParticipantKicked($room->id, $target->id));
    }

    public function addCoHost(VoiceRoom $room, User $host, User $target): VoiceRoomParticipant
    {
        // Validate user is host
        if (!$room->canManageRoom($host)) {
            throw new \Exception('Only the host can add co-hosts');
        }

        // Validate target is participant
        $participant = $room->participants()->where('user_id', $target->id)->first();
        if (!$participant) {
            throw new \Exception('User is not in the room');
        }

        $oldRole = $participant->role;
        $participant->promoteToCoHost();
        
        broadcast(new RoleChanged($room->id, $target->id, 'co_host', $oldRole));

        return $participant->fresh();
    }

    public function removeCoHost(VoiceRoom $room, User $host, User $target): VoiceRoomParticipant
    {
        // Validate user is host
        if (!$room->canManageRoom($host)) {
            throw new \Exception('Only the host can remove co-hosts');
        }

        $participant = $room->participants()->where('user_id', $target->id)->first();
        if (!$participant || !$participant->isCoHost()) {
            throw new \Exception('User is not a co-host');
        }

        $oldRole = $participant->role;
        
        // Demote to speaker if they were promoted, otherwise audience
        if ($participant->canSpeak()) {
            $participant->demoteToSpeaker();
        } else {
            $participant->demoteToAudience();
        }
        
        broadcast(new RoleChanged($room->id, $target->id, $participant->role, $oldRole));

        return $participant->fresh();
    }

    public function sendReaction(VoiceRoom $room, User $user, string $emoji): void
    {
        // Validate user is participant
        if (!$room->isParticipant($user)) {
            throw new \Exception('You must be in the room to send reactions');
        }

        // Validate emoji format (basic Unicode emoji check)
        if (empty($emoji) || mb_strlen($emoji) > 10) {
            throw new \Exception('Invalid emoji format');
        }

        broadcast(new ReactionSent($room->id, $user->id, $emoji));
    }

    public function getPublicRooms(int $perPage = 15): LengthAwarePaginator
    {
        return VoiceRoom::active()
            ->public()
            ->with(['host', 'participants'])
            ->withCount('participants')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    public function getRoomHistory(User $user, int $perPage = 15): LengthAwarePaginator
    {
        return VoiceRoom::forUser($user)
            ->with(['host', 'participants' => function ($query) use ($user) {
                $query->where('user_id', $user->id);
            }])
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);
    }

    private function transferHost(VoiceRoom $room): void
    {
        // Find oldest co-host, or oldest speaker, or oldest audience
        $newHost = $room->participants()
            ->orderByRaw("CASE 
                WHEN role = 'co_host' THEN 1 
                WHEN role = 'speaker' THEN 2 
                WHEN role = 'audience' THEN 3 
                ELSE 4 
            END")
            ->orderBy('joined_at')
            ->first();

        if (!$newHost) {
            // No participants remain, close the room
            $room->close();
            return;
        }

        $oldRole = $newHost->role;
        
        DB::transaction(function () use ($room, $newHost, $oldRole) {
            // Update room host
            $room->host_id = $newHost->user_id;
            $room->save();
            
            // Update participant role
            $newHost->role = 'host';
            $newHost->save();
            
            broadcast(new RoleChanged($room->id, $newHost->user_id, 'host', $oldRole));
        });
    }
}
