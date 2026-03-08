/**
 * useLeaderboard.ts — Leaderboard Data Fetching Hook
 *
 * Wraps TanStack Query (React Query) to fetch and cache the leaderboard.
 *
 * WHY a custom hook instead of calling useQuery directly in the component?
 *   Keeps the component "dumb" — it just renders data, not fetches it.
 *   If we ever change the data source, we change it here, not in every component.
 *
 * How TanStack Query works here:
 *   - `queryKey: ['leaderboard']` — the cache key. Any other code that calls
 *     queryClient.invalidateQueries({ queryKey: ['leaderboard'] }) will trigger
 *     a refetch. GameOverScreen does this after saving a score, so the leaderboard
 *     updates automatically when a new score is submitted.
 *
 *   - `queryFn: getLeaderboard` — the actual fetch function (calls /api/leaderboard)
 *
 *   - `initialData` — if the landing page fetched the leaderboard on the server
 *     (Next.js server component), we can pass that data here so it's shown instantly
 *     without a loading spinner on first paint.
 *
 *   - `staleTime: 30_000` — the fetched data is considered "fresh" for 30 seconds.
 *     Within that window, switching tabs and back won't re-fetch unnecessarily.
 */

import { useQuery } from '@tanstack/react-query';
import { getLeaderboard } from '@/lib/api/game';
import type { LeaderboardEntry } from '@/types/game';

/**
 * useLeaderboard
 *
 * @param initialData - Optional server-fetched data to show immediately (avoids loading flash)
 * @returns           - { data: LeaderboardEntry[], isLoading: boolean, isError: boolean }
 */
export function useLeaderboard(initialData?: LeaderboardEntry[]) {
  return useQuery({
    queryKey: ['leaderboard'],   // cache key — used by invalidateQueries after score save
    queryFn: getLeaderboard,     // fetches GET /api/leaderboard
    initialData,                 // pre-populate from server if available
    staleTime: 30_000,           // don't refetch more than once per 30 seconds
  });
}
