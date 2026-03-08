import type { GamePhase } from '@/types/game';

// Phase flow: idle → dealing → betting → revealing → (loop back) or game_over

export const PHASE_LABELS: Record<GamePhase, string> = {
  idle: 'Idle',
  dealing: 'Dealing',
  betting: 'Your Turn',
  revealing: 'Revealing',
  game_over: 'Game Over',
};

export const PHASE_INDICATOR_COLOR: Record<GamePhase, string> = {
  idle: '#f59e0b',
  dealing: '#f59e0b',
  betting: '#22c55e',
  revealing: '#ef4444',
  game_over: '#ef4444',
};

// Phases not listed here require explicit user action (betting, game_over).
// Used by usePhaseAutoAdvance — change these numbers to adjust animation timing.
export const PHASE_ADVANCE_DELAY: Partial<Record<GamePhase, number>> = {
  dealing: 1500,
  revealing: 1800,
};
