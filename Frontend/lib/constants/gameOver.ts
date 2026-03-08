/**
 * Single source of truth for game-over reason display properties.
 * Used by both GameOverScreen and LeaderboardTable so labels/colors stay in sync.
 * To add a new condition: add it to GameOverReason in types/game.ts, then add an entry here.
 */

import type { GameOverReason } from '@/types/game';

export interface GameOverConfig {
  title: string;
  description: string;
  icon: string;
  color: string;
  label: string; // short label used in the leaderboard table
}

export const GAME_OVER_CONFIG: Record<GameOverReason, GameOverConfig> = {
  tile_value_zero: {
    title: 'The Void Claims You',
    description: 'An honor tile has been drained of all value. The game is lost.',
    icon: '💀',
    color: '#ef4444',
    label: 'Value → 0',
  },
  tile_value_ten: {
    title: 'Overflowing Fortune',
    description: 'An honor tile has reached its peak. Fortune cannot be contained.',
    icon: '⚡',
    color: '#f59e0b',
    label: 'Value → 10',
  },
  reshuffle_limit: {
    title: 'The Deck Runs Dry',
    description: 'The tiles have been shuffled three times. Your run ends here.',
    icon: '🎴',
    color: '#6366f1',
    label: 'Deck Limit',
  },
};
