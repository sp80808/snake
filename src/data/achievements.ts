import { Achievement, Challenge } from '../types';

export const createAchievements = (): Record<string, Achievement> => ({
  firstGame: {
    id: 'firstGame',
    name: 'Getting Started',
    description: 'Play your first game',
    tier: 'bronze',
    condition: (stats) => stats.gamesPlayed >= 1,
    progress: (stats) => ({ current: Math.min(stats.gamesPlayed, 1), target: 1 }),
    reward: 10,
    unlocked: false
  },
  
  speedster: {
    id: 'speedster',
    name: 'Speed Demon',
    description: 'Reach a score of 500 in under 2 minutes',
    tier: 'silver',
    condition: (stats, gameState) => gameState.score >= 500 && (Date.now() - gameState.gameStartTime) < 120000,
    progress: (stats) => ({ current: Math.min(stats.highScore, 500), target: 500 }),
    reward: 50,
    unlocked: false
  },
  
  collector: {
    id: 'collector',
    name: 'Food Collector',
    description: 'Eat 100 food items',
    tier: 'bronze',
    condition: (stats) => stats.totalFoodEaten >= 100,
    progress: (stats) => ({ current: Math.min(stats.totalFoodEaten, 100), target: 100 }),
    reward: 25,
    unlocked: false
  },
  
  survivor: {
    id: 'survivor',
    name: 'Survivor',
    description: 'Reach length 20 in a single game',
    tier: 'silver',
    condition: (stats) => stats.longestSnake >= 20,
    progress: (stats) => ({ current: Math.min(stats.longestSnake, 20), target: 20 }),
    reward: 75,
    unlocked: false
  },
  
  scoremaster: {
    id: 'scoremaster',
    name: 'Score Master',
    description: 'Achieve a score of 1000',
    tier: 'gold',
    condition: (stats) => stats.highScore >= 1000,
    progress: (stats) => ({ current: Math.min(stats.highScore, 1000), target: 1000 }),
    reward: 100,
    unlocked: false
  },
  
  comboking: {
    id: 'comboking',
    name: 'Combo King',
    description: 'Achieve a 10x combo',
    tier: 'silver',
    condition: (stats, gameState) => gameState.combo.maxCombo >= 10,
    progress: (stats, gameState) => ({ current: Math.min(gameState.combo.maxCombo, 10), target: 10 }),
    reward: 60,
    unlocked: false
  },
  
  dedicated: {
    id: 'dedicated',
    name: 'Dedicated Player',
    description: 'Play for 10 games',
    tier: 'bronze',
    condition: (stats) => stats.gamesPlayed >= 10,
    progress: (stats) => ({ current: Math.min(stats.gamesPlayed, 10), target: 10 }),
    reward: 30,
    unlocked: false
  },
  
  wealthy: {
    id: 'wealthy',
    name: 'Coin Collector',
    description: 'Earn 500 total coins',
    tier: 'silver',
    condition: (stats) => stats.totalCoinsEarned >= 500,
    progress: (stats) => ({ current: Math.min(stats.totalCoinsEarned, 500), target: 500 }),
    reward: 100,
    unlocked: false
  },
  
  levelUp: {
    id: 'levelUp',
    name: 'Level Up',
    description: 'Reach level 5',
    tier: 'bronze',
    condition: (stats) => stats.level >= 5,
    progress: (stats) => ({ current: Math.min(stats.level, 5), target: 5 }),
    reward: 40,
    unlocked: false
  },
  
  legend: {
    id: 'legend',
    name: 'Snake Legend',
    description: 'Reach level 20',
    tier: 'gold',
    condition: (stats) => stats.level >= 20,
    progress: (stats) => ({ current: Math.min(stats.level, 20), target: 20 }),
    reward: 200,
    unlocked: false
  }
});

export const createChallenges = (): Record<string, Challenge> => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + (7 - today.getDay()));
  nextWeek.setHours(0, 0, 0, 0);

  return {
    dailyScore: {
      id: 'dailyScore',
      name: 'Daily High Score',
      description: 'Achieve a score of 300 today',
      type: 'daily',
      condition: (stats) => stats.highScore >= 300,
      progress: (stats) => ({ current: Math.min(stats.highScore, 300), target: 300 }),
      reward: { coins: 20, xp: 50 },
      expiresAt: tomorrow.toISOString(),
      completed: false
    },
    
    weeklyGames: {
      id: 'weeklyGames',
      name: 'Weekly Games',
      description: 'Play 15 games this week',
      type: 'weekly',
      condition: (stats) => stats.gamesPlayed >= 15,
      progress: (stats) => ({ current: Math.min(stats.gamesPlayed, 15), target: 15 }),
      reward: { coins: 75, xp: 150 },
      expiresAt: nextWeek.toISOString(),
      completed: false
    },
    
    dailyCombo: {
      id: 'dailyCombo',
      name: 'Combo Master',
      description: 'Achieve a 5x combo today',
      type: 'daily',
      condition: (stats, gameState) => gameState.combo.maxCombo >= 5,
      progress: (stats, gameState) => ({ current: Math.min(gameState.combo.maxCombo, 5), target: 5 }),
      reward: { coins: 15, xp: 30 },
      expiresAt: tomorrow.toISOString(),
      completed: false
    }
  };
};