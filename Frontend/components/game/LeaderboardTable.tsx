'use client';

import { Trophy } from 'lucide-react';
import { useLeaderboard } from '@/lib/hooks/useLeaderboard';
import { GAME_OVER_CONFIG } from '@/lib/constants/gameOver';
import type { LeaderboardEntry } from '@/types/game';

const RANK_COLORS = ['#f59e0b', '#94a3b8', '#b45309'];
const GRID_COLS = '32px 1fr 80px 64px 80px';

interface LeaderboardTableProps {
  initialData?: LeaderboardEntry[];
}

export function LeaderboardTable({ initialData }: LeaderboardTableProps) {
  const { data: entries = initialData ?? [], isLoading } = useLeaderboard(initialData);
  const top5 = entries.slice(0, 5);

  if (isLoading && !initialData) {
    return (
      <div className="flex items-center justify-center h-20 opacity-30">
        <p className="text-xs tracking-widest uppercase animate-pulse">Loading leaderboard...</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex items-center justify-center h-20 opacity-20">
        <p className="text-xs tracking-widest uppercase">No scores yet — be the first!</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(200,169,110,0.2)' }}>
      {/* Header */}
      <div
        className="grid text-[9px] tracking-[0.2em] uppercase py-2 px-3"
        style={{
          gridTemplateColumns: GRID_COLS,
          background: 'rgba(200,169,110,0.08)',
          color: 'rgba(200,169,110,0.6)',
          borderBottom: '1px solid rgba(200,169,110,0.12)',
        }}
      >
        <span>#</span>
        <span>Player</span>
        <span className="text-right">Score</span>
        <span className="text-right">Rounds</span>
        <span className="text-right">Ended By</span>
      </div>

      {/* Rows */}
      {top5.map((entry, index) => {
        const rankColor = RANK_COLORS[index] ?? 'rgba(248,244,232,0.5)';
        const isTop3 = index < 3;
        const reasonLabel =
          GAME_OVER_CONFIG[entry.game_over_reason as keyof typeof GAME_OVER_CONFIG]?.label
          ?? entry.game_over_reason;

        return (
          <div
            key={entry.id ?? index}
            className="grid items-center py-2.5 px-3 text-sm transition-colors"
            style={{
              gridTemplateColumns: GRID_COLS,
              background: isTop3 ? `rgba(200,169,110,${0.04 - index * 0.01})` : 'transparent',
              borderBottom: index < top5.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            }}
          >
            <span className="font-bold text-xs flex items-center gap-1">
              {isTop3 ? (
                <Trophy size={12} style={{ color: rankColor }} />
              ) : (
                <span style={{ color: 'rgba(248,244,232,0.25)' }}>{index + 1}</span>
              )}
            </span>

            <span
              className="font-medium truncate"
              style={{ color: isTop3 ? '#f8f4e8' : 'rgba(248,244,232,0.7)' }}
            >
              {entry.player_name}
            </span>

            <span className="text-right font-bold tabular-nums" style={{ color: rankColor }}>
              {entry.score.toLocaleString()}
            </span>

            <span className="text-right text-xs tabular-nums" style={{ color: 'rgba(248,244,232,0.4)' }}>
              {entry.rounds_played}
            </span>

            <span className="text-right text-[10px] tracking-wide" style={{ color: 'rgba(248,244,232,0.35)' }}>
              {reasonLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}
