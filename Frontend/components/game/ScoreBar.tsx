'use client';

import { motion, AnimatePresence } from 'motion/react';
import { Flame, Layers, RotateCcw, Trash2 } from 'lucide-react';

interface ScoreBarProps {
  score: number;
  streak: number;
  round: number;
  drawPileCount: number;
  discardPileCount: number;
  reshuffleCount: number;
}

function StatPill({
  icon,
  label,
  value,
  highlight,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 px-4 py-2 rounded-lg"
      style={{
        background: highlight
          ? 'rgba(245, 158, 11, 0.12)'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${highlight ? 'rgba(245,158,11,0.25)' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      <span style={{ color: highlight ? '#f59e0b' : '#c8a96e' }}>{icon}</span>
      <div className="flex flex-col leading-none">
        <span className="text-[9px] tracking-widest uppercase opacity-40">{label}</span>
        <span
          className="text-base font-bold leading-tight"
          style={{ color: highlight ? '#f59e0b' : '#f8f4e8' }}
        >
          {value}
        </span>
      </div>
    </div>
  );
}

export function ScoreBar({ score, streak, round, drawPileCount, discardPileCount, reshuffleCount }: ScoreBarProps) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap">
      {/* Score */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] tracking-[0.25em] uppercase opacity-40">Score</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={score}
            initial={{ y: -12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 12, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="text-2xl font-bold text-shimmer"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            {score.toLocaleString()}
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2">
        {/* Streak */}
        <StatPill
          icon={<Flame size={14} />}
          label="Streak"
          value={
            <span className="flex items-center gap-1">
              {streak}
              {streak >= 3 && <span className="text-xs">🔥</span>}
            </span>
          }
          highlight={streak >= 3}
        />

        {/* Round */}
        <StatPill icon={<RotateCcw size={13} />} label="Round" value={round} />

        {/* Draw pile */}
        <StatPill
          icon={<Layers size={13} />}
          label="Draw"
          value={
            <span className={drawPileCount < 8 ? 'text-amber-400' : ''}>
              {drawPileCount}
            </span>
          }
          highlight={drawPileCount < 8}
        />

        {/* Discard pile */}
        <StatPill
          icon={<Trash2 size={13} />}
          label="Discard"
          value={discardPileCount}
        />

        {/* Reshuffle counter */}
        {reshuffleCount > 0 && (
          <div
            className="px-2.5 py-1.5 rounded-lg text-xs tracking-wider"
            style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.2)',
              color: '#f87171',
            }}
          >
            ↺ {reshuffleCount}/3
          </div>
        )}
      </div>
    </div>
  );
}
