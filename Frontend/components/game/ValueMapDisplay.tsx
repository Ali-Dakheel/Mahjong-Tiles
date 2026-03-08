'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { TileValueMap } from '@/types/game';

interface ValueMapDisplayProps {
  valueMap: TileValueMap;
}

type TileKey = keyof TileValueMap;

const HONOR_TILES: { key: TileKey; label: string; unicode: string }[] = [
  { key: 'dragon_red', label: '中', unicode: '🀄' },
  { key: 'dragon_green', label: '發', unicode: '🀅' },
  { key: 'dragon_white', label: '白', unicode: '🀆' },
  { key: 'wind_east', label: 'E', unicode: '🀀' },
  { key: 'wind_south', label: 'S', unicode: '🀁' },
  { key: 'wind_west', label: 'W', unicode: '🀂' },
  { key: 'wind_north', label: 'N', unicode: '🀃' },
];

function getValueColor(value: number): string {
  if (value <= 2) return '#ef4444';
  if (value <= 3) return '#f97316';
  if (value >= 8) return '#f59e0b';
  if (value >= 7) return '#fbbf24';
  return '#c8a96e';
}

function getBarWidth(value: number): string {
  return `${((value - 1) / 8) * 100}%`;
}

export function ValueMapDisplay({ valueMap }: ValueMapDisplayProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-[9px] tracking-[0.25em] uppercase opacity-30 mb-0.5">Honor Tile Values</p>
      {HONOR_TILES.map(({ key, label, unicode }) => {
        const value = valueMap[key] ?? 5;
        const color = getValueColor(value);
        const isDanger = value <= 2 || value >= 8;

        return (
          <div key={key} className="flex items-center gap-2">
            {/* Tile symbol */}
            <span
              className="text-base w-6 text-center leading-none shrink-0"
              style={{ fontFamily: 'serif' }}
              title={label}
            >
              {unicode}
            </span>

            {/* Bar */}
            <div
              className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              <motion.div
                className="h-full rounded-full"
                animate={{ width: getBarWidth(value) }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                style={{ backgroundColor: color }}
              />
            </div>

            {/* Value number */}
            <AnimatePresence mode="wait">
              <motion.span
                key={value}
                initial={{ y: -6, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 6, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-bold w-4 text-right tabular-nums shrink-0"
                style={{ color }}
              >
                {value}
              </motion.span>
            </AnimatePresence>

            {/* Warning dot */}
            {isDanger && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ backgroundColor: color }}
              />
            )}
            {!isDanger && <div className="w-1.5 shrink-0" />}
          </div>
        );
      })}
    </div>
  );
}
