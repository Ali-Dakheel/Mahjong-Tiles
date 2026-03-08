import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from '@/lib/stores/useGameStore';
import type { BetDirection } from '@/types/game';

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
  reshuffleCount: ReturnType<typeof useGameStore.getState>['reshuffleCount'];
  gameOverReason: ReturnType<typeof useGameStore.getState>['gameOverReason'];
  playerName: ReturnType<typeof useGameStore.getState>['playerName'];
  // Actions
  placeBet: (direction: BetDirection) => void;
  advanceToNextBet: () => void;
  startGame: () => void;
  setPlayerName: (name: string) => void;
}

/**
 * Single subscription point for all game state used by the game page.
 * Zustand re-renders only when the returned slice changes.
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
    reshuffleCount: s.reshuffleCount,
    gameOverReason: s.gameOverReason,
    playerName: s.playerName,
    placeBet: s.placeBet,
    advanceToNextBet: s.advanceToNextBet,
    startGame: s.startGame,
    setPlayerName: s.setPlayerName,
  })));
}
