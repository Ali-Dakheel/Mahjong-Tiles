/**
 * useGameStore.ts — The Game's Single Source of Truth
 *
 * This is a Zustand store. Think of it as a global object that every component
 * can read from AND write to — and React automatically re-renders only the
 * components that read values that actually changed.
 *
 * WHY Zustand over Redux?
 *   No boilerplate. No actions/reducers/dispatchers.
 *   You just call `set({ score: 500 })` and it's done.
 *   `useShallow` (in useGameState.ts) gives the same performance as Redux selectors.
 *
 * ARCHITECTURE RULE: Components never contain game logic.
 *   All calculations (hand value, win/loss, scaling, game-over check) happen here
 *   by calling pure functions from tile-engine.ts.
 *   Components just read state and call actions.
 */

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

// ─── State Shape ──────────────────────────────────────────────────────────────
// Everything the game needs to remember between renders.
interface GameState {
  phase: GamePhase;              // Current stage: idle | dealing | betting | revealing | game_over
  drawPile: Tile[];              // Tiles left to deal from (face-down deck)
  discardPile: Tile[];           // Tiles already played (used during reshuffle)
  currentHand: Tile[];           // The 4 tiles currently shown on the board
  previousHand: Tile[] | null;   // The 4 tiles from the round before (shown faded above)
  currentHandValue: number;      // Sum of currentHand's tile values
  previousHandValue: number;     // Sum of previousHand's tile values (for comparison display)
  history: BettingRound[];       // All completed rounds, newest first [round3, round2, round1]
  tileValueMap: TileValueMap;    // Current dynamic values for all 7 honor tiles
  reshuffleCount: number;        // How many times the draw pile has run out (max 3)
  currentRound: number;          // Round number displayed in the score bar
  score: number;                 // Player's accumulated score
  streak: number;                // Current consecutive wins (resets on any loss)
  playerBet: BetDirection | null;// The bet placed this round ('higher' | 'lower' | null)
  gameOverReason: GameOverReason | null; // Why the game ended, or null if still going
  playerName: string;            // Entered on the landing page, used for leaderboard
  animating: boolean;            // True while tile flip animation is playing
}

// ─── Actions ──────────────────────────────────────────────────────────────────
// These are the functions components can call to change state.
interface GameActions {
  setPlayerName: (name: string) => void;
  startGame: () => void;
  placeBet: (direction: BetDirection) => void;
  advanceToNextBet: () => void;
  setAnimating: (animating: boolean) => void;
  resetGame: () => void;
}

// The reset state — used both on first load and when starting a new game.
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

  /**
   * setPlayerName
   * Just saves the name the player typed on the landing page.
   * Used when submitting the score to the leaderboard.
   */
  setPlayerName: (name) => set({ playerName: name }),

  /**
   * startGame
   *
   * Resets everything and deals the very first hand.
   * Called when the player clicks "Start Game" on the landing page.
   *
   * Steps:
   *  1. Build a fresh 136-tile deck
   *  2. Shuffle it randomly
   *  3. Deal 4 tiles as the first hand
   *  4. Calculate their starting value using the fresh honor tile map
   *  5. Set phase to 'dealing' — the tile flip animation will play,
   *     then usePhaseAutoAdvance will move to 'betting' after 1500ms
   */
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

  /**
   * placeBet
   *
   * The core game action. Called when the player clicks "Higher" or "Lower".
   * This is the most complex function — here's the exact sequence:
   *
   *  1. Immediately set phase → 'revealing' so the animation starts right away.
   *
   *  2. After 50ms (just enough for React to paint that phase change):
   *     a. Reshuffle if the draw pile has fewer than 4 tiles left
   *     b. Deal 4 new tiles from the top of the draw pile
   *     c. Calculate the new hand's total value
   *     d. Compare to the old hand: did it go the direction you bet?
   *     e. Update score and streak
   *     f. Apply value scaling to the NEW hand's honor tiles (±1)
   *     g. Check all three game-over conditions
   *     h. Save the completed round to history
   *     i. If game over → phase = 'game_over', else → phase = 'revealing'
   *        (usePhaseAutoAdvance will then advance to 'betting' after 1800ms)
   *
   * The 50ms delay is intentional — without it, React would try to process
   * the animation AND the state update in the same frame, and the animation
   * would appear to skip.
   */
  placeBet: (direction) => {
    const state = get();
    if (state.phase !== 'betting') return; // guard: ignore if not in betting phase

    // Immediately flip to revealing so animation starts
    set({ playerBet: direction, phase: 'revealing', animating: true });

    // Resolve the round after a short delay to let the animation frame fire
    setTimeout(() => {
      const s = get();
      let { drawPile, discardPile, reshuffleCount } = s;

      // ── Step A: Reshuffle if not enough tiles ───────────────────────────
      // Per spec: "When the Draw Pile is empty, add a fresh deck, combine
      // with Discard Pile, and shuffle into a new Draw Pile."
      if (drawPile.length < 4) {
        const freshDeck = shuffle([...buildFullDeck(), ...discardPile]);
        drawPile = freshDeck;
        discardPile = [];
        reshuffleCount += 1; // track how many times we've done this (max 3)
      }

      // ── Step B: Deal 4 new tiles ────────────────────────────────────────
      const { hand: nextHand, remaining } = dealHand(drawPile, 4);

      // ── Step C: Calculate new hand value ────────────────────────────────
      // Use the CURRENT value map (before scaling). Scaling happens AFTER.
      const nextHandValue = calcHandValue(nextHand, s.tileValueMap);

      // ── Step D: Was the bet correct? ─────────────────────────────────────
      const previousValue = s.currentHandValue;
      const isWin =
        direction === 'higher'
          ? nextHandValue > previousValue   // bet higher, new hand IS higher → win
          : nextHandValue < previousValue;  // bet lower,  new hand IS lower  → win
      const outcome = isWin ? 'win' : 'loss';

      // ── Step E: Update score and streak ─────────────────────────────────
      // Scoring formula: 100 base + 25 per extra win in the streak
      // Streak 1 = 100pts, Streak 2 = 125pts, Streak 3 = 150pts, etc.
      const newStreak = isWin ? s.streak + 1 : 0; // loss resets streak to 0
      const pointsEarned = isWin ? 100 + Math.max(0, newStreak - 1) * 25 : 0;
      const newScore = s.score + pointsEarned;

      // ── Step F: Apply value scaling to the new hand's honor tiles ────────
      const newValueMap = applyValueScaling(s.tileValueMap, nextHand, outcome);

      // ── Step G: Check if the game should end ─────────────────────────────
      const gameOverReason = checkGameOver(newValueMap, reshuffleCount);

      // ── Step H: Record this round in history ─────────────────────────────
      const round: BettingRound = {
        roundNumber: s.currentRound,
        previousHand: s.currentHand,       // the hand you WERE looking at
        previousHandValue: previousValue,
        currentHand: nextHand,             // the new hand just revealed
        currentHandValue: nextHandValue,
        bet: direction,
        outcome,
        pointsEarned,
        streakAtTime: newStreak,
      };

      // ── Step I: Commit all changes in one atomic set() call ──────────────
      set({
        drawPile: remaining,
        discardPile: [...discardPile, ...s.currentHand], // old hand goes to discard
        previousHand: s.currentHand,
        previousHandValue: previousValue,
        currentHand: nextHand,
        currentHandValue: nextHandValue,
        tileValueMap: newValueMap,
        reshuffleCount,
        history: [round, ...s.history], // newest round at the front
        score: newScore,
        streak: newStreak,
        // If game over, stay on 'game_over'. Otherwise 'revealing' plays
        // the result animation, then usePhaseAutoAdvance advances to 'betting'.
        phase: gameOverReason ? 'game_over' : 'revealing',
        gameOverReason: gameOverReason ?? null,
        currentRound: s.currentRound + 1,
        animating: true,
      });
    }, 50);
  },

  /**
   * advanceToNextBet
   *
   * Called automatically by usePhaseAutoAdvance after the reveal animation
   * has played for 1800ms. Transitions the game back to 'betting' so the
   * player can place their next bet with the new hand visible.
   *
   * Guards against being called during game_over (the overlay is showing).
   */
  advanceToNextBet: () => {
    const state = get();
    if (state.phase === 'game_over') return;
    set({ phase: 'betting', animating: false });
  },

  /** Internal flag used to disable betting buttons during animations. */
  setAnimating: (animating) => set({ animating }),

  /** Full reset — used when navigating away without starting over properly. */
  resetGame: () => set({ ...initialState }),
}));
