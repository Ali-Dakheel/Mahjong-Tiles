import type { GamePhase } from '@/types/game';

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

/** ms to wait before calling advanceToNextBet */
export const PHASE_ADVANCE_DELAY: Partial<Record<GamePhase, number>> = {
  dealing: 1500,
  revealing: 1800,
};
