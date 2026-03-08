import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/lib/api/game';
import type { LeaderboardEntry } from '@/types/game';

/**
 * Fetches and caches the leaderboard.
 * Accepts optional server-fetched initialData to avoid a loading flash on first render.
 * Any code that calls invalidateQueries({ queryKey: ['leaderboard'] }) triggers a refetch.
 */
export function useLeaderboard(initialData?: LeaderboardEntry[]) {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    initialData,
    staleTime: 30_000,
  });
}
