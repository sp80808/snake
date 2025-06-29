export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  segments: Position[];
  direction: Position;
  color: string;
  powerUps: ActivePowerUp[];
}

export interface PowerUp {
  id: string;
  position: Position;
  type: PowerUpType;
  duration?: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeLeft: number;
}

export enum PowerUpType {
  SPEED_BOOST = 'speed_boost',
  INVINCIBILITY = 'invincibility',
  FOOD_MAGNET = 'food_magnet',
  DOUBLE_SCORE = 'double_score',
  SLOW_MOTION = 'slow_motion',
  SHIELD = 'shield'
}

export interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: number;
  level: number;
  maxLevel: number;
  effect: (level: number) => number;
}

export interface PlayerStats {
  level: number;
  xp: number;
  xpToNextLevel: number;
  totalXp: number;
  gamesPlayed: number;
  highScore: number;
  coins: number;
}

export interface ComboState {
  count: number;
  multiplier: number;
  lastCollectionTime: number;
  maxCombo: number;
}

export interface XPPopup {
  id: string;
  x: number;
  y: number;
  value: number;
  isCombo: boolean;
  timestamp: number;
}

export interface GameState {
  snake1: Snake;
  snake2: Snake | null;
  food: Position[];
  powerUps: PowerUp[];
  gameRunning: boolean;
  gameOver: boolean;
  dualMode: boolean;
  score: number;
  playerStats: PlayerStats;
  upgrades: Record<string, Upgrade>;
  gameSpeed: number;
  combo: ComboState;
  xpPopups: XPPopup[];
  showShop: boolean;
}