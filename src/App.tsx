import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  RotateCcw, 
  Trophy, 
  Gamepad2, 
  Users, 
  User, 
  Star,
  ShoppingCart,
  Zap,
  TrendingUp,
  Gift,
  Coins,
  Settings
} from 'lucide-react';
import { 
  Position, 
  Snake, 
  PowerUp, 
  PowerUpType, 
  GameState, 
  PlayerStats,
  ActivePowerUp,
  ComboState,
  XPPopup,
  CoinAnimation,
  Achievement,
  Challenge,
  SnakeSkin,
  GameTheme
} from './types';
import { 
  GRID_SIZE, 
  BASE_GAME_SPEED, 
  XP_PER_FOOD, 
  XP_PER_POWER_UP,
  generateFood,
  generatePowerUp,
  moveSnake,
  checkCollision,
  checkWallCollision,
  calculateLevel,
  getXpToNextLevel,
  getPowerUpEmoji,
  getPowerUpColor
} from './gameLogic';
import { createUpgrades, calculateUpgradeCost, canAffordUpgrade, purchaseUpgrade } from './upgrades';
import { createAchievements, createChallenges } from './data/achievements';
import { createSkins, createThemes } from './data/customization';
import { XPPopup as XPPopupComponent } from './components/XPPopup';
import { CoinAnimation as CoinAnimationComponent } from './components/CoinAnimation';
import { Shop } from './components/Shop';
import { AchievementToast } from './components/AchievementToast';
import { Customization } from './components/Customization';
import { Achievements } from './components/Achievements';
import { Statistics } from './components/Statistics';
import { FullscreenToggle } from './components/FullscreenToggle';
import { ParticleSystem, createFoodParticles, createPowerUpParticles, createAchievementParticles } from './components/ParticleSystem';
import { ScreenShake } from './components/ScreenShake';
import { FlashEffect } from './components/FlashEffect';
import { AnimatedButton } from './components/AnimatedButton';
import { PulsingElement } from './components/PulsingElement';
import { ProgressBar } from './components/ProgressBar';
import { CongratulatoryAnimation } from './components/CongratulatoryAnimation';
import { useGameAnimations } from './hooks/useGameAnimations';

const INITIAL_SNAKE1: Snake = {
  segments: [{ x: 8, y: 10 }],
  direction: { x: 0, y: -1 },
  color: 'from-emerald-400 to-emerald-600',
  powerUps: []
};

const INITIAL_SNAKE2: Snake = {
  segments: [{ x: 12, y: 10 }],
  direction: { x: 0, y: -1 },
  color: 'from-blue-400 to-blue-600',
  powerUps: []
};

const INITIAL_COMBO: ComboState = {
  count: 0,
  multiplier: 1,
  lastCollectionTime: 0,
  maxCombo: 0
};

const COMBO_TIMEOUT = 3000; // 3 seconds
const COMBO_MULTIPLIERS = [1, 1.2, 1.5, 2.0, 2.5, 3.0, 4.0, 5.0]; // Multipliers for combo levels

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'coin' | 'star' | 'circle';
}

function App() {
  const { 
    animations, 
    triggerShake, 
    triggerFlash, 
    triggerGameOver, 
    triggerPowerUp, 
    triggerFoodCollected,
    triggerLevelUp,
    triggerAchievement,
    triggerHighScore 
  } = useGameAnimations();

  const [gameState, setGameState] = useState<GameState>(() => {
    const savedStats = localStorage.getItem('snakePlayerStats');
    const savedUpgrades = localStorage.getItem('snakeUpgrades');
    const savedAchievements = localStorage.getItem('snakeAchievements');
    const savedSkins = localStorage.getItem('snakeSkins');
    const savedThemes = localStorage.getItem('snakeThemes');
    
    const defaultStats: PlayerStats = {
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      totalXp: 0,
      gamesPlayed: 0,
      highScore: 0,
      coins: 0,
      totalCoinsEarned: 0,
      totalFoodEaten: 0,
      totalPlayTime: 0,
      longestSnake: 0,
      totalDeaths: 0,
      averageScore: 0,
      dailyStreak: 0,
      lastPlayDate: new Date().toDateString()
    };

    const playerStats = savedStats ? JSON.parse(savedStats) : defaultStats;
    
    // Create upgrades with proper functions first
    const upgrades = createUpgrades();
    
    // If there are saved upgrades, merge only the level data
    if (savedUpgrades) {
      const savedUpgradeData = JSON.parse(savedUpgrades);
      Object.keys(upgrades).forEach(upgradeId => {
        if (savedUpgradeData[upgradeId] && typeof savedUpgradeData[upgradeId].level === 'number') {
          upgrades[upgradeId].level = Math.min(
            savedUpgradeData[upgradeId].level,
            upgrades[upgradeId].maxLevel
          );
        }
      });
    }

    // Initialize achievements
    const achievements = createAchievements();
    if (savedAchievements) {
      const savedAchievementData = JSON.parse(savedAchievements);
      Object.keys(achievements).forEach(achievementId => {
        if (savedAchievementData[achievementId]) {
          achievements[achievementId] = { ...achievements[achievementId], ...savedAchievementData[achievementId] };
        }
      });
    }

    // Initialize skins
    const skins = createSkins();
    if (savedSkins) {
      const savedSkinData = JSON.parse(savedSkins);
      Object.keys(skins).forEach(skinId => {
        if (savedSkinData[skinId]) {
          skins[skinId] = { ...skins[skinId], ...savedSkinData[skinId] };
        }
      });
    }

    // Initialize themes
    const themes = createThemes();
    if (savedThemes) {
      const savedThemeData = JSON.parse(savedThemes);
      Object.keys(themes).forEach(themeId => {
        if (savedThemeData[themeId]) {
          themes[themeId] = { ...themes[themeId], ...savedThemeData[themeId] };
        }
      });
    }

    return {
      snake1: INITIAL_SNAKE1,
      snake2: null,
      food: [{ x: 15, y: 15 }],
      powerUps: [],
      gameRunning: false,
      gameOver: false,
      dualMode: false,
      score: 0,
      playerStats,
      upgrades,
      gameSpeed: BASE_GAME_SPEED,
      combo: INITIAL_COMBO,
      xpPopups: [],
      coinAnimations: [],
      showShop: false,
      achievements,
      challenges: createChallenges(),
      achievementToasts: [],
      skins,
      themes,
      skillTree: {
        speed: { id: 'speed', name: 'Speed', description: 'Increase movement speed', level: 0, maxLevel: 10, cost: 50, effect: (level) => level * 0.1 },
        agility: { id: 'agility', name: 'Agility', description: 'Improve turning ability', level: 0, maxLevel: 5, cost: 75, effect: (level) => level * 0.2 },
        efficiency: { id: 'efficiency', name: 'Efficiency', description: 'Better resource usage', level: 0, maxLevel: 8, cost: 60, effect: (level) => level * 0.15 },
        luck: { id: 'luck', name: 'Luck', description: 'Better power-up spawns', level: 0, maxLevel: 6, cost: 100, effect: (level) => level * 0.25 }
      },
      currentTheme: 'classic',
      currentSkin: 'default',
      showCustomization: false,
      showAchievements: false,
      showStats: false,
      statistics: {
        daily: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 },
        weekly: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 },
        monthly: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 },
        allTime: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 }
      },
      gameStartTime: 0
    };
  });

  const [showUpgrades, setShowUpgrades] = useState(false);
  const [particles, setParticles] = useState<Particle[]>([]);
  const gameLoopRef = useRef<NodeJS.Timeout>();
  const animationFrameRef = useRef<number>();

  const saveProgress = useCallback(() => {
    localStorage.setItem('snakePlayerStats', JSON.stringify(gameState.playerStats));
    localStorage.setItem('snakeUpgrades', JSON.stringify(gameState.upgrades));
    localStorage.setItem('snakeAchievements', JSON.stringify(gameState.achievements));
    localStorage.setItem('snakeSkins', JSON.stringify(gameState.skins));
    localStorage.setItem('snakeThemes', JSON.stringify(gameState.themes));
  }, [gameState.playerStats, gameState.upgrades]);

  const calculateComboMultiplier = (comboCount: number): number => {
    const index = Math.min(comboCount, COMBO_MULTIPLIERS.length - 1);
    return COMBO_MULTIPLIERS[index];
  };

  const addXPPopup = useCallback((x: number, y: number, value: number, isCombo: boolean) => {
    const popup: XPPopup = {
      id: `xp-${Date.now()}-${Math.random()}`,
      x,
      y,
      value,
      isCombo,
      timestamp: Date.now()
    };
    
    setGameState(prev => ({
      ...prev,
      xpPopups: [...prev.xpPopups, popup]
    }));
  }, []);

  const addCoinAnimation = useCallback((x: number, y: number, value: number) => {
    const animation: CoinAnimation = {
      id: `coin-${Date.now()}-${Math.random()}`,
      x,
      y,
      value,
      timestamp: Date.now()
    };
    
    setGameState(prev => ({
      ...prev,
      coinAnimations: [...prev.coinAnimations, animation]
    }));
  }, []);

  const addParticles = useCallback((newParticles: Particle[]) => {
    setParticles(prev => [...prev, ...newParticles]);
  }, []);

  const removeParticle = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const checkAchievements = useCallback(() => {
    setGameState(prev => {
      const newAchievements = { ...prev.achievements };
      let newToasts = [...prev.achievementToasts];
      let coinsEarned = 0;

      Object.values(newAchievements).forEach(achievement => {
        if (!achievement.unlocked && achievement.condition(prev.playerStats, prev)) {
          newAchievements[achievement.id] = {
            ...achievement,
            unlocked: true,
            dateUnlocked: new Date().toISOString()
          };
          
          newToasts.push({
            id: `toast-${achievement.id}-${Date.now()}`,
            achievement: newAchievements[achievement.id],
            timestamp: Date.now()
          });
          
          coinsEarned += achievement.reward;
          triggerAchievement(achievement.name);
        }
      });

      return {
        ...prev,
        achievements: newAchievements,
        achievementToasts: newToasts,
        playerStats: {
          ...prev.playerStats,
          coins: prev.playerStats.coins + coinsEarned,
          totalCoinsEarned: prev.playerStats.totalCoinsEarned + coinsEarned
        }
      };
    });
  }, [triggerAchievement]);

  const updateCombo = useCallback(() => {
    const currentTime = Date.now();
    setGameState(prev => {
      if (prev.combo.count > 0 && currentTime - prev.combo.lastCollectionTime > COMBO_TIMEOUT) {
        return {
          ...prev,
          combo: {
            ...prev.combo,
            count: 0,
            multiplier: 1
          }
        };
      }
      return prev;
    });
  }, []);

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      snake1: INITIAL_SNAKE1,
      snake2: prev.dualMode ? INITIAL_SNAKE2 : null,
      food: [generateFood([INITIAL_SNAKE1, ...(prev.dualMode ? [INITIAL_SNAKE2] : [])], [])],
      powerUps: [],
      gameRunning: false,
      gameOver: false,
      score: 0,
      gameSpeed: BASE_GAME_SPEED - (prev.upgrades.speed.level * prev.upgrades.speed.effect(prev.upgrades.speed.level)),
      combo: INITIAL_COMBO,
      xpPopups: [],
      gameStartTime: Date.now()
    }));
  };

  const toggleDualMode = () => {
    setGameState(prev => ({
      ...prev,
      dualMode: !prev.dualMode,
      snake2: !prev.dualMode ? INITIAL_SNAKE2 : null
    }));
    resetGame();
  };

  const startGame = () => {
    if (gameState.gameOver) {
      resetGame();
    }
    setGameState(prev => ({
      ...prev,
      gameRunning: true,
      gameStartTime: Date.now(),
      playerStats: {
        ...prev.playerStats,
        gamesPlayed: prev.playerStats.gamesPlayed + 1
      }
    }));
  };

  const checkLevelUp = useCallback((newXP: number, oldXP: number) => {
    const newLevel = calculateLevel(newXP);
    const oldLevel = calculateLevel(oldXP);
    
    if (newLevel > oldLevel) {
      triggerLevelUp(newLevel);
      triggerFlash();
    }
  }, [triggerLevelUp, triggerFlash]);

  const addXP = useCallback((amount: number) => {
    setGameState(prev => {
      const xpMultiplier = prev.upgrades.xpBonus.effect(prev.upgrades.xpBonus.level);
      const actualXP = Math.floor(amount * xpMultiplier);
      const newTotalXp = prev.playerStats.totalXp + actualXP;
      const oldTotalXp = prev.playerStats.totalXp;
      const newLevel = calculateLevel(newTotalXp);
      const newXpToNext = getXpToNextLevel(newLevel, newTotalXp);

      // Check for level up
      setTimeout(() => checkLevelUp(newTotalXp, oldTotalXp), 100);

      return {
        ...prev,
        playerStats: {
          ...prev.playerStats,
          xp: prev.playerStats.xp + actualXP,
          totalXp: newTotalXp,
          level: newLevel,
          xpToNextLevel: newXpToNext
        }
      };
    });
  }, []);

  const checkHighScore = useCallback((newScore: number) => {
    setGameState(prev => {
      if (newScore > prev.playerStats.highScore) {
        triggerHighScore(newScore);
      }
      return prev;
    });
  }, [triggerHighScore]);

  const incrementCombo = useCallback((foodX: number, foodY: number) => {
    const currentTime = Date.now();
    setGameState(prev => {
      const newCount = prev.combo.count + 1;
      const newMultiplier = calculateComboMultiplier(newCount);
      const newMaxCombo = Math.max(prev.combo.maxCombo, newCount);
      
      // Add coin animation for combo
      if (newCount > 1) {
        addCoinAnimation(foodX * 20, foodY * 20, newCount);
      }
      return {
        ...prev,
        combo: {
          count: newCount,
          multiplier: newMultiplier,
          lastCollectionTime: currentTime,
          maxCombo: newMaxCombo
        }
      };
    });
  }, [addCoinAnimation]);

  const awardCoins = useCallback((score: number, combo: ComboState) => {
    setGameState(prev => {
      // Award coins based on score and combo performance
      const baseCoins = Math.floor(score / 100); // 1 coin per 100 points
      const comboBonus = Math.floor(combo.maxCombo / 5); // Bonus for high combos
      const totalCoins = baseCoins + comboBonus;
      
      return {
        ...prev,
        playerStats: {
          ...prev.playerStats,
          coins: prev.playerStats.coins + totalCoins,
          totalCoinsEarned: prev.playerStats.totalCoinsEarned + totalCoins
        }
      };
    });
  }, []);

  const handleSkinPurchase = useCallback((skinId: string) => {
    setGameState(prev => {
      const skin = prev.skins[skinId];
      if (prev.playerStats.coins >= skin.price && !skin.unlocked) {
        return {
          ...prev,
          skins: {
            ...prev.skins,
            [skinId]: { ...skin, unlocked: true }
          },
          playerStats: {
            ...prev.playerStats,
            coins: prev.playerStats.coins - skin.price
          }
        };
      }
      return prev;
    });
  }, []);

  const handleThemePurchase = useCallback((themeId: string) => {
    setGameState(prev => {
      const theme = prev.themes[themeId];
      if (prev.playerStats.coins >= theme.price && !theme.unlocked) {
        return {
          ...prev,
          themes: {
            ...prev.themes,
            [themeId]: { ...theme, unlocked: true }
          },
          playerStats: {
            ...prev.playerStats,
            coins: prev.playerStats.coins - theme.price
          }
        };
      }
      return prev;
    });
  }, []);

  const handleSkinEquip = useCallback((skinId: string) => {
    setGameState(prev => ({
      ...prev,
      currentSkin: skinId
    }));
  }, []);

  const handleThemeEquip = useCallback((themeId: string) => {
    setGameState(prev => ({
      ...prev,
      currentTheme: themeId
    }));
  }, []);

  const handleShopPurchase = useCallback((itemId: string, cost: number) => {
    setGameState(prev => {
      if (prev.playerStats.coins < cost) return prev;
      
      let newPlayerStats = {
        ...prev.playerStats,
        coins: prev.playerStats.coins - cost
      };
      
      // Handle different shop items
      switch (itemId) {
        case 'instant_xp':
          newPlayerStats = {
            ...newPlayerStats,
            xp: newPlayerStats.xp + 100,
            totalXp: newPlayerStats.totalXp + 100
          };
          const newLevel = calculateLevel(newPlayerStats.totalXp);
          newPlayerStats.level = newLevel;
          newPlayerStats.xpToNextLevel = getXpToNextLevel(newLevel, newPlayerStats.totalXp);
          break;
        case 'instant_xp_large':
          newPlayerStats = {
            ...newPlayerStats,
            xp: newPlayerStats.xp + 250,
            totalXp: newPlayerStats.totalXp + 250
          };
          const newLevelLarge = calculateLevel(newPlayerStats.totalXp);
          newPlayerStats.level = newLevelLarge;
          newPlayerStats.xpToNextLevel = getXpToNextLevel(newLevelLarge, newPlayerStats.totalXp);
          break;
        // Other items can be handled with game state flags for next game
      }
      
      return {
        ...prev,
        playerStats: newPlayerStats
      };
    });
  }, []);

  const applyPowerUp = useCallback((snake: Snake, powerUpType: PowerUpType): Snake => {
    const duration = 300 * gameState.upgrades.powerUpDuration.effect(gameState.upgrades.powerUpDuration.level);
    
    const existingPowerUp = snake.powerUps.find(p => p.type === powerUpType);
    if (existingPowerUp) {
      return {
        ...snake,
        powerUps: snake.powerUps.map(p => 
          p.type === powerUpType ? { ...p, timeLeft: duration } : p
        )
      };
    }

    return {
      ...snake,
      powerUps: [...snake.powerUps, { type: powerUpType, timeLeft: duration }]
    };
  }, [gameState.upgrades.powerUpDuration]);

  const updatePowerUps = useCallback((snake: Snake): Snake => {
    return {
      ...snake,
      powerUps: snake.powerUps
        .map(p => ({ ...p, timeLeft: p.timeLeft - 1 }))
        .filter(p => p.timeLeft > 0)
    };
  }, []);

  const gameLoop = useCallback(() => {
    setGameState(prev => {
      if (!prev.gameRunning || prev.gameOver) return prev;

      let newSnake1 = moveSnake(prev.snake1, prev.snake1.direction);
      let newSnake2 = prev.snake2 ? moveSnake(prev.snake2, prev.snake2.direction) : null;
      let newFood = [...prev.food];
      let newPowerUps = [...prev.powerUps];
      let newScore = prev.score;
      let gameOver = false;

      // Check wall collisions
      if (checkWallCollision(newSnake1.segments[0])) {
        const hasShield = newSnake1.powerUps.some(p => p.type === PowerUpType.SHIELD);
        if (!hasShield) {
          gameOver = true;
          triggerGameOver();
        }
      }

      if (newSnake2 && checkWallCollision(newSnake2.segments[0])) {
        const hasShield = newSnake2.powerUps.some(p => p.type === PowerUpType.SHIELD);
        if (!hasShield) {
          gameOver = true;
          triggerGameOver();
        }
      }

      // Check self collision
      if (checkCollision(newSnake1.segments[0], newSnake1.segments.slice(1))) {
        const hasInvincibility = newSnake1.powerUps.some(p => p.type === PowerUpType.INVINCIBILITY);
        if (!hasInvincibility) {
          gameOver = true;
          triggerGameOver();
        }
      }

      if (newSnake2 && checkCollision(newSnake2.segments[0], newSnake2.segments.slice(1))) {
        const hasInvincibility = newSnake2.powerUps.some(p => p.type === PowerUpType.INVINCIBILITY);
        if (!hasInvincibility) {
          gameOver = true;
          triggerGameOver();
        }
      }

      // Check snake-to-snake collision
      if (newSnake2) {
        if (checkCollision(newSnake1.segments[0], newSnake2.segments)) {
          gameOver = true;
          triggerGameOver();
        }
        if (checkCollision(newSnake2.segments[0], newSnake1.segments)) {
          gameOver = true;
          triggerGameOver();
        }
      }

      // Check food collision for snake 1
      const foodIndex1 = newFood.findIndex(food => 
        food.x === newSnake1.segments[0].x && food.y === newSnake1.segments[0].y
      );
      
      if (foodIndex1 !== -1) {
        // Trigger food collection effects
        triggerFoodCollected();
        addParticles(createFoodParticles(newSnake1.segments[0].x * 20, newSnake1.segments[0].y * 20));
        
        newFood.splice(foodIndex1, 1);
        const scoreMultiplier = prev.upgrades.scoreMultiplier.effect(prev.upgrades.scoreMultiplier.level);
        const doubleScore = newSnake1.powerUps.some(p => p.type === PowerUpType.DOUBLE_SCORE);
        const comboMultiplier = prev.combo.multiplier;
        const points = Math.floor(10 * scoreMultiplier * (doubleScore ? 2 : 1) * comboMultiplier);
        newScore += points;
        
        // Check for high score
        if (newScore > prev.playerStats.highScore) {
          checkHighScore(newScore);
        }
        
        // Calculate XP with combo bonus
        const baseXP = XP_PER_FOOD;
        const xpWithCombo = Math.floor(baseXP * comboMultiplier);
        addXP(xpWithCombo);
        
        // Add XP popup
        addXPPopup(newSnake1.segments[0].x, newSnake1.segments[0].y, xpWithCombo, prev.combo.count > 0);
        
        // Increment combo
        incrementCombo(newSnake1.segments[0].x, newSnake1.segments[0].y);
        
        // Generate new food
        const snakes = [newSnake1, ...(newSnake2 ? [newSnake2] : [])];
        newFood.push(generateFood(snakes, newFood));
      } else {
        newSnake1.segments.pop();
      }

      // Check food collision for snake 2
      if (newSnake2) {
        const foodIndex2 = newFood.findIndex(food => 
          food.x === newSnake2.segments[0].x && food.y === newSnake2.segments[0].y
        );
        
        if (foodIndex2 !== -1) {
          // Trigger food collection effects
          triggerFoodCollected();
          addParticles(createFoodParticles(newSnake2.segments[0].x * 20, newSnake2.segments[0].y * 20));
          
          newFood.splice(foodIndex2, 1);
          const scoreMultiplier = prev.upgrades.scoreMultiplier.effect(prev.upgrades.scoreMultiplier.level);
          const doubleScore = newSnake2.powerUps.some(p => p.type === PowerUpType.DOUBLE_SCORE);
          const comboMultiplier = prev.combo.multiplier;
          const points = Math.floor(10 * scoreMultiplier * (doubleScore ? 2 : 1) * comboMultiplier);
          newScore += points;
          
          // Check for high score
          if (newScore > prev.playerStats.highScore) {
            checkHighScore(newScore);
          }
          
          // Calculate XP with combo bonus
          const baseXP = XP_PER_FOOD;
          const xpWithCombo = Math.floor(baseXP * comboMultiplier);
          addXP(xpWithCombo);
          
          // Add XP popup
          addXPPopup(newSnake2.segments[0].x, newSnake2.segments[0].y, xpWithCombo, prev.combo.count > 0);
          
          // Increment combo
          incrementCombo(newSnake2.segments[0].x, newSnake2.segments[0].y);
          
          // Generate new food
          const snakes = [newSnake1, newSnake2];
          newFood.push(generateFood(snakes, newFood));
        } else {
          newSnake2.segments.pop();
        }
      }

      // Check power-up collisions
      newPowerUps = newPowerUps.filter(powerUp => {
        const snake1Hit = powerUp.position.x === newSnake1.segments[0].x && 
                         powerUp.position.y === newSnake1.segments[0].y;
        const snake2Hit = newSnake2 && 
                         powerUp.position.x === newSnake2.segments[0].x && 
                         powerUp.position.y === newSnake2.segments[0].y;

        if (snake1Hit) {
          newSnake1 = applyPowerUp(newSnake1, powerUp.type);
          triggerPowerUp();
          addParticles(createPowerUpParticles(powerUp.position.x * 20, powerUp.position.y * 20));
          addXP(XP_PER_POWER_UP);
          return false;
        }
        
        if (snake2Hit) {
          newSnake2 = applyPowerUp(newSnake2!, powerUp.type);
          triggerPowerUp();
          addParticles(createPowerUpParticles(powerUp.position.x * 20, powerUp.position.y * 20));
          addXP(XP_PER_POWER_UP);
          return false;
        }
        
        return true;
      });

      // Generate new power-ups
      const spawnRate = 0.15 + (prev.upgrades.powerUpSpawn.effect(prev.upgrades.powerUpSpawn.level) / 100);
      if (Math.random() < spawnRate) {
        const snakes = [newSnake1, ...(newSnake2 ? [newSnake2] : [])];
        const newPowerUp = generatePowerUp(snakes, newFood, newPowerUps);
        if (newPowerUp) {
          newPowerUps.push(newPowerUp);
        }
      }

      // Update power-ups
      newSnake1 = updatePowerUps(newSnake1);
      if (newSnake2) {
        newSnake2 = updatePowerUps(newSnake2);
      }

      // Update high score and save progress
      let newPlayerStats = prev.playerStats;
      if (newScore > prev.playerStats.highScore) {
        newPlayerStats = { ...newPlayerStats, highScore: newScore };
      }

      // Update food eaten count
      const foodEaten = (foodIndex1 !== -1 ? 1 : 0) + (foodIndex2 !== -1 ? 1 : 0);
      newPlayerStats = { ...newPlayerStats, totalFoodEaten: newPlayerStats.totalFoodEaten + foodEaten };
      
      if (gameOver) {
        newPlayerStats = { ...newPlayerStats, totalDeaths: newPlayerStats.totalDeaths + 1 };
        // Award coins based on performance before ending game
        awardCoins(newScore, prev.combo);
        
        return {
          ...prev,
          gameOver: true,
          gameRunning: false,
          playerStats: newPlayerStats
        };
      }

      return {
        ...prev,
        snake1: newSnake1,
        snake2: newSnake2,
        food: newFood,
        powerUps: newPowerUps,
        score: newScore,
        playerStats: newPlayerStats
      };
    });
  }, [addXP, applyPowerUp, updatePowerUps, addXPPopup, incrementCombo, awardCoins, triggerFoodCollected, triggerPowerUp, triggerGameOver, addParticles, checkHighScore]);

  // Animation loop for updating popups and combo timer
  const animationLoop = useCallback(() => {
    const currentTime = Date.now();
    
    setGameState(prev => {
      // Filter out expired popups
      const activePopups = prev.xpPopups.filter(popup => 
        currentTime - popup.timestamp < 1500
      );
      
      // Filter out expired coin animations
      const activeCoinAnimations = prev.coinAnimations.filter(animation =>
        currentTime - animation.timestamp < 2000
      );
      
      // Filter out expired achievement toasts
      const activeToasts = prev.achievementToasts.filter(toast =>
        currentTime - toast.timestamp < 5000
      );
      
      // Check if combo should expire
      let newCombo = prev.combo;
      if (prev.combo.count > 0 && currentTime - prev.combo.lastCollectionTime > COMBO_TIMEOUT) {
        newCombo = {
          ...prev.combo,
          count: 0,
          multiplier: 1
        };
      }
      
      return {
        ...prev,
        xpPopups: activePopups,
        coinAnimations: activeCoinAnimations,
        achievementToasts: activeToasts,
        combo: newCombo
      };
    });
    
    animationFrameRef.current = requestAnimationFrame(animationLoop);
  }, []);

  // Check achievements periodically
  useEffect(() => {
    checkAchievements();
  }, [gameState.playerStats, gameState.score, gameState.combo, checkAchievements]);

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (!gameState.gameRunning && !gameState.gameOver) return;
    
    setGameState(prev => {
      const newState = { ...prev };
      
      // Snake 1 controls (Arrow keys)
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          if (newState.snake1.direction.y !== 1) {
            newState.snake1.direction = { x: 0, y: -1 };
          }
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (newState.snake1.direction.y !== -1) {
            newState.snake1.direction = { x: 0, y: 1 };
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (newState.snake1.direction.x !== 1) {
            newState.snake1.direction = { x: -1, y: 0 };
          }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (newState.snake1.direction.x !== -1) {
            newState.snake1.direction = { x: 1, y: 0 };
          }
          break;
      }

      // Snake 2 controls (WASD)
      if (newState.snake2) {
        switch (e.key.toLowerCase()) {
          case 'w':
            e.preventDefault();
            if (newState.snake2.direction.y !== 1) {
              newState.snake2.direction = { x: 0, y: -1 };
            }
            break;
          case 's':
            e.preventDefault();
            if (newState.snake2.direction.y !== -1) {
              newState.snake2.direction = { x: 0, y: 1 };
            }
            break;
          case 'a':
            e.preventDefault();
            if (newState.snake2.direction.x !== 1) {
              newState.snake2.direction = { x: -1, y: 0 };
            }
            break;
          case 'd':
            e.preventDefault();
            if (newState.snake2.direction.x !== -1) {
              newState.snake2.direction = { x: 1, y: 0 };
            }
            break;
        }
      }

      // Game controls
      if (e.key === ' ') {
        e.preventDefault();
        if (gameState.gameOver) {
          startGame();
        }
      }

      return newState;
    });
  }, [gameState.gameRunning, gameState.gameOver]);

  const buyUpgrade = (upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades[upgradeId];
      const result = purchaseUpgrade(upgrade, prev.playerStats.xp);
      
      if (result.success) {
        return {
          ...prev,
          upgrades: {
            ...prev.upgrades,
            [upgradeId]: result.upgrade
          },
          playerStats: {
            ...prev.playerStats,
            xp: result.remainingXp
          }
        };
      }
      
      return prev;
    });
  };

  useEffect(() => {
    if (gameState.gameRunning) {
      const hasSpeedBoost = gameState.snake1.powerUps.some(p => p.type === PowerUpType.SPEED_BOOST) ||
                           (gameState.snake2?.powerUps.some(p => p.type === PowerUpType.SPEED_BOOST));
      const hasSlowMotion = gameState.snake1.powerUps.some(p => p.type === PowerUpType.SLOW_MOTION) ||
                           (gameState.snake2?.powerUps.some(p => p.type === PowerUpType.SLOW_MOTION));
      
      let speed = gameState.gameSpeed;
      if (hasSpeedBoost) speed *= 0.7;
      if (hasSlowMotion) speed *= 1.5;
      
      gameLoopRef.current = setInterval(gameLoop, speed);
      return () => {
        if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      };
    }
  }, [gameLoop, gameState.gameRunning, gameState.gameSpeed, gameState.snake1.powerUps, gameState.snake2?.powerUps]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    animationFrameRef.current = requestAnimationFrame(animationLoop);
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animationLoop]);

  useEffect(() => {
    saveProgress();
  }, [saveProgress]);

  const currentTheme = gameState.themes[gameState.currentTheme];
  const currentSkin = gameState.skins[gameState.currentSkin];

  const renderCell = (x: number, y: number) => {
    const isSnake1Head = gameState.snake1.segments[0]?.x === x && gameState.snake1.segments[0]?.y === y;
    const isSnake1Body = gameState.snake1.segments.slice(1).some(segment => segment.x === x && segment.y === y);
    const isSnake2Head = gameState.snake2?.segments[0]?.x === x && gameState.snake2?.segments[0]?.y === y;
    const isSnake2Body = gameState.snake2?.segments.slice(1).some(segment => segment.x === x && segment.y === y);
    const isFood = gameState.food.some(food => food.x === x && food.y === y);
    const powerUp = gameState.powerUps.find(p => p.position.x === x && p.position.y === y);
    
    let className = 'aspect-square rounded-sm transition-all duration-150 ';
    
    if (isSnake1Head) {
      className += `${currentSkin.headColor} shadow-lg transform scale-110 relative`;
    } else if (isSnake1Body) {
      className += `${currentSkin.bodyColor}`;
    } else if (isSnake2Head) {
      className += `bg-gradient-to-br ${gameState.snake2!.color} shadow-lg transform scale-110`;
    } else if (isSnake2Body) {
      className += `bg-gradient-to-br from-blue-300 to-blue-500`;
    } else if (isFood) {
      className += `${currentTheme.foodColor} shadow-lg animate-pulse rounded-full`;
    } else if (powerUp) {
      className += `bg-gradient-to-br ${getPowerUpColor(powerUp.type)} shadow-lg animate-bounce rounded-full flex items-center justify-center text-xs`;
    } else {
      className += 'bg-white/20';
    }
    
    return (
      <div key={`${x}-${y}`} className={className}>
        {powerUp && (
          <span className="text-white font-bold">
            {getPowerUpEmoji(powerUp.type)}
          </span>
        )}
        {(isSnake1Head || isSnake2Head) && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-white rounded-full"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <ScreenShake intensity={animations.shakeIntensity} duration={animations.shakeDuration} trigger={animations.shakeTriggered}>
      <div className={`min-h-screen ${currentTheme.backgroundColor} p-4 transition-all duration-500`}>
      <div className="max-w-7xl mx-auto">
        {/* Fullscreen Toggle */}
        <FullscreenToggle />
        
        {/* Top Bar with Coins */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <PulsingElement isActive={gameState.playerStats.coins > 0}>
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl px-6 py-3">
              <div className="flex items-center gap-3">
                <Coins className="w-6 h-6 text-orange-600" />
                <div>
                  <div className="text-sm text-gray-600 font-medium">Coins</div>
                  <div className="text-xl font-bold text-orange-600">{gameState.playerStats.coins}</div>
                </div>
              </div>
            </div>
            </PulsingElement>
            
            {/* Combo Display */}
            {gameState.combo.count > 0 && (
              <PulsingElement isActive={true} color="orange" intensity={0.5}>
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl shadow-xl px-6 py-3">
                <div className="flex items-center gap-3 text-white">
                  <Zap className="w-6 h-6" />
                  <div>
                    <div className="text-sm font-medium">Combo</div>
                    <div className="text-xl font-bold">{gameState.combo.count}x</div>
                  </div>
                  <div className="text-sm opacity-90">
                    {gameState.combo.multiplier.toFixed(1)}x Points
                  </div>
                </div>
              </div>
              </PulsingElement>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <AnimatedButton
              onClick={() => setGameState(prev => ({ ...prev, showCustomization: true }))}
              variant="secondary"
              size="md"
            >
              <Settings className="w-5 h-5" />
              Customize
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => setGameState(prev => ({ ...prev, showShop: true }))}
              variant="primary"
              size="md"
            >
              <ShoppingCart className="w-5 h-5" />
              Shop
            </AnimatedButton>
            </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Stats & Upgrades */}
          <div className="space-y-4">
            {/* Player Stats */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Player Stats</h2>
              </div>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm">
                    <span>Level {gameState.playerStats.level}</span>
                    <span>{gameState.playerStats.xp} XP</span>
                  </div>
                  <ProgressBar
                    value={gameState.playerStats.xp}
                    max={gameState.playerStats.xp + gameState.playerStats.xpToNextLevel}
                    color="orange"
                    height="h-2"
                    animated={true}
                    className="mt-1"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {gameState.playerStats.xpToNextLevel} XP to next level
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600">High Score</div>
                    <div className="font-bold text-orange-600">{gameState.playerStats.highScore}</div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <div className="text-xs text-gray-600">Games</div>
                    <div className="font-bold text-black">{gameState.playerStats.gamesPlayed}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Upgrades */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Quick Upgrades</h2>
              </div>
              
              <div className="space-y-2">
                {Object.values(gameState.upgrades).slice(0, 3).map(upgrade => (
                  <div key={upgrade.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="text-sm font-medium">{upgrade.name}</div>
                      <div className="text-xs text-gray-600">Lv.{upgrade.level}/{upgrade.maxLevel}</div>
                    </div>
                    <AnimatedButton
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={!canAffordUpgrade(upgrade, gameState.playerStats.xp)}
                      size="sm"
                      variant="primary"
                    >
                      {calculateUpgradeCost(upgrade)} XP
                    </AnimatedButton>
                  </div>
                ))}
              </div>
              
              <AnimatedButton
                onClick={() => setShowUpgrades(!showUpgrades)}
                variant="secondary"
                size="md"
                className="w-full mt-4"
              >
                {showUpgrades ? 'Hide' : 'Show'} All Upgrades
              </AnimatedButton>
            </div>

            {/* Power-ups Status */}
            {(gameState.snake1.powerUps.length > 0 || (gameState.snake2?.powerUps.length || 0) > 0) && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                    <Zap className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Active Power-ups</h2>
                </div>
                
                <div className="space-y-2">
                  {gameState.snake1.powerUps.map((powerUp, index) => (
                    <div key={index} className="flex items-center justify-between bg-orange-50 rounded-lg p-2">
                      <span className="text-sm">{getPowerUpEmoji(powerUp.type)} Snake 1</span>
                      <span className="text-xs text-gray-600">{Math.ceil(powerUp.timeLeft / 60)}s</span>
                    </div>
                  ))}
                  {gameState.snake2?.powerUps.map((powerUp, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-100 rounded-lg p-2">
                      <span className="text-sm">{getPowerUpEmoji(powerUp.type)} Snake 2</span>
                      <span className="text-xs text-gray-600">{Math.ceil(powerUp.timeLeft / 60)}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Game Area */}
          <div className="lg:col-span-2">
            <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              {/* Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl">
                    <Gamepad2 className="w-8 h-8 text-white" />
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-black bg-clip-text text-transparent">
                    RPG Snake
                  </h1>
                </div>
                
                {/* Score Display */}
                <div className="flex justify-center gap-6 mb-4">
                  <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl px-6 py-3">
                    <div className="text-sm text-gray-600 font-medium">Score</div>
                    <div className="text-2xl font-bold text-orange-600">{gameState.score}</div>
                  </div>
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl px-6 py-3">
                    <div className="text-sm text-gray-600 font-medium flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      High Score
                    </div>
                    <div className="text-2xl font-bold text-black">{gameState.playerStats.highScore}</div>
                  </div>
                </div>

                {/* Mode Toggle */}
                <div className="flex justify-center gap-2 mb-4">
                  <button
                    onClick={toggleDualMode}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                      !gameState.dualMode 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <User className="w-4 h-4" />
                    Single Player
                  </button>
                  <button
                    onClick={toggleDualMode}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 ${
                      gameState.dualMode 
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    Dual Player
                  </button>
                </div>
              </div>

              {/* Game Board */}
              <div className="relative mb-6">
                <div 
                  className={`grid gap-1 ${currentTheme.gridColor} p-4 rounded-2xl shadow-inner mx-auto border-2`}
                  style={{ 
                    gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                    aspectRatio: '1/1',
                    maxWidth: '500px'
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                    const x = index % GRID_SIZE;
                    const y = Math.floor(index / GRID_SIZE);
                    return renderCell(x, y);
                  })}
                  
                  {/* Coin Animations */}
                  {gameState.coinAnimations.map(animation => (
                    <CoinAnimationComponent
                      key={animation.id}
                      animation={animation}
                      gridSize={GRID_SIZE}
                    />
                  ))}
                  
                  {/* XP Popups */}
                  {gameState.xpPopups.map(popup => (
                    <XPPopupComponent
                      key={popup.id}
                      popup={popup}
                      gridSize={GRID_SIZE}
                      cellSize={20}
                    />
                  ))}
                </div>
                
                {/* Game Over Overlay */}
                {gameState.gameOver && (
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <div className="bg-white rounded-2xl p-8 text-center shadow-2xl">
                      <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
                      <p className="text-gray-600 mb-6">Final Score: <span className="font-bold text-orange-600">{gameState.score}</span></p>
                      <AnimatedButton
                        onClick={startGame}
                        variant="primary"
                        size="lg"
                      >
                        Play Again
                      </AnimatedButton>
                    </div>
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="text-center">
                {!gameState.gameRunning && !gameState.gameOver ? (
                  <AnimatedButton
                    onClick={startGame}
                    variant="primary"
                    size="lg"
                    className="mx-auto mb-6"
                  >
                    <Play className="w-6 h-6" />
                    Start Game
                  </AnimatedButton>
                ) : (
                  <AnimatedButton
                    onClick={resetGame}
                    variant="secondary"
                    size="md"
                    className="mx-auto mb-6"
                  >
                    <RotateCcw className="w-5 h-5" />
                    Reset
                  </AnimatedButton>
                )}
                
                {/* Instructions */}
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-800 mb-3">Controls</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <div className="font-medium mb-2">Snake 1 (Green)</div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">↑</kbd>
                          <span>Up</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">↓</kbd>
                          <span>Down</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">←</kbd>
                          <span>Left</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">→</kbd>
                          <span>Right</span>
                        </div>
                      </div>
                    </div>
                    {gameState.dualMode && (
                      <div>
                        <div className="font-medium mb-2">Snake 2 (Blue)</div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">W</kbd>
                            <span>Up</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">S</kbd>
                            <span>Down</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">A</kbd>
                            <span>Left</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <kbd className="px-2 py-1 bg-white rounded shadow text-xs font-mono">D</kbd>
                            <span>Right</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Upgrades */}
          <div className="space-y-4">
            {showUpgrades && (
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                    <ShoppingCart className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800">Upgrade Shop</h2>
                </div>
                
                <div className="space-y-3">
                  {Object.values(gameState.upgrades).map(upgrade => (
                    <div key={upgrade.id} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="font-medium text-sm">{upgrade.name}</div>
                          <div className="text-xs text-gray-600">{upgrade.description}</div>
                          <div className="text-xs text-orange-600 mt-1">
                            Level {upgrade.level}/{upgrade.maxLevel}
                          </div>
                        </div>
                        <AnimatedButton
                          onClick={() => buyUpgrade(upgrade.id)}
                          disabled={!canAffordUpgrade(upgrade, gameState.playerStats.xp)}
                          size="sm"
                          variant="primary"
                        >
                          {upgrade.level >= upgrade.maxLevel ? 'MAX' : `${calculateUpgradeCost(upgrade)} XP`}
                        </AnimatedButton>
                      </div>
                      <ProgressBar
                        value={upgrade.level}
                        max={upgrade.maxLevel}
                        color="orange"
                        height="h-1"
                        animated={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Access Buttons */}
            <div className="space-y-2">
              <AnimatedButton onClick={() => setGameState(prev => ({ ...prev, showAchievements: true }))} variant="secondary" size="md" className="w-full">
                <Trophy className="w-5 h-5" />
                Achievements
              </AnimatedButton>
              <AnimatedButton onClick={() => setGameState(prev => ({ ...prev, showStats: true }))} variant="secondary" size="md" className="w-full">
                <BarChart3 className="w-5 h-5" />
                Statistics
              </AnimatedButton>
            </div>

            {/* Power-up Guide */}
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Power-ups</h2>
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span>⚡</span>
                  <span>Speed Boost</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🛡️</span>
                  <span>Invincibility</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🧲</span>
                  <span>Food Magnet</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>💎</span>
                  <span>Double Score</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>🐌</span>
                  <span>Slow Motion</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>⭐</span>
                  <span>Shield</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Particle System */}
        <ParticleSystem particles={particles} onParticleComplete={removeParticle} />
        
        {/* Flash Effect */}
        <FlashEffect trigger={animations.flashTriggered} />
        
        {/* Congratulatory Animation */}
        <CongratulatoryAnimation
          trigger={animations.congratsTriggered}
          type={animations.congratsType}
          title={animations.congratsTitle}
          subtitle={animations.congratsSubtitle}
        />
        
        {/* Achievement Toasts */}
        {gameState.achievementToasts.map(toast => (
          <AchievementToast
            key={toast.id}
            toast={toast}
            onComplete={() => {
              setGameState(prev => ({
                ...prev,
                achievementToasts: prev.achievementToasts.filter(t => t.id !== toast.id)
              }));
            }}
          />
        ))}
        
        {/* Customization Modal */}
        <Customization
          isOpen={gameState.showCustomization}
          onClose={() => setGameState(prev => ({ ...prev, showCustomization: false }))}
          skins={gameState.skins}
          themes={gameState.themes}
          currentSkin={gameState.currentSkin}
          currentTheme={gameState.currentTheme}
          playerStats={gameState.playerStats}
          onPurchaseSkin={handleSkinPurchase}
          onPurchaseTheme={handleThemePurchase}
          onEquipSkin={handleSkinEquip}
          onEquipTheme={handleThemeEquip}
        />
        
        {/* Achievements Modal */}
        <Achievements
          isOpen={gameState.showAchievements}
          onClose={() => setGameState(prev => ({ ...prev, showAchievements: false }))}
          achievements={gameState.achievements}
          challenges={gameState.challenges}
          playerStats={gameState.playerStats}
          gameState={gameState}
        />
        
        {/* Statistics Modal */}
        <Statistics
          isOpen={gameState.showStats}
          onClose={() => setGameState(prev => ({ ...prev, showStats: false }))}
          statistics={gameState.statistics}
          playerStats={gameState.playerStats}
        />
        
        {/* Shop Modal */}
        <Shop
          isOpen={gameState.showShop}
          onClose={() => setGameState(prev => ({ ...prev, showShop: false }))}
          playerStats={gameState.playerStats}
          onPurchase={handleShopPurchase}
        />
      </div>
    </div>
    </ScreenShake>
  );
}

export default App;