'use client';

import { motion } from 'motion/react';
import type { Tile as TileType } from '@/types/game';

interface TileProps {
  tile: TileType;
  revealed?: boolean;
  size?: 'normal' | 'small';
  glowVariant?: 'win' | 'loss' | null;
  className?: string;
}

const BACK_CHAR = String.fromCodePoint(0x1f02b);

const sizeConfig = {
  normal: {
    outer: 'w-16 h-24',
    fontSize: 'text-4xl',
    radius: 'rounded-xl',
    shadow: 'shadow-xl',
  },
  small: {
    outer: 'w-9 h-13',
    fontSize: 'text-xl',
    radius: 'rounded-lg',
    shadow: 'shadow-md',
  },
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
