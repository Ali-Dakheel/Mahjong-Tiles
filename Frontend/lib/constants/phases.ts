/**
 * constants/phases.ts — Phase Configuration
 *
 * Single source of truth for everything related to game phases.
 *
 * WHY centralise this?
 *   Before this file existed, phase labels and delays were scattered across
 *   components and useEffect hooks. Changing a delay meant hunting it down.
 *   Now: change the number here, everything that uses it updates automatically.
 *
 * Game phase flow:
 *   idle → dealing → betting → revealing → (loop) or game_over
 *
 *   idle:       Before the game starts. Player is on the landing page.
 *   dealing:    Tiles are animating in face-down. Player cannot bet yet.
 *               Auto-advances to 'betting' after 1500ms.
 *   betting:    Tiles are face-up. Higher/Lower buttons are enabled.
 *               Waits indefinitely for the player's click.
 *   revealing:  Player has bet. New hand is being shown. Win/loss flash plays.
 *               Auto-advances to 'betting' (next round) after 1800ms.
 *               OR transitions to 'game_over' if a game-over condition was met.
 *   game_over:  Game over overlay is shown. No auto-advance.
 */

import type { GamePhase } from '@/types/game';

/** Human-readable labels shown in the phase indicator dot in the header. */
export const PHASE_LABELS: Record<GamePhase, string> = {
  idle: 'Idle',
  dealing: 'Dealing',
  betting: 'Your Turn',
  revealing: 'Revealing',
  game_over: 'Game Over',
};

/** Colour of the phase indicator dot. Green = your turn, red = action happening. */
export const PHASE_INDICATOR_COLOR: Record<GamePhase, string> = {
  idle: '#f59e0b',
  dealing: '#f59e0b',
  betting: '#22c55e',   // green = it's your turn
  revealing: '#ef4444', // red = processing
  game_over: '#ef4444',
};

/**
 * How long to wait (ms) before auto-advancing to the next phase.
 * Only phases that auto-advance have an entry here.
 * 'betting' and 'game_over' have no entry — they wait for user action.
 *
 * Used by: usePhaseAutoAdvance hook
 *
 * TO CHANGE ANIMATION TIMING: edit the numbers here.
 */
export const PHASE_ADVANCE_DELAY: Partial<Record<GamePhase, number>> = {
  dealing: 1500,   // tile flip animations take ~550ms × 4 tiles = ~2.2s staggered,
                   // but the phase advances at 1500ms — early enough to feel snappy
  revealing: 1800, // win/loss flash stays visible for 1.8 seconds before next round
};
