/**
 * usePhaseAutoAdvance.ts — Automatic Phase Transition Timer
 *
 * PROBLEM this solves:
 *   Two game phases need to auto-advance after a delay:
 *     'dealing'   → 'betting'   after 1500ms (tile flip animations finish)
 *     'revealing' → 'betting'   after 1800ms (win/loss result is shown long enough)
 *
 *   Before this hook, the game page had two near-identical useEffect blocks:
 *     useEffect(() => { if (phase === 'dealing') setTimeout(() => advance(), 1500) }, [phase])
 *     useEffect(() => { if (phase === 'revealing') setTimeout(() => advance(), 1800) }, [phase])
 *
 *   That's duplicated logic. If you want to change a delay, you need to find it.
 *
 * SOLUTION:
 *   One hook that looks up the current phase in PHASE_ADVANCE_DELAY.
 *   If there's a configured delay, it sets a timer. Otherwise it does nothing.
 *   All timing lives in constants/phases.ts — one place to change it.
 *
 * The useRef for the timer ID:
 *   We store the setTimeout return value in a ref (not state) because we don't
 *   want to trigger a re-render when we save it. We just need it so we can
 *   call clearTimeout() in the cleanup — preventing the timer from firing
 *   after the component unmounts or the phase changes before the timer fires.
 */

import { useEffect, useRef } from 'react';
import type { GamePhase } from '@/types/game';
import { PHASE_ADVANCE_DELAY } from '@/lib/constants/phases';

/**
 * usePhaseAutoAdvance
 *
 * @param phase   - The current game phase from the store
 * @param advance - The function to call when the timer fires (advanceToNextBet)
 *
 * Usage in game page:
 *   usePhaseAutoAdvance(phase, advanceToNextBet)
 *   ← one line replaces two useEffect blocks
 */
export function usePhaseAutoAdvance(
  phase: GamePhase,
  advance: () => void,
): void {
  // Ref holds the timer ID so cleanup can cancel it without causing re-renders
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Look up whether this phase has a configured auto-advance delay
    const delay = PHASE_ADVANCE_DELAY[phase];

    // If this phase doesn't auto-advance (e.g. 'betting', 'game_over'), do nothing
    if (delay === undefined) return;

    // Set the timer — after `delay` ms, move to the next phase
    timerRef.current = setTimeout(advance, delay);

    // Cleanup function: if the phase changes before the timer fires
    // (e.g. player loses connection, or component unmounts), cancel the timer.
    // Without this, `advance` could fire on a stale/wrong phase.
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, advance]); // re-runs every time the phase changes
}
