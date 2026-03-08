'use client';

import { motion } from 'motion/react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import type { BetDirection, GamePhase } from '@/types/game';

interface BetButtonProps {
  direction: BetDirection;
  canBet: boolean;
  onBet: (direction: BetDirection) => void;
}

function BetButton({ direction, canBet, onBet }: BetButtonProps) {
  const isHigher = direction === 'higher';
  const Icon = isHigher ? TrendingUp : TrendingDown;
  const label = isHigher ? 'Higher' : 'Lower';

  const activeStyle = isHigher
    ? {
        background: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
        color: '#0f172a',
        boxShadow: '0 4px 24px rgba(245,158,11,0.35)',
      }
    : {
        background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 50%, #818cf8 100%)',
        color: '#ffffff',
        boxShadow: '0 4px 24px rgba(99,102,241,0.35)',
      };

  const inactiveStyle = isHigher
    ? { background: 'rgba(245,158,11,0.2)', color: '#f59e0b' }
    : { background: 'rgba(99,102,241,0.2)', color: '#6366f1' };

  const overlayColor = isHigher ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.08)';

  return (
    <motion.button
      onClick={() => canBet && onBet(direction)}
      disabled={!canBet}
      whileHover={canBet ? { y: -3, scale: 1.03 } : {}}
      whileTap={canBet ? { scale: 0.97 } : {}}
      className="relative flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm tracking-widest uppercase disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-200 overflow-hidden"
      style={canBet ? activeStyle : inactiveStyle}
    >
      <Icon size={18} />
      {label}
      {canBet && (
        <motion.div
          className="absolute inset-0 opacity-0"
          whileHover={{ opacity: 1 }}
          style={{ background: overlayColor }}
        />
      )}
    </motion.button>
  );
}

interface BettingControlsProps {
  handValue: number;
  phase: GamePhase;
  onBet: (direction: BetDirection) => void;
}

export function BettingControls({ handValue, phase, onBet }: BettingControlsProps) {
  const canBet = phase === 'betting';

  return (
    <div className="flex flex-col items-center gap-5">
      <div className="text-center">
        <p className="text-xs tracking-[0.2em] uppercase opacity-50 mb-1">Current Hand Value</p>
        <motion.div key={handValue} className="animate-score-pop" initial={{ scale: 1 }}>
          <span
            className="text-5xl font-bold"
            style={{ color: '#c8a96e', fontFamily: 'var(--font-cinzel), serif' }}
          >
            {handValue}
          </span>
        </motion.div>
      </div>

      <div className="flex gap-4">
        <BetButton direction="higher" canBet={canBet} onBet={onBet} />
        <BetButton direction="lower" canBet={canBet} onBet={onBet} />
      </div>

      {!canBet && phase !== 'game_over' && (
        <p className="text-xs tracking-widest opacity-30 uppercase">
          {phase === 'dealing' ? 'Dealing...' : 'Revealing...'}
        </p>
      )}
    </div>
  );
}
