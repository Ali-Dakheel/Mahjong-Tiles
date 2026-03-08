<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('scores', function (Blueprint $table): void {
            $table->id();
            $table->string('player_name');
            $table->unsignedInteger('score')->default(0);
            $table->unsignedInteger('rounds_played')->default(0);
            $table->string('game_over_reason');
            $table->timestamps();

            $table->index('score');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('scores');
    }
};
