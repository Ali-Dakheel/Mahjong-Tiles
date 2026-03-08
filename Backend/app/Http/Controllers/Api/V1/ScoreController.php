<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreScoreRequest;
use App\Http\Resources\ScoreResource;
use App\Services\ScoreService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

final class ScoreController extends Controller
{
    public function __construct(private readonly ScoreService $scoreService) {}

    public function store(StoreScoreRequest $request): ScoreResource
    {
        $score = $this->scoreService->store($request);

        return new ScoreResource($score);
    }

    public function leaderboard(): AnonymousResourceCollection
    {
        $scores = $this->scoreService->leaderboard();

        return ScoreResource::collection($scores);
    }
}
