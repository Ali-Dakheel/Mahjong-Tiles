import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/lib/api/game';
import type { LeaderboardEntry } from '@/types/game';

export function useLeaderboard(initialData?: LeaderboardEntry[]) {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: getLeaderboard,
    initialData,
    staleTime: 30_000,
  });
}
