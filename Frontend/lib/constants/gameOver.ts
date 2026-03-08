/**
 * constants/gameOver.ts — Game Over Reason Configuration
 *
 * Single source of truth for ALL display properties of each game-over reason.
 *
 * WHY centralise this?
 *   Both GameOverScreen and LeaderboardTable need to display the same reason
 *   with the same label/color/icon. Before this file, each component had its
 *   own copy of that data — a maintenance problem.
 *   Now: change a label here, both components update automatically.
 *
 * The three game-over conditions (per spec):
 *   tile_value_zero  — an honor tile's dynamic value hit 0 (too many losses)
 *   tile_value_ten   — an honor tile's dynamic value hit 10 (too many wins with it)
 *   reshuffle_limit  — the draw pile ran out 3 times (natural survival end)
 *
 * TO ADD A NEW GAME-OVER CONDITION:
 *   1. Add the new key to GameOverReason in types/game.ts
 *   2. Add a matching entry here
 *   3. Handle it in checkGameOver() in tile-engine.ts
 *   The UI (GameOverScreen, LeaderboardTable) picks it up automatically.
 */

import type { GameOverReason } from '@/types/game';

export interface GameOverConfig {
  title: string;       // Large heading shown on the game-over overlay
  description: string; // Subtitle explaining what happened
  icon: string;        // Emoji shown above the title
  color: string;       // Accent color for borders, text highlights
  label: string;       // Short label used in leaderboard table
}

export const GAME_OVER_CONFIG: Record<GameOverReason, GameOverConfig> = {
  tile_value_zero: {
    title: 'The Void Claims You',
    description: 'An honor tile has been drained of all value. The game is lost.',
    icon: '💀',
    color: '#ef4444',  // red
    label: 'Value → 0',
  },
  tile_value_ten: {
    title: 'Overflowing Fortune',
    description: 'An honor tile has reached its peak. Fortune cannot be contained.',
    icon: '⚡',
    color: '#f59e0b',  // amber/gold
    label: 'Value → 10',
  },
  reshuffle_limit: {
    title: 'The Deck Runs Dry',
    description: 'The tiles have been shuffled three times. Your run ends here.',
    icon: '🎴',
    color: '#6366f1',  // indigo
    label: 'Deck Limit',
  },
};
