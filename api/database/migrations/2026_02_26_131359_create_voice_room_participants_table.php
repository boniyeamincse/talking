<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_room_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('room_id')->constrained('voice_rooms')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->enum('role', ['host', 'co_host', 'speaker', 'audience'])->default('audience');
            $table->timestamp('joined_at');
            $table->timestamps();

            $table->unique(['room_id', 'user_id']);
            $table->index('room_id');
            $table->index('user_id');
            $table->index('role');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_room_participants');
    }
};
