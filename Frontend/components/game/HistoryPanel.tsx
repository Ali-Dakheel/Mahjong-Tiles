'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { BettingRound } from '@/types/game';
import { Tile } from './Tile';

interface HistoryPanelProps {
  history: BettingRound[];
  compact?: boolean;
}

function HistoryRow({ round, compact }: { round: BettingRound; compact: boolean }) {
  const isWin = round.outcome === 'win';
  const winColor = '#4ade80';
  const lossColor = '#f87171';
  const outcomeColor = isWin ? winColor : lossColor;

  return (
    <motion.div
      key={`round-${round.roundNumber}`}
      initial={{ x: -16, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 16, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="flex flex-col gap-2 rounded-xl px-3 py-3"
      style={{
        background: isWin ? 'rgba(34,197,94,0.06)' : 'rgba(239,68,68,0.06)',
        border: `1px solid ${isWin ? 'rgba(34,197,94,0.18)' : 'rgba(239,68,68,0.18)'}`,
      }}
    >
      {/* Header row: round # + outcome */}
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold tracking-widest opacity-30">
          ROUND {round.roundNumber}
        </span>
        <div className="flex items-center gap-1.5">
          {isWin && round.streakAtTime >= 2 && (
            <span className="text-[9px]" style={{ color: '#f59e0b' }}>🔥×{round.streakAtTime}</span>
          )}
          <span
            className="text-[11px] font-black px-2.5 py-0.5 rounded-lg tracking-wider"
            style={{
              background: isWin ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)',
              color: outcomeColor,
              border: `1px solid ${isWin ? 'rgba(34,197,94,0.4)' : 'rgba(239,68,68,0.4)'}`,
            }}
          >
            {isWin ? `+${round.pointsEarned}` : 'LOSS'}
          </span>
        </div>
      </div>

      {/* Hands: prev → bet → new */}
      <div className="flex items-center gap-2">
        {/* Previous hand */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex gap-0.5">
            {round.previousHand.slice(0, 4).map((tile) => (
              <Tile key={tile.id} tile={tile} revealed size="small" />
            ))}
          </div>
          <span className="text-[9px] tabular-nums opacity-30">= {round.previousHandValue}</span>
        </div>

        {/* Bet arrow */}
        <span className="text-lg font-black shrink-0" style={{ color: outcomeColor }}>
          {round.bet === 'higher' ? '↑' : '↓'}
        </span>

        {/* New hand */}
        <div className="flex flex-col items-center gap-1 flex-1">
          <div className="flex gap-0.5">
            {round.currentHand.slice(0, 4).map((tile) => (
              <Tile key={tile.id} tile={tile} revealed size="small" />
            ))}
          </div>
          <span className="text-[9px] tabular-nums opacity-30">= {round.currentHandValue}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function HistoryPanel({ history, compact = false }: HistoryPanelProps) {
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-24 opacity-20">
        <p className="text-xs tracking-widest uppercase">No rounds yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto flex-1 min-h-0 thin-scroll flex flex-col gap-2 pr-0.5">
      <AnimatePresence initial={false}>
        {history.map((round) => (
          <HistoryRow key={`round-${round.roundNumber}`} round={round} compact={compact} />
        ))}
      </AnimatePresence>
    </div>
  );
}
