'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { BettingRound } from '@/types/game';
import { Tile } from './Tile';

interface HistoryPanelProps {
  history: BettingRound[];
}

function OutcomeChip({ outcome, points }: { outcome: 'win' | 'loss'; points: number }) {
  const isWin = outcome === 'win';
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wider"
      style={{
        background: isWin ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
        color: isWin ? '#4ade80' : '#f87171',
        border: `1px solid ${isWin ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
      }}
    >
      {isWin ? `+${points}` : 'LOSS'}
    </span>
  );
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 opacity-20">
        <p className="text-xs tracking-widest uppercase">No rounds yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-64 thin-scroll flex flex-col gap-1.5 pr-0.5">
      <AnimatePresence initial={false}>
        {history.map((round) => (
          <motion.div
            key={`round-${round.roundNumber}`}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -20, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg"
            style={{
              background: round.outcome === 'win'
                ? 'rgba(34,197,94,0.05)'
                : 'rgba(239,68,68,0.05)',
              border: `1px solid ${round.outcome === 'win' ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)'}`,
            }}
          >
            {/* Round number */}
            <span
              className="text-[9px] w-5 text-center font-bold opacity-30 shrink-0"
            >
              {round.roundNumber}
            </span>

            {/* Mini tiles */}
            <div className="flex gap-0.5 shrink-0">
              {round.currentHand.slice(0, 4).map((tile) => (
                <Tile key={tile.id} tile={tile} revealed size="small" />
              ))}
            </div>

            {/* Value */}
            <span className="text-xs opacity-50 tabular-nums shrink-0">
              = {round.currentHandValue}
            </span>

            {/* Bet direction */}
            <span
              className="text-[10px] tracking-wider uppercase opacity-40 shrink-0 ml-auto"
            >
              {round.bet === 'higher' ? '↑' : '↓'}
            </span>

            {/* Outcome */}
            <OutcomeChip outcome={round.outcome} points={round.pointsEarned} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
