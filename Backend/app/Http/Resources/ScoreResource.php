<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Score;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/** @mixin Score */
final class ScoreResource extends JsonResource
{
    /** @return array<string, mixed> */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'player_name' => $this->player_name,
            'score' => $this->score,
            'rounds_played' => $this->rounds_played,
            'game_over_reason' => $this->game_over_reason,
            'created_at' => $this->created_at?->toISOString(),
        ];
    }
}
