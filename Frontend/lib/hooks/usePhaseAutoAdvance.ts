import { useEffect, useRef } from 'react';
import type { GamePhase } from '@/types/game';
import { PHASE_ADVANCE_DELAY } from '@/lib/constants/phases';

/**
 * Automatically calls `advance` after the configured delay whenever the phase
 * has a defined entry in PHASE_ADVANCE_DELAY (i.e. 'dealing' and 'revealing').
 */
export function usePhaseAutoAdvance(
  phase: GamePhase,
  advance: () => void,
): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const delay = PHASE_ADVANCE_DELAY[phase];
    if (delay === undefined) return;

    timerRef.current = setTimeout(advance, delay);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, advance]);
}
