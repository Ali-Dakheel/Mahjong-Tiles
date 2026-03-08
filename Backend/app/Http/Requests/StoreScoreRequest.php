<?php

declare(strict_types=1);

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

final class StoreScoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** @return array<string, array<int, string>> */
    public function rules(): array
    {
        return [
            'player_name' => ['required', 'string', 'max:50'],
            'score' => ['required', 'integer', 'min:0'],
            'rounds_played' => ['required', 'integer', 'min:0'],
            'game_over_reason' => ['required', 'string', 'in:tile_value_zero,tile_value_ten,reshuffle_limit'],
        ];
    }
}
