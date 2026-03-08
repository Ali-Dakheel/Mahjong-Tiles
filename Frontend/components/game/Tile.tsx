'use client';

import { motion } from 'motion/react';
import type { Tile as TileType } from '@/types/game';

interface TileProps {
  tile: TileType;
  revealed?: boolean;
  size?: 'normal' | 'medium' | 'small';
  glowVariant?: 'win' | 'loss' | null;
  className?: string;
}

const BACK_CHAR = String.fromCodePoint(0x1f02b);

const sizeConfig = {
  normal: {
    outer: 'w-32 h-44',
    fontSize: 'text-6xl',
    radius: 'rounded-2xl',
    shadow: 'shadow-2xl',
  },
  medium: {
    outer: 'w-14 h-20',
    fontSize: 'text-3xl',
    radius: 'rounded-xl',
    shadow: 'shadow-lg',
  },
  small: {
    outer: 'w-9 h-13',
    fontSize: 'text-xl',
    radius: 'rounded-lg',
    shadow: 'shadow-md',
  },
};

// Maps tile type+suit to { chinese, color, label }
const HONOR_META: Record<string, { chinese: string; color: string; label: string }> = {
  'dragon-red':   { chinese: '中', color: '#ef4444', label: 'Dragon' },
  'dragon-green': { chinese: '發', color: '#22c55e', label: 'Dragon' },
  'dragon-white': { chinese: '白', color: '#94a3b8', label: 'Dragon' },
  'wind-east':    { chinese: '東', color: '#f59e0b', label: 'Wind' },
  'wind-south':   { chinese: '南', color: '#f59e0b', label: 'Wind' },
  'wind-west':    { chinese: '西', color: '#f59e0b', label: 'Wind' },
  'wind-north':   { chinese: '北', color: '#f59e0b', label: 'Wind' },
};

const SUIT_LABEL: Record<string, string> = {
  character: 'Char',
  bamboo: 'Bam',
  circle: 'Circ',
};

export function Tile({ tile, revealed = true, size = 'normal', glowVariant = null, className = '' }: TileProps) {
  const cfg = sizeConfig[size];

  const glowClass =
    glowVariant === 'win'
      ? 'animate-win-glow'
      : glowVariant === 'loss'
        ? 'animate-loss-glow'
        : '';

  return (
    <div className={`tile-scene ${cfg.outer} ${className}`}>
      <motion.div
        className={`tile-card ${cfg.shadow} ${cfg.radius} ${glowClass}`}
        animate={{ rotateY: revealed ? 0 : 180 }}
        initial={{ rotateY: 180 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Face */}
        <div
          className={`tile-face ${cfg.radius} border-2`}
          style={{
            backgroundColor: '#fff8e7',
            borderColor: '#c8a96e',
          }}
        >
          <span
            className={`${cfg.fontSize} select-none leading-none`}
            style={{ fontFamily: 'serif', color: '#1a1008' }}
          >
            {tile.unicode}
          </span>
          {(size === 'normal' || size === 'medium') && (() => {
            const honorKey = `${tile.type}-${tile.suit}`;
            const honor = HONOR_META[honorKey];
            if (honor) {
              return (
                <div className="flex flex-col items-center leading-none mt-0.5" style={{ gap: '1px' }}>
                  <span className="text-lg font-bold leading-none" style={{ color: honor.color, fontFamily: 'serif' }}>
                    {honor.chinese}
                  </span>
                  <span className="text-[8px] tracking-wider uppercase font-semibold opacity-50" style={{ color: '#1a1008' }}>
                    {honor.label}
                  </span>
                </div>
              );
            }
            const suitLabel = SUIT_LABEL[tile.suit] ?? tile.suit;
            return (
              <span className="text-[8px] tracking-wider uppercase font-semibold opacity-40 mt-0.5" style={{ color: '#1a1008' }}>
                {suitLabel}
              </span>
            );
          })()}
        </div>

        {/* Back */}
        <div
          className={`tile-back ${cfg.radius} border-2 flex items-center justify-center`}
          style={{
            backgroundColor: '#1e2d45',
            borderColor: '#c8a96e',
            backgroundImage:
              'repeating-linear-gradient(45deg, rgba(200,169,110,0.07) 0px, rgba(200,169,110,0.07) 1px, transparent 1px, transparent 8px)',
          }}
        >
          <span
            className={`${cfg.fontSize} select-none leading-none opacity-60`}
            style={{ fontFamily: 'serif', color: '#c8a96e' }}
          >
            {BACK_CHAR}
          </span>
        </div>
      </motion.div>
    </div>
  );
}
