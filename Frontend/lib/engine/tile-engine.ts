import type { GameOverReason, Tile, TileType, TileValueMap } from '@/types/game';

// ─── Tile definitions ──────────────────────────────────────────────────────
// Unicode block: U+1F000–U+1F02B (Mahjong tiles)
// Winds:      East=U+1F000, South=U+1F001, West=U+1F002, North=U+1F003
// Dragons:    Red/中=U+1F004, Green/發=U+1F005, White/白=U+1F006
// Characters: 1-9 = U+1F007–U+1F00F
// Bamboo:     1-9 = U+1F010–U+1F018
// Circles:    1-9 = U+1F019–U+1F021
// Back tile:  U+1F02B

interface TileDef {
  type: TileType;
  suit: string;
  rank: number | null;
  codepoint: number;
  displayLabel: string;
}

const TILE_DEFS: TileDef[] = [
  // Dragons
  { type: 'dragon', suit: 'red', rank: null, codepoint: 0x1f004, displayLabel: 'Red Dragon (中)' },
  { type: 'dragon', suit: 'green', rank: null, codepoint: 0x1f005, displayLabel: 'Green Dragon (發)' },
  { type: 'dragon', suit: 'white', rank: null, codepoint: 0x1f006, displayLabel: 'White Dragon (白)' },
  // Winds
  { type: 'wind', suit: 'east', rank: null, codepoint: 0x1f000, displayLabel: 'East Wind (東)' },
  { type: 'wind', suit: 'south', rank: null, codepoint: 0x1f001, displayLabel: 'South Wind (南)' },
  { type: 'wind', suit: 'west', rank: null, codepoint: 0x1f002, displayLabel: 'West Wind (西)' },
  { type: 'wind', suit: 'north', rank: null, codepoint: 0x1f003, displayLabel: 'North Wind (北)' },
  // Characters
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'character' as TileType,
    suit: 'character',
    rank: i + 1,
    codepoint: 0x1f007 + i,
    displayLabel: `Character ${i + 1}`,
  })),
  // Bamboo
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'bamboo' as TileType,
    suit: 'bamboo',
    rank: i + 1,
    codepoint: 0x1f010 + i,
    displayLabel: `Bamboo ${i + 1}`,
  })),
  // Circles
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'circle' as TileType,
    suit: 'circle',
    rank: i + 1,
    codepoint: 0x1f019 + i,
    displayLabel: `Circle ${i + 1}`,
  })),
];

let _deckCounter = 0;

// 34 unique types × 4 copies = 136 tiles
// Each call gets a unique deckId so reshuffle IDs never clash with discard pile IDs
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

// Fisher-Yates — returns a new array
export function shuffle(tiles: Tile[]): Tile[] {
  const arr = [...tiles];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

export function dealHand(
  pile: Tile[],
  count = 4,
): { hand: Tile[]; remaining: Tile[] } {
  return {
    hand: pile.slice(0, count),
    remaining: pile.slice(count),
  };
}

export function getInitialValueMap(): TileValueMap {
  return {
    dragon_red: 5,
    dragon_green: 5,
    dragon_white: 5,
    wind_east: 5,
    wind_south: 5,
    wind_west: 5,
    wind_north: 5,
  };
}

export function calcTileValue(tile: Tile, map: TileValueMap): number {
  if (tile.rank !== null) {
    return tile.rank;
  }
  const key = `${tile.type}_${tile.suit}` as keyof TileValueMap;
  return map[key] ?? 5;
}

export function calcHandValue(hand: Tile[], map: TileValueMap): number {
  return hand.reduce((sum, tile) => sum + calcTileValue(tile, map), 0);
}

// Adjust honor tile values by ±1 based on outcome, clamped 1–9
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
      const newVal = Math.min(10, Math.max(0, (updated[key] ?? 5) + delta));
      updated[key] = newVal;
    }
  }

  return updated;
}

export function checkGameOver(
  map: TileValueMap,
  reshuffleCount: number,
): GameOverReason | null {
  if (reshuffleCount >= 3) {
    return 'reshuffle_limit';
  }

  const values = Object.values(map) as number[];
  if (values.some((v) => v <= 0)) {
    return 'tile_value_zero';
  }
  if (values.some((v) => v >= 10)) {
    return 'tile_value_ten';
  }

  return null;
}
