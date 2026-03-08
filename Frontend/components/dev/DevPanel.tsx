'use client';

import { useState } from 'react';
import { useGameStore } from '@/lib/stores/useGameStore';
import type { BettingRound } from '@/types/game';

/**
 * Developer panel — only rendered in development.
 * Lets you simulate wins, losses, tile danger, and all 3 game-over scenarios
 * without having to play through full rounds.
 */
export function DevPanel() {
  const [open, setOpen] = useState(false);
  const phase = useGameStore((s) => s.phase);
  const active = phase !== 'idle' && phase !== 'game_over';

  function simulateRound(outcome: 'win' | 'loss') {
    const s = useGameStore.getState();
    if (s.phase !== 'betting') return;

    const newStreak = outcome === 'win' ? s.streak + 1 : 0;
    const pointsEarned = outcome === 'win' ? 100 + Math.max(0, s.streak) * 25 : 0;

    const round: BettingRound = {
      roundNumber: s.currentRound,
      previousHand: s.currentHand,
      previousHandValue: s.currentHandValue,
      currentHand: s.currentHand,
      currentHandValue:
        outcome === 'win'
          ? s.currentHandValue + 3
          : s.currentHandValue - 3,
      bet: outcome === 'win' ? 'higher' : 'lower',
      outcome,
      pointsEarned,
      streakAtTime: newStreak,
    };

    useGameStore.setState({
      phase: 'revealing',
      history: [round, ...s.history],
      streak: newStreak,
      score: s.score + pointsEarned,
      currentRound: s.currentRound + 1,
    });
  }

  function setStreak(n: number) {
    useGameStore.setState({ streak: n });
  }

  function pushTilesDanger() {
    useGameStore.setState((s) => ({
      tileValueMap: {
        ...s.tileValueMap,
        dragon_red: 9,
        wind_east: 2,
      },
    }));
  }

  function forceGameOver(reason: 'tile_value_zero' | 'tile_value_ten' | 'reshuffle_limit') {
    const s = useGameStore.getState();
    useGameStore.setState({
      phase: 'game_over',
      gameOverReason: reason,
      currentRound: s.currentRound,
    });
  }

  const btnBase =
    'px-2.5 py-1.5 rounded text-[10px] font-semibold tracking-wider uppercase transition-opacity disabled:opacity-30 disabled:cursor-not-allowed';

  return (
    <div
      className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2"
      style={{ fontFamily: 'monospace' }}
    >
      {open && (
        <div
          className="rounded-xl p-3 flex flex-col gap-2 w-52"
          style={{
            background: 'rgba(10,15,28,0.95)',
            border: '1px solid rgba(239,68,68,0.4)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: '#ef4444' }}>
            ⚠ Dev Panel
          </p>

          {/* Simulate round outcomes — only available during betting */}
          <div className="flex flex-col gap-1">
            <p className="text-[8px] tracking-widest uppercase opacity-40">Simulate Round</p>
            <div className="flex gap-1.5">
              <button
                className={btnBase}
                style={{ background: 'rgba(34,197,94,0.2)', color: '#4ade80' }}
                disabled={phase !== 'betting'}
                onClick={() => simulateRound('win')}
              >
                ✓ Win
              </button>
              <button
                className={btnBase}
                style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171' }}
                disabled={phase !== 'betting'}
                onClick={() => simulateRound('loss')}
              >
                ✗ Loss
              </button>
            </div>
            {phase !== 'betting' && (
              <p className="text-[8px] opacity-30">Only during betting phase</p>
            )}
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Streak */}
          <div className="flex flex-col gap-1">
            <p className="text-[8px] tracking-widest uppercase opacity-40">Set Streak</p>
            <div className="flex gap-1.5 flex-wrap">
              {[0, 3, 5, 10].map((n) => (
                <button
                  key={n}
                  className={btnBase}
                  style={{ background: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}
                  disabled={!active}
                  onClick={() => setStreak(n)}
                >
                  ×{n}
                </button>
              ))}
            </div>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Tile values */}
          <div className="flex flex-col gap-1">
            <p className="text-[8px] tracking-widest uppercase opacity-40">Tile Values</p>
            <button
              className={btnBase + ' text-left'}
              style={{ background: 'rgba(239,68,68,0.15)', color: '#fca5a5' }}
              disabled={!active}
              onClick={pushTilesDanger}
            >
              Push to danger (🀄→9, 🀀→2)
            </button>
          </div>

          <div className="h-px" style={{ background: 'rgba(255,255,255,0.08)' }} />

          {/* Force game over */}
          <div className="flex flex-col gap-1">
            <p className="text-[8px] tracking-widest uppercase opacity-40">Force Game Over</p>
            <button
              className={btnBase + ' text-left'}
              style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171' }}
              disabled={!active}
              onClick={() => forceGameOver('tile_value_zero')}
            >
              💀 Tile → 0
            </button>
            <button
              className={btnBase + ' text-left'}
              style={{ background: 'rgba(245,158,11,0.12)', color: '#fbbf24' }}
              disabled={!active}
              onClick={() => forceGameOver('tile_value_ten')}
            >
              ⚡ Tile → 10
            </button>
            <button
              className={btnBase + ' text-left'}
              style={{ background: 'rgba(99,102,241,0.12)', color: '#a5b4fc' }}
              disabled={!active}
              onClick={() => forceGameOver('reshuffle_limit')}
            >
              🎴 Deck Limit
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase"
        style={{
          background: open ? 'rgba(239,68,68,0.3)' : 'rgba(239,68,68,0.15)',
          border: '1px solid rgba(239,68,68,0.4)',
          color: '#f87171',
        }}
      >
        {open ? '✕ Dev' : '⚙ Dev'}
      </button>
    </div>
  );
}
