/**
 * lib/api/game.ts — Client-Side API Functions
 *
 * These are the functions that run IN THE BROWSER and make HTTP requests.
 * They talk to the Next.js BFF routes (/api/scores, /api/leaderboard),
 * NOT directly to Laravel.
 *
 * WHY go through Next.js instead of calling Laravel directly?
 *   The browser never needs to know Laravel's URL or port.
 *   LARAVEL_URL is a secret server-side env variable. If it were called from
 *   the browser, you'd have to expose it publicly. The Next.js routes act as
 *   a middleman (BFF = Backend for Frontend) that forwards requests securely.
 *
 * Axios is used here for:
 *   - Automatic JSON serialization/deserialization
 *   - Typed responses with generics
 *   - Consistent error handling
 */

import axios from 'axios';
import type { LeaderboardEntry } from '@/types/game';

// The shape of the body sent when saving a completed game score
export interface SaveScorePayload {
  player_name: string;
  score: number;
  rounds_played: number;
  game_over_reason: string; // 'tile_value_zero' | 'tile_value_ten' | 'reshuffle_limit'
}

/**
 * saveScore
 *
 * POSTs the end-of-game stats to our Next.js BFF route.
 * Next.js then forwards it to Laravel POST /api/v1/scores.
 *
 * Called by: GameOverScreen's TanStack mutation when the player clicks "Save".
 */
export async function saveScore(payload: SaveScorePayload): Promise<LeaderboardEntry> {
  const res = await axios.post<LeaderboardEntry>('/api/scores', payload);
  return res.data;
}

/**
 * getLeaderboard
 *
 * GETs the top 5 scores from our Next.js BFF route.
 * Next.js then fetches from Laravel GET /api/v1/leaderboard.
 *
 * The Laravel response wraps the array in { data: [...] } (API Resource format).
 * We unwrap it here (.data.data) so callers just get a plain array.
 *
 * Called by: useLeaderboard hook (via TanStack Query).
 */
export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await axios.get<{ data: LeaderboardEntry[] }>('/api/leaderboard');
  return res.data.data; // unwrap Laravel's { data: [...] } envelope
}
