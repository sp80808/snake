export interface Position {
  x: number;
  y: number;
}

export interface Snake {
  segments: Position[];
  direction: Position;
  color: string;
  powerUps: ActivePowerUp[];
  skin?: SnakeSkin;
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
  totalCoinsEarned: number;
  totalFoodEaten: number;
  totalPlayTime: number;
  longestSnake: number;
  totalDeaths: number;
  averageScore: number;
  dailyStreak: number;
  lastPlayDate: string;
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

export interface CoinAnimation {
  id: string;
  x: number;
  y: number;
  value: number;
  timestamp: number;
}

export interface SnakeSkin {
  id: string;
  name: string;
  price: number;
  headColor: string;
  bodyColor: string;
  pattern?: string;
  unlocked: boolean;
}

export interface GameTheme {
  id: string;
  name: string;
  price: number;
  backgroundColor: string;
  gridColor: string;
  foodColor: string;
  wallColor?: string;
  unlocked: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  tier: 'bronze' | 'silver' | 'gold';
  condition: (stats: PlayerStats, gameState: GameState) => boolean;
  progress: (stats: PlayerStats, gameState: GameState) => { current: number; target: number };
  reward: number; // coins
  unlocked: boolean;
  dateUnlocked?: string;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: 'daily' | 'weekly';
  condition: (stats: PlayerStats, gameState: GameState) => boolean;
  progress: (stats: PlayerStats, gameState: GameState) => { current: number; target: number };
  reward: { coins: number; xp: number };
  expiresAt: string;
  completed: boolean;
  dateCompleted?: string;
}

export interface AchievementToast {
  id: string;
  achievement: Achievement;
  timestamp: number;
}

export interface SkillTree {
  speed: SkillNode;
  agility: SkillNode;
  efficiency: SkillNode;
  luck: SkillNode;
}

export interface SkillNode {
  id: string;
  name: string;
  description: string;
  level: number;
  maxLevel: number;
  cost: number;
  effect: (level: number) => number;
  prerequisite?: string;
}

export interface StatsPeriod {
  daily: StatsData;
  weekly: StatsData;
  monthly: StatsData;
  allTime: StatsData;
}

export interface StatsData {
  gamesPlayed: number;
  averageScore: number;
  highScore: number;
  totalCoins: number;
  totalXP: number;
  averageCombo: number;
  playTime: number;
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
  coinAnimations: CoinAnimation[];
  showShop: boolean;
  achievements: Record<string, Achievement>;
  challenges: Record<string, Challenge>;
  achievementToasts: AchievementToast[];
  skins: Record<string, SnakeSkin>;
  themes: Record<string, GameTheme>;
  skillTree: SkillTree;
  currentTheme: string;
  currentSkin: string;
  showCustomization: boolean;
  showAchievements: boolean;
  showStats: boolean;
  statistics: StatsPeriod;
  gameStartTime: number;
}