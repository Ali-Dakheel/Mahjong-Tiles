/**
 * tile-engine.ts — Pure Game Logic
 *
 * ALL the game math lives here as plain TypeScript functions.
 * Zero React, zero UI, zero side effects.
 *
 * WHY separate from the store?
 *  1. Every function here can be unit-tested without rendering anything.
 *  2. Adding a new mechanic (bonus scoring, new tile type, hand patterns)
 *     means adding a function here — the UI never needs to know.
 *
 * Think of it as a calculator: give it inputs, it returns outputs.
 * The store (useGameStore) is what calls these functions and saves the results.
 */

import type { GameOverReason, Tile, TileType, TileValueMap } from '@/types/game';

// Internal type — only used inside this file to define the master tile list.
interface TileDef {
  type: TileType;
  suit: string;
  rank: number | null;  // null for honor tiles (dragons/winds), 1–9 for number tiles
  codepoint: number;    // Unicode code point for the tile's symbol e.g. 0x1f004 = 🀄
  displayLabel: string; // Human-readable name e.g. "Red Dragon (中)"
}

// ─── Master list of all 34 unique tile types ──────────────────────────────────
// buildFullDeck() will create 4 copies of each.
//
// Unicode block: U+1F000–U+1F02B (Mahjong tiles)
// Winds:      East=U+1F000, South=U+1F001, West=U+1F002, North=U+1F003
// Dragons:    Red=U+1F004, Green=U+1F005, White=U+1F006
// Characters: 1-9 = U+1F007–U+1F00F
// Bamboo:     1-9 = U+1F010–U+1F018
// Circles:    1-9 = U+1F019–U+1F021
const TILE_DEFS: TileDef[] = [
  // Dragons (honor tiles — value comes from TileValueMap, starts at 5)
  { type: 'dragon', suit: 'red',   rank: null, codepoint: 0x1f004, displayLabel: 'Red Dragon (中)' },
  { type: 'dragon', suit: 'green', rank: null, codepoint: 0x1f005, displayLabel: 'Green Dragon (發)' },
  { type: 'dragon', suit: 'white', rank: null, codepoint: 0x1f006, displayLabel: 'White Dragon (白)' },
  // Winds (honor tiles — value comes from TileValueMap, starts at 5)
  { type: 'wind', suit: 'east',  rank: null, codepoint: 0x1f000, displayLabel: 'East Wind (東)' },
  { type: 'wind', suit: 'south', rank: null, codepoint: 0x1f001, displayLabel: 'South Wind (南)' },
  { type: 'wind', suit: 'west',  rank: null, codepoint: 0x1f002, displayLabel: 'West Wind (西)' },
  { type: 'wind', suit: 'north', rank: null, codepoint: 0x1f003, displayLabel: 'North Wind (北)' },
  // Characters 1–9 (number tiles — value always equals rank, never changes)
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'character' as TileType,
    suit: 'character',
    rank: i + 1,
    codepoint: 0x1f007 + i,
    displayLabel: `Character ${i + 1}`,
  })),
  // Bamboo 1–9 (number tiles — value always equals rank, never changes)
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'bamboo' as TileType,
    suit: 'bamboo',
    rank: i + 1,
    codepoint: 0x1f010 + i,
    displayLabel: `Bamboo ${i + 1}`,
  })),
  // Circles 1–9 (number tiles — value always equals rank, never changes)
  ...Array.from({ length: 9 }, (_, i) => ({
    type: 'circle' as TileType,
    suit: 'circle',
    rank: i + 1,
    codepoint: 0x1f019 + i,
    displayLabel: `Circle ${i + 1}`,
  })),
];

// Module-level counter so each deck build gets a unique suffix on tile IDs.
// Prevents ID collisions between fresh deck tiles and old discard pile tiles
// when we reshuffle them together.
let _deckCounter = 0;

/**
 * buildFullDeck
 *
 * Creates a fresh, UNSHUFFLED set of 136 tiles (34 types × 4 copies each).
 * Each tile gets a unique `id` string so React can use it as a stable key.
 *
 * Called by: startGame() for the initial deck, and placeBet() when reshuffling.
 *
 * TO ADD A NEW TILE TYPE: add its TileDef entry to TILE_DEFS above.
 */
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
        unicode: String.fromCodePoint(def.codepoint), // e.g. 0x1f004 → "🀄"
        displayLabel: def.displayLabel,
      });
    }
  }
  return tiles;
}

/**
 * shuffle
 *
 * Randomises an array of tiles using Fisher-Yates — the only truly unbiased shuffle.
 * Every possible ordering is equally likely.
 *
 * Algorithm: start from the last element, swap it with a random earlier element.
 * Move backwards until the whole array has been visited.
 *
 * Returns a NEW array — never mutates the input.
 */
export function shuffle(tiles: Tile[]): Tile[] {
  const arr = [...tiles]; // copy first so we never mutate the original
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/**
 * dealHand
 *
 * Slices `count` tiles (default 4) off the top of the draw pile.
 * Returns both the dealt hand and the remaining pile as separate arrays.
 * Like cutting cards off the top of a physical deck.
 *
 * Called by: startGame() and placeBet() every round.
 */
export function dealHand(
  pile: Tile[],
  count = 4,
): { hand: Tile[]; remaining: Tile[] } {
  return {
    hand: pile.slice(0, count),   // first N tiles become the hand
    remaining: pile.slice(count), // everything else stays in the pile
  };
}

/**
 * getInitialValueMap
 *
 * Returns the starting TileValueMap — all 7 honor tiles begin at 5.
 * Per the game spec: "Non-Number Tiles start at a base value of 5."
 *
 * Called by: startGame() to reset the board to a clean state.
 */
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

/**
 * calcTileValue
 *
 * Returns the numeric game value of a single tile.
 *
 * - Number tile (Character/Bamboo/Circle): returns its rank directly (e.g. Bamboo 7 = 7)
 * - Honor tile (Dragon/Wind): looks up its current dynamic value in the map
 *   e.g. dragon_red might be 7 after appearing in two winning hands
 *
 * Called by: calcHandValue() for every tile when computing a hand total.
 */
export function calcTileValue(tile: Tile, map: TileValueMap): number {
  // Number tiles always equal their face rank — simple and fast
  if (tile.rank !== null) {
    return tile.rank;
  }
  // Honor tiles use the live map. Key format: "dragon_red", "wind_east", etc.
  const key = `${tile.type}_${tile.suit}` as keyof TileValueMap;
  return map[key] ?? 5; // fallback to 5 if key somehow missing
}

/**
 * calcHandValue
 *
 * Sums the values of all tiles in a 4-tile hand.
 *
 * Example: [Character 3, Bamboo 7, Red Dragon(=6), East Wind(=4)] → 3+7+6+4 = 20
 *
 * Called by: startGame() for the first hand, and placeBet() for every new hand dealt.
 */
export function calcHandValue(hand: Tile[], map: TileValueMap): number {
  return hand.reduce((sum, tile) => sum + calcTileValue(tile, map), 0);
}

/**
 * applyValueScaling
 *
 * Updates honor tile values after a round based on the outcome.
 *
 * Rules (per spec):
 *   Win  → each dragon/wind in the hand goes UP by 1
 *   Loss → each dragon/wind in the hand goes DOWN by 1
 *   Number tiles are ignored — only dragons and winds scale.
 *   Values are clamped 0–10 to allow the natural game-over boundaries.
 *
 * WHICH hand? The newly revealed hand — NOT the one you were staring at
 * while betting. The new hand is what caused the outcome, so its tiles scale.
 *
 * Returns a NEW map object — never mutates the original.
 * This ensures old history records still reference the values correct at the time.
 *
 * Called by: placeBet() immediately after determining win or loss.
 *
 * TO CHANGE THE SCALING RULE: just change `delta` or add conditions here.
 */
export function applyValueScaling(
  map: TileValueMap,
  hand: Tile[],
  outcome: 'win' | 'loss',
): TileValueMap {
  const delta = outcome === 'win' ? 1 : -1;
  const updated = { ...map }; // shallow copy — never mutate the input map

  for (const tile of hand) {
    if (tile.type === 'dragon' || tile.type === 'wind') {
      const key = `${tile.type}_${tile.suit}` as keyof TileValueMap;
      // Allow 0 and 10 — that's what triggers game over in checkGameOver()
      const newVal = Math.min(10, Math.max(0, (updated[key] ?? 5) + delta));
      updated[key] = newVal;
    }
  }

  return updated;
}

/**
 * checkGameOver
 *
 * After every bet, checks all three conditions that end the game.
 * Returns the reason string if any condition is met, or null to continue.
 *
 * Priority order matters — reshuffle checked first:
 *
 *  1. reshuffle_limit — deck has run out 3 times. The "survival" end.
 *     Good players reach this. reshuffleCount increments inside placeBet().
 *
 *  2. tile_value_zero — an honor tile's value hit 0.
 *     Happens when a tile appears in losing hands repeatedly.
 *     "The tile lost all its worth."
 *
 *  3. tile_value_ten — an honor tile's value hit 10.
 *     Happens when a tile appears in winning hands repeatedly.
 *     "The tile became too powerful."
 *
 * Called by: placeBet() after applyValueScaling() with the updated map.
 *
 * TO ADD A NEW GAME-OVER CONDITION: add it here and add the reason to
 * GameOverReason in types/game.ts and GAME_OVER_CONFIG in constants/gameOver.ts.
 */
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
