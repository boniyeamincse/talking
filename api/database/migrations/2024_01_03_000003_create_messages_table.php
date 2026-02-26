<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained('conversations')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('parent_message_id')->nullable()->constrained('messages')->nullOnDelete();
            $table->text('content')->nullable();
            $table->enum('type', ['text', 'media'])->default('text');
            $table->enum('status', ['sent', 'delivered', 'seen'])->default('sent');
            $table->softDeletes(); // deleted_at for soft deletes
            $table->timestamps();

            // Indexes for performance and pagination
            $table->index('conversation_id');
            $table->index(['conversation_id', 'created_at']);
            $table->index('user_id');
            $table->index('parent_message_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('messages');
    }
};
