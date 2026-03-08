/**
 * useGameState.ts — Single Subscription Hook for the Game Page
 *
 * PROBLEM this solves:
 *   The game page needs ~12 pieces of state from useGameStore.
 *   Without this hook, you'd write 12 separate lines:
 *     const phase = useGameStore(s => s.phase)
 *     const score = useGameStore(s => s.score)
 *     ... 10 more
 *   Each line creates a separate React subscription = more re-render triggers.
 *
 * SOLUTION:
 *   Subscribe to all values at once using `useShallow`.
 *   React only re-renders the component when at least one value actually changed.
 *
 * useShallow explained:
 *   Normally, returning an object from a Zustand selector creates a NEW object
 *   reference on every store write, causing constant re-renders even if nothing
 *   you care about changed.
 *   `useShallow` does a shallow equality check: it compares each key's value
 *   individually and skips re-renders if nothing in the returned slice changed.
 *
 * TO ADD NEW STATE: add it to GameState interface + the selector object below.
 */

import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/lib/stores/useGameStore';
import type { BetDirection } from '@/types/game';

// TypeScript type for everything this hook returns.
// Uses `ReturnType<typeof useGameStore.getState>['field']` so if the store
// type ever changes, this interface automatically stays in sync.
export interface GameState {
  phase: ReturnType<typeof useGameStore.getState>['phase'];
  currentHand: ReturnType<typeof useGameStore.getState>['currentHand'];
  currentHandValue: ReturnType<typeof useGameStore.getState>['currentHandValue'];
  history: ReturnType<typeof useGameStore.getState>['history'];
  tileValueMap: ReturnType<typeof useGameStore.getState>['tileValueMap'];
  score: ReturnType<typeof useGameStore.getState>['score'];
  streak: ReturnType<typeof useGameStore.getState>['streak'];
  currentRound: ReturnType<typeof useGameStore.getState>['currentRound'];
  drawPile: ReturnType<typeof useGameStore.getState>['drawPile'];
  discardPile: ReturnType<typeof useGameStore.getState>['discardPile'];
  reshuffleCount: ReturnType<typeof useGameStore.getState>['reshuffleCount'];
  gameOverReason: ReturnType<typeof useGameStore.getState>['gameOverReason'];
  playerName: ReturnType<typeof useGameStore.getState>['playerName'];
  // Actions — the game page can call these to trigger state changes
  placeBet: (direction: BetDirection) => void;
  advanceToNextBet: () => void;
  startGame: () => void;
  setPlayerName: (name: string) => void;
}

/**
 * useGameState
 *
 * Call once at the top of the game page to get all state + actions.
 * Destructure what you need: const { phase, score, placeBet } = useGameState()
 */
export function useGameState(): GameState {
  return useGameStore(useShallow((s) => ({
    phase: s.phase,
    currentHand: s.currentHand,
    currentHandValue: s.currentHandValue,
    history: s.history,
    tileValueMap: s.tileValueMap,
    score: s.score,
    streak: s.streak,
    currentRound: s.currentRound,
    drawPile: s.drawPile,
    discardPile: s.discardPile,
    reshuffleCount: s.reshuffleCount,
    gameOverReason: s.gameOverReason,
    playerName: s.playerName,
    placeBet: s.placeBet,
    advanceToNextBet: s.advanceToNextBet,
    startGame: s.startGame,
    setPlayerName: s.setPlayerName,
  })));
}
