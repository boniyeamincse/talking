<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->unsignedInteger('followers_count')->default(0)->after('coin_balance');
            $table->unsignedInteger('following_count')->default(0)->after('followers_count');
            
            $table->index('followers_count');
            $table->index('following_count');
        });
    }

    public function down(): void
    {
        Schema::table('profiles', function (Blueprint $table) {
            $table->dropIndex(['followers_count']);
            $table->dropIndex(['following_count']);
            $table->dropColumn(['followers_count', 'following_count']);
        });
    }
};
