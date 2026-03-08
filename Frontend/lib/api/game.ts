import axios from 'axios';
import type { LeaderboardEntry } from '@/types/game';

export interface SaveScorePayload {
  player_name: string;
  score: number;
  rounds_played: number;
  game_over_reason: string;
}

export async function saveScore(payload: SaveScorePayload): Promise<LeaderboardEntry> {
  const res = await axios.post<LeaderboardEntry>('/api/scores', payload);
  return res.data;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const res = await axios.get<{ data: LeaderboardEntry[] }>('/api/leaderboard');
  return res.data.data;
}
