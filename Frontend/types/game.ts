export type TileType = 'dragon' | 'wind' | 'character' | 'bamboo' | 'circle';

export interface Tile {
  id: string;
  type: TileType;
  suit: string;
  rank: number | null;
  unicode: string;
  displayLabel: string;
}

export type BetDirection = 'higher' | 'lower';
export type GamePhase = 'idle' | 'dealing' | 'betting' | 'revealing' | 'game_over';
export type GameOverReason = 'tile_value_zero' | 'tile_value_ten' | 'reshuffle_limit';

export interface TileValueMap {
  dragon_red: number;
  dragon_green: number;
  dragon_white: number;
  wind_east: number;
  wind_south: number;
  wind_west: number;
  wind_north: number;
}

export interface BettingRound {
  roundNumber: number;
  previousHand: Tile[];
  previousHandValue: number;
  currentHand: Tile[];
  currentHandValue: number;
  bet: BetDirection;
  outcome: 'win' | 'loss';
  pointsEarned: number;
  streakAtTime: number;
}

export interface LeaderboardEntry {
  id?: number;
  player_name: string;
  score: number;
  rounds_played: number;
  game_over_reason: string;
  created_at?: string;
}
