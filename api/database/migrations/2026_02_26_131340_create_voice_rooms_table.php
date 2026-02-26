<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('voice_rooms', function (Blueprint $table) {
            $table->id();
            $table->foreignId('host_id')->constrained('users')->onDelete('cascade');
            $table->string('title')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_public')->default(true);
            $table->integer('capacity')->default(50);
            $table->enum('state', ['active', 'ended'])->default('active');
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration')->nullable()->comment('Duration in seconds');
            $table->timestamps();

            $table->index('host_id');
            $table->index('state');
            $table->index('is_public');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('voice_rooms');
    }
};
