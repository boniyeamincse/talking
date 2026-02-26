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
        Schema::create('calls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('caller_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('callee_id')->constrained('users')->onDelete('cascade');
            $table->enum('type', ['audio', 'video']);
            $table->enum('status', ['initiating', 'ringing', 'active', 'ended', 'declined', 'failed', 'missed'])->default('initiating');
            $table->timestamp('initiated_at');
            $table->timestamp('answered_at')->nullable();
            $table->timestamp('ended_at')->nullable();
            $table->integer('duration')->nullable()->comment('Duration in seconds');
            $table->enum('end_reason', ['completed', 'declined', 'missed', 'failed', 'cancelled'])->nullable();
            $table->timestamps();

            // Indexes for performance
            $table->index('caller_id');
            $table->index('callee_id');
            $table->index('status');
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('calls');
    }
};
