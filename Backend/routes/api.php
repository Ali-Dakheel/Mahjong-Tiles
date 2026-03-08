<?php

declare(strict_types=1);

use App\Http\Controllers\Api\V1\ScoreController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function (): void {
    Route::post('scores', [ScoreController::class, 'store']);
    Route::get('leaderboard', [ScoreController::class, 'leaderboard']);
});
