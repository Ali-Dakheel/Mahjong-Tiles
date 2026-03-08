'use client';

import { motion, AnimatePresence } from 'motion/react';
import type { TileValueMap } from '@/types/game';

interface ValueMapDisplayProps {
  valueMap: TileValueMap;
}

interface HonorTileDef {
  key: keyof TileValueMap;
  name: string;
  chinese: string;
  unicode: string;
  accentColor: string;
}

const DRAGONS: HonorTileDef[] = [
  { key: 'dragon_red',   name: 'Red',   chinese: '中', unicode: '🀄', accentColor: '#ef4444' },
  { key: 'dragon_green', name: 'Green', chinese: '發', unicode: '🀅', accentColor: '#22c55e' },
  { key: 'dragon_white', name: 'White', chinese: '白', unicode: '🀆', accentColor: '#94a3b8' },
];

const WINDS: HonorTileDef[] = [
  { key: 'wind_east',  name: 'East',  chinese: '東', unicode: '🀀', accentColor: '#f59e0b' },
  { key: 'wind_south', name: 'South', chinese: '南', unicode: '🀁', accentColor: '#f59e0b' },
  { key: 'wind_west',  name: 'West',  chinese: '西', unicode: '🀂', accentColor: '#f59e0b' },
  { key: 'wind_north', name: 'North', chinese: '北', unicode: '🀃', accentColor: '#f59e0b' },
];

function getValueColor(value: number): string {
  if (value <= 2) return '#ef4444';
  if (value <= 3) return '#f97316';
  if (value >= 8) return '#f59e0b';
  if (value >= 7) return '#fbbf24';
  return '#c8a96e';
}

function TileCard({ def, value }: { def: HonorTileDef; value: number }) {
  const valueColor = getValueColor(value);
  const isDanger = value <= 2 || value >= 8;

  return (
    <motion.div
      className="relative flex flex-col items-center rounded-xl p-3 gap-1"
      style={{
        background: isDanger
          ? `rgba(${value <= 2 ? '239,68,68' : '245,158,11'},0.1)`
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${isDanger ? valueColor + '50' : 'rgba(255,255,255,0.08)'}`,
      }}
    >
      {/* Danger badge */}
      {isDanger && (
        <motion.div
          animate={{ opacity: [1, 0.4, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[7px] font-black tracking-widest uppercase whitespace-nowrap"
          style={{ background: valueColor, color: '#0f172a' }}
        >
          ⚠ DANGER
        </motion.div>
      )}

      {/* Tile unicode */}
      <span className="text-3xl leading-none select-none" style={{ fontFamily: 'serif' }}>
        {def.unicode}
      </span>

      {/* Chinese character */}
      <span className="text-xl font-black leading-none" style={{ color: def.accentColor, fontFamily: 'serif' }}>
        {def.chinese}
      </span>

      {/* Name */}
      <span className="text-[9px] tracking-wider uppercase opacity-40 leading-none">
        {def.name}
      </span>

      {/* Value */}
      <AnimatePresence mode="wait">
        <motion.span
          key={value}
          initial={{ y: -8, opacity: 0, scale: 0.8 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 8, opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className="text-2xl font-black tabular-nums leading-none mt-0.5"
          style={{ color: valueColor }}
        >
          {value}
        </motion.span>
      </AnimatePresence>

      {/* Mini bar */}
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.08)' }}>
        <motion.div
          className="h-full rounded-full"
          animate={{ width: `${((value - 1) / 8) * 100}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          style={{ backgroundColor: valueColor }}
        />
      </div>
    </motion.div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="text-[9px] tracking-[0.2em] uppercase opacity-30 mt-1 mb-0.5">{label}</p>
  );
}

export function ValueMapDisplay({ valueMap }: ValueMapDisplayProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="text-[9px] tracking-[0.25em] uppercase opacity-30 mb-1">Honor Tile Values</p>

      <SectionLabel label="Dragons" />
      <div className="grid grid-cols-3 gap-2">
        {DRAGONS.map((def) => (
          <TileCard key={def.key} def={def} value={valueMap[def.key] ?? 5} />
        ))}
      </div>

      <SectionLabel label="Winds" />
      <div className="grid grid-cols-2 gap-2">
        {WINDS.map((def) => (
          <TileCard key={def.key} def={def} value={valueMap[def.key] ?? 5} />
        ))}
      </div>
    </div>
  );
}
