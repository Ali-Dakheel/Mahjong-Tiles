/**
 * Pure game logic — no React, no UI, no side effects.
 * All game math lives here so it can be tested and extended independently.
 */

import type { GameOverReason, Tile, TileType, TileValueMap } from '@/types/game';

interface TileDef {
  type: TileType;
  suit: string;
  rank: number | null;
  codepoint: number;
  displayLabel: string;
}

const TILE_DEFS: TileDef[] = [
  // Dragons
  { type: 'dragon', suit: 'red',   rank: null, codepoint: 0x1f004, displayLabel: 'Red Dragon (中)' },
  { type: 'dragon', suit: 'green', rank: null, codepoint: 0x1f005, displayLabel: 'Green Dragon (發)' },
  { type: 'dragon', suit: 'white', rank: null, codepoint: 0x1f006, displayLabel: 'White Dragon (白)' },
  // Winds
  { type: 'wind', suit: 'east',  rank: null, codepoint: 0x1f000, displayLabel: 'East Wind (東)' },
  { type: 'wind', suit: 'south', rank: null, codepoint: 0x1f001, displayLabel: 'South Wind (南)' },
  { type: 'wind', suit: 'west',  rank: null, codepoint: 0x1f002, displayLabel: 'West Wind (西)' },
  { type: 'wind', suit: 'north', rank: null, codepoint: 0x1f003, displayLabel: 'North Wind (北)' },
  // Number tiles — value always equals rank
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'character' as TileType, suit: 'character', rank: i + 1,
    codepoint: 0x1f007 + i, displayLabel: `Character ${i + 1}`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'bamboo' as TileType, suit: 'bamboo', rank: i + 1,
    codepoint: 0x1f010 + i, displayLabel: `Bamboo ${i + 1}`,
  })),
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'circle' as TileType, suit: 'circle', rank: i + 1,
    codepoint: 0x1f019 + i, displayLabel: `Circle ${i + 1}`,
  })),
];

// Incremented each time buildFullDeck() is called so reshuffled tile IDs
// never collide with IDs still in the discard pile.
let _deckCounter = 0;

/** Creates a fresh unshuffled 136-tile deck (34 types × 4 copies). */
export function buildFullDeck(): Tile[] {
  const deckId = ++_deckCounter;
  const tiles: Tile[] = [];
  for (const def of TILE_DEFS) {
    for (let copy = 0; copy < 4; copy++) {
      tiles.push({
        id: `${def.type}_${def.suit}${def.rank !== null ? `_${def.rank}` : ''}_${copy}_d${deckId}`,
        type: def.type,
        suit: def.suit,
        rank: def.rank,
        unicode: String.fromCodePoint(def.codepoint),
        displayLabel: def.displayLabel,
      });
    }
  }
  return tiles;
}

/** Fisher-Yates shuffle. Returns a new array — never mutates the input. */
export function shuffle(tiles: Tile[]): Tile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** Slices `count` tiles off the top of the pile. Returns both the hand and the remainder. */
export function dealHand(pile: Tile[], count = 4): { hand: Tile[]; remaining: Tile[] } {
  return { hand: pile.slice(0, count), remaining: pile.slice(count) };
}

/** All 7 honor tiles start at 5. */
export function getInitialValueMap(): TileValueMap {
  return {
    dragon_red: 5, dragon_green: 5, dragon_white: 5,
    wind_east: 5, wind_south: 5, wind_west: 5, wind_north: 5,
  };
}

/** Number tiles return their rank. Honor tiles look up their current value in the map. */
export function calcTileValue(tile: Tile, map: TileValueMap): number {
  if (tile.rank !== null) return tile.rank;
  const key = `${tile.type}_${tile.suit}` as keyof TileValueMap;
  return map[key] ?? 5;
}

/** Sums the values of all tiles in a hand using the current honor tile map. */
export function calcHandValue(hand: Tile[], map: TileValueMap): number {
  return hand.reduce((sum, tile) => sum + calcTileValue(tile, map), 0);
}

/**
 * Adjusts honor tile values after a round: +1 per dragon/wind on win, -1 on loss.
 * Applies to the newly revealed hand (not the one you were looking at while betting).
 * Clamped 0–10 so values can naturally reach the game-over boundaries.
 * Returns a new map — never mutates the input.
 */
export function applyValueScaling(
  map: TileValueMap,
  hand: Tile[],
  outcome: 'win' | 'loss',
): TileValueMap {
  const delta = outcome === 'win' ? 1 : -1;
  const updated = { ...map };
  for (const tile of hand) {
    if (tile.type === 'dragon' || tile.type === 'wind') {
      const key = `${tile.type}_${tile.suit}` as keyof TileValueMap;
      updated[key] = Math.min(10, Math.max(0, (updated[key] ?? 5) + delta));
    }
  }
  return updated;
}

/**
 * Checks all three end conditions after every bet.
 * Priority: reshuffle limit → value hits 0 → value hits 10.
 * Returns the reason string, or null if the game continues.
 */
export function checkGameOver(map: TileValueMap, reshuffleCount: number): GameOverReason | null {
  if (reshuffleCount >= 3) return 'reshuffle_limit';
  const values = Object.values(map) as number[];
  if (values.some((v) => v <= 0)) return 'tile_value_zero';
  if (values.some((v) => v >= 10)) return 'tile_value_ten';
  return null;
}
