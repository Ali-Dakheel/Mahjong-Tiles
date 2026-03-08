<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

final class Score extends Model
{
    protected $fillable = [
        'player_name',
        'score',
        'rounds_played',
        'game_over_reason',
    ];

    public function casts(): array
    {
        return [
            'score' => 'integer',
            'rounds_played' => 'integer',
        ];
    }
}
