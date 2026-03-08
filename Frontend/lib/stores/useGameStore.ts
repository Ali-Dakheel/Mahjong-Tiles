'use client';

import { create } from 'zustand';
import type {
  BetDirection,
  BettingRound,
  GameOverReason,
  GamePhase,
  Tile,
  TileValueMap,
} from '@/types/game';
import {
  applyValueScaling,
  buildFullDeck,
  calcHandValue,
  checkGameOver,
  dealHand,
  getInitialValueMap,
  shuffle,
} from '@/lib/engine/tile-engine';

interface GameState {
  phase: GamePhase;
  drawPile: Tile[];
  discardPile: Tile[];
  currentHand: Tile[];
  previousHand: Tile[] | null;
  currentHandValue: number;
  previousHandValue: number;
  history: BettingRound[];
  tileValueMap: TileValueMap;
  reshuffleCount: number;
  currentRound: number;
  score: number;
  streak: number;
  playerBet: BetDirection | null;
  gameOverReason: GameOverReason | null;
  playerName: string;
  animating: boolean;
}

interface GameActions {
  setPlayerName: (name: string) => void;
  startGame: () => void;
  placeBet: (direction: BetDirection) => void;
  advanceToNextBet: () => void;
  setAnimating: (animating: boolean) => void;
  resetGame: () => void;
}

const initialState: GameState = {
  phase: 'idle',
  drawPile: [],
  discardPile: [],
  currentHand: [],
  previousHand: null,
  currentHandValue: 0,
  previousHandValue: 0,
  history: [],
  tileValueMap: getInitialValueMap(),
  reshuffleCount: 0,
  currentRound: 0,
  score: 0,
  streak: 0,
  playerBet: null,
  gameOverReason: null,
  playerName: '',
  animating: false,
};

export const useGameStore = create<GameState & GameActions>()((set, get) => ({
  ...initialState,

  setPlayerName: (name) => set({ playerName: name }),

  startGame: () => {
    const deck = shuffle(buildFullDeck());
    const { hand, remaining } = dealHand(deck, 4);
    const valueMap = getInitialValueMap();

    set({
      phase: 'dealing',
      drawPile: remaining,
      discardPile: [],
      currentHand: hand,
      previousHand: null,
      currentHandValue: calcHandValue(hand, valueMap),
      previousHandValue: 0,
      history: [],
      tileValueMap: valueMap,
      reshuffleCount: 0,
      currentRound: 1,
      score: 0,
      streak: 0,
      playerBet: null,
      gameOverReason: null,
      animating: true,
    });
  },

  placeBet: (direction) => {
    const state = get();
    if (state.phase !== 'betting') return;

    set({ playerBet: direction, phase: 'revealing', animating: true });

    // Resolve the round after a short delay to allow animation to start
    setTimeout(() => {
      const s = get();
      let { drawPile, discardPile, reshuffleCount } = s;

      // Reshuffle if needed
      if (drawPile.length < 4) {
        const freshDeck = shuffle([...buildFullDeck(), ...discardPile]);
        drawPile = freshDeck;
        discardPile = [];
        reshuffleCount += 1;
      }

      const { hand: nextHand, remaining } = dealHand(drawPile, 4);
      const nextHandValue = calcHandValue(nextHand, s.tileValueMap);

      const previousValue = s.currentHandValue;
      const isWin =
        direction === 'higher'
          ? nextHandValue > previousValue
          : nextHandValue < previousValue;
      const outcome = isWin ? 'win' : 'loss';

      const newStreak = isWin ? s.streak + 1 : 0;
      const pointsEarned = isWin ? 100 + Math.max(0, newStreak - 1) * 25 : 0;
      const newScore = s.score + pointsEarned;

      const newValueMap = applyValueScaling(s.tileValueMap, nextHand, outcome);

      const round: BettingRound = {
        roundNumber: s.currentRound,
        previousHand: s.currentHand,
        previousHandValue: previousValue,
        currentHand: nextHand,
        currentHandValue: nextHandValue,
        bet: direction,
        outcome,
        pointsEarned,
        streakAtTime: newStreak,
      };

      const gameOverReason = checkGameOver(newValueMap, reshuffleCount);

      set({
        drawPile: remaining,
        discardPile: [...discardPile, ...s.currentHand],
        previousHand: s.currentHand,
        previousHandValue: previousValue,
        currentHand: nextHand,
        currentHandValue: nextHandValue,
        tileValueMap: newValueMap,
        reshuffleCount,
        history: [round, ...s.history],
        score: newScore,
        streak: newStreak,
        phase: gameOverReason ? 'game_over' : 'revealing',
        gameOverReason: gameOverReason ?? null,
        currentRound: s.currentRound + 1,
        animating: true,
      });
    }, 50);
  },

  advanceToNextBet: () => {
    const state = get();
    if (state.phase === 'game_over') return;
    set({ phase: 'betting', animating: false });
  },

  setAnimating: (animating) => set({ animating }),

  resetGame: () => set({ ...initialState }),
}));
