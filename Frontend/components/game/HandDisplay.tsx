'use client';

import { motion } from 'motion/react';
import type { Tile as TileType, TileValueMap } from '@/types/game';
import { Tile } from './Tile';

interface HandDisplayProps {
  tiles: TileType[];
  revealed: boolean;
  glowVariant?: 'win' | 'loss' | null;
  valueMap?: TileValueMap;
  showValue?: boolean;
}

const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { y: -50, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 280,
      damping: 22,
    },
  },
};

export function HandDisplay({
  tiles,
  revealed,
  glowVariant = null,
}: HandDisplayProps) {
  return (
    <motion.div
      className="flex items-end justify-center gap-3"
      variants={container}
      initial="hidden"
      animate="show"
      key={tiles.map((t) => t.id).join(',')}
    >
      {tiles.map((tile, index) => (
        <motion.div key={tile.id} variants={item} custom={index}>
          <Tile
            tile={tile}
            revealed={revealed}
            size="normal"
            glowVariant={index === 0 ? glowVariant : null}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
