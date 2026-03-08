<?php

declare(strict_types=1);

namespace App\Services;

use App\Http\Requests\StoreScoreRequest;
use App\Models\Score;
use Illuminate\Database\Eloquent\Collection;

final class ScoreService
{
    public function store(StoreScoreRequest $request): Score
    {
        return Score::query()->create($request->validated());
    }

    /** @return Collection<int, Score> */
    public function leaderboard(int $limit = 5): Collection
    {
        return Score::query()
            ->orderByDesc('score')
            ->limit($limit)
            ->get();
    }
}
