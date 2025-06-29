import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  ShoppingCart, 
  Trophy, 
  BarChart3, 
  Palette, 
  Coins, 
  Star, 
  Zap, 
  Shield, 
  TrendingUp, 
  Target,
  Gamepad2,
  Users,
  User,
  Gift
} from 'lucide-react';

// Import all components
import { Shop } from './components/Shop';
import { Achievements } from './components/Achievements';
import { Statistics } from './components/Statistics';
import { Customization } from './components/Customization';
import { AchievementToast } from './components/AchievementToast';
import { AnimatedButton } from './components/AnimatedButton';
import { ProgressBar } from './components/ProgressBar';
import { XPPopup as XPPopupComponent } from './components/XPPopup';
import { CoinAnimation } from './components/CoinAnimation';
import { FullscreenToggle } from './components/FullscreenToggle';
import { ScreenShake } from './components/ScreenShake';
import { FlashEffect } from './components/FlashEffect';
import { CongratulatoryAnimation } from './components/CongratulatoryAnimation';
import { ParticleSystem, createFoodParticles, createPowerUpParticles, createAchievementParticles } from './components/ParticleSystem';

// Import game logic and data
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

import { 
  Position, 
  Snake, 
  PowerUp, 
  PowerUpType, 
  GameState, 
  PlayerStats, 
  ComboState, 
  XPPopup, 
  CoinAnimation as CoinAnimationType,
  Achievement,
  Challenge,
  AchievementToast as AchievementToastType,
  SnakeSkin,
  GameTheme,
  StatsPeriod
} from './types';

import { createUpgrades, calculateUpgradeCost, canAffordUpgrade, purchaseUpgrade } from './upgrades';
import { createAchievements, createChallenges } from './data/achievements';
import { createSkins, createThemes } from './data/customization';
import { useGameAnimations } from './hooks/useGameAnimations';

function App() {
  // Game animation hooks
  const {
    animations,
    triggerGameOver,
    triggerPowerUp,
    triggerFoodCollected,
    triggerLevelUp,
    triggerAchievement,
    triggerHighScore
  } = useGameAnimations();

  // Particle system state
  const [particles, setParticles] = useState<any[]>([]);

  // Initial game state
  const [gameState, setGameState] = useState<GameState>(() => {
    const savedStats = localStorage.getItem('snakePlayerStats');
    const savedAchievements = localStorage.getItem('snakeAchievements');
    const savedChallenges = localStorage.getItem('snakeChallenges');
    const savedSkins = localStorage.getItem('snakeSkins');
    const savedThemes = localStorage.getItem('snakeThemes');
    const savedCurrentSkin = localStorage.getItem('snakeCurrentSkin');
    const savedCurrentTheme = localStorage.getItem('snakeCurrentTheme');
    const savedStatistics = localStorage.getItem('snakeStatistics');
    
    const initialPlayerStats: PlayerStats = savedStats ? JSON.parse(savedStats) : {
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
      longestSnake: 3,
      totalDeaths: 0,
      averageScore: 0,
      dailyStreak: 0,
      lastPlayDate: new Date().toISOString().split('T')[0]
    };

    const achievements = savedAchievements ? JSON.parse(savedAchievements) : createAchievements();
    const challenges = savedChallenges ? JSON.parse(savedChallenges) : createChallenges();
    const skins = savedSkins ? JSON.parse(savedSkins) : createSkins();
    const themes = savedThemes ? JSON.parse(savedThemes) : createThemes();

    const defaultStats: StatsPeriod = {
      daily: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 },
      weekly: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 },
      monthly: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 },
      allTime: { gamesPlayed: 0, averageScore: 0, highScore: 0, totalCoins: 0, totalXP: 0, averageCombo: 0, playTime: 0 }
    };

    return {
      snake1: {
        segments: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        color: 'bg-green-500',
        powerUps: [],
        skin: skins[savedCurrentSkin || 'default']
      },
      snake2: null,
      food: [{ x: 15, y: 15 }],
      powerUps: [],
      gameRunning: false,
      gameOver: false,
      dualMode: false,
      score: 0,
      playerStats: initialPlayerStats,
      upgrades: createUpgrades(),
      gameSpeed: BASE_GAME_SPEED,
      combo: {
        count: 0,
        multiplier: 1,
        lastCollectionTime: 0,
        maxCombo: 0
      },
      xpPopups: [],
      coinAnimations: [],
      showShop: false,
      achievements,
      challenges,
      achievementToasts: [],
      skins,
      themes,
      skillTree: {
        speed: { id: 'speed', name: 'Speed', description: 'Increase movement speed', level: 0, maxLevel: 10, cost: 50, effect: (level) => level * 0.1 },
        agility: { id: 'agility', name: 'Agility', description: 'Improve turning ability', level: 0, maxLevel: 8, cost: 75, effect: (level) => level * 0.15 },
        efficiency: { id: 'efficiency', name: 'Efficiency', description: 'Better resource collection', level: 0, maxLevel: 6, cost: 100, effect: (level) => level * 0.2 },
        luck: { id: 'luck', name: 'Luck', description: 'Increase power-up spawn rate', level: 0, maxLevel: 5, cost: 125, effect: (level) => level * 0.25 }
      },
      currentTheme: savedCurrentTheme || 'classic',
      currentSkin: savedCurrentSkin || 'default',
      showCustomization: false,
      showAchievements: false,
      showStats: false,
      statistics: savedStatistics ? JSON.parse(savedStatistics) : defaultStats,
      gameStartTime: Date.now()
    };
  });

  const gameLoopRef = useRef<number>();
  const keysRef = useRef<Set<string>>(new Set());

  // Save game state to localStorage
  useEffect(() => {
    localStorage.setItem('snakePlayerStats', JSON.stringify(gameState.playerStats));
    localStorage.setItem('snakeAchievements', JSON.stringify(gameState.achievements));
    localStorage.setItem('snakeChallenges', JSON.stringify(gameState.challenges));
    localStorage.setItem('snakeSkins', JSON.stringify(gameState.skins));
    localStorage.setItem('snakeThemes', JSON.stringify(gameState.themes));
    localStorage.setItem('snakeCurrentSkin', gameState.currentSkin);
    localStorage.setItem('snakeCurrentTheme', gameState.currentTheme);
    localStorage.setItem('snakeStatistics', JSON.stringify(gameState.statistics));
  }, [gameState.playerStats, gameState.achievements, gameState.challenges, gameState.skins, gameState.themes, gameState.currentSkin, gameState.currentTheme, gameState.statistics]);

  // Keyboard event handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
      
      // Prevent default browser behavior for game keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' '].includes(e.key)) {
        e.preventDefault();
      }

      // Game controls
      if (e.key === ' ') {
        if (gameState.gameOver) {
          restartGame();
        } else {
          toggleGame();
        }
      }

      if (e.key === 'Escape') {
        if (gameState.showShop) setGameState(prev => ({ ...prev, showShop: false }));
        if (gameState.showAchievements) setGameState(prev => ({ ...prev, showAchievements: false }));
        if (gameState.showCustomization) setGameState(prev => ({ ...prev, showCustomization: false }));
        if (gameState.showStats) setGameState(prev => ({ ...prev, showStats: false }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState.gameOver, gameState.showShop, gameState.showAchievements, gameState.showCustomization, gameState.showStats]);

  // Game loop
  useEffect(() => {
    if (!gameState.gameRunning || gameState.gameOver) return;

    const gameLoop = () => {
      updateGame();
      gameLoopRef.current = setTimeout(gameLoop, gameState.gameSpeed);
    };

    gameLoopRef.current = setTimeout(gameLoop, gameState.gameSpeed);

    return () => {
      if (gameLoopRef.current) {
        clearTimeout(gameLoopRef.current);
      }
    };
  }, [gameState.gameRunning, gameState.gameOver, gameState.gameSpeed]);

  // XP and coin popup cleanup
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setGameState(prev => ({
        ...prev,
        xpPopups: prev.xpPopups.filter(popup => now - popup.timestamp < 1500),
        coinAnimations: prev.coinAnimations.filter(anim => now - anim.timestamp < 2000)
      }));
    }, 100);

    return () => clearInterval(cleanupInterval);
  }, []);

  const updateGame = useCallback(() => {
    setGameState(prevState => {
      if (!prevState.gameRunning || prevState.gameOver) return prevState;

      let newState = { ...prevState };
      
      // Handle snake movement
      const direction = getSnakeDirection();
      if (direction) {
        newState.snake1 = moveSnake(newState.snake1, direction);
      } else {
        newState.snake1 = moveSnake(newState.snake1, newState.snake1.direction);
      }

      const head = newState.snake1.segments[0];

      // Check wall collision
      if (checkWallCollision(head)) {
        return handleGameOver(newState);
      }

      // Check self collision
      if (checkCollision(head, newState.snake1.segments.slice(1))) {
        return handleGameOver(newState);
      }

      // Check food collision
      const foodIndex = newState.food.findIndex(f => f.x === head.x && f.y === head.y);
      if (foodIndex !== -1) {
        triggerFoodCollected();
        
        // Remove eaten food
        newState.food.splice(foodIndex, 1);
        
        // Add new segment (grow snake)
        newState.snake1.segments.push({ ...newState.snake1.segments[newState.snake1.segments.length - 1] });
        
        // Update combo
        const now = Date.now();
        if (now - newState.combo.lastCollectionTime < 3000) {
          newState.combo.count++;
        } else {
          newState.combo.count = 1;
        }
        newState.combo.multiplier = Math.min(1 + (newState.combo.count - 1) * 0.2, 3);
        newState.combo.lastCollectionTime = now;
        newState.combo.maxCombo = Math.max(newState.combo.maxCombo, newState.combo.count);
        
        // Calculate points and XP
        const basePoints = 10;
        const points = Math.floor(basePoints * newState.combo.multiplier);
        const xp = Math.floor(XP_PER_FOOD * newState.combo.multiplier);
        
        newState.score += points;
        
        // Add XP popup
        newState.xpPopups.push({
          id: `xp-${Date.now()}`,
          x: head.x,
          y: head.y,
          value: xp,
          isCombo: newState.combo.count > 1,
          timestamp: Date.now()
        });

        // Add coin animation
        const coins = Math.floor(points / 10);
        if (coins > 0) {
          newState.coinAnimations.push({
            id: `coin-${Date.now()}`,
            x: head.x,
            y: head.y,
            value: coins,
            timestamp: Date.now()
          });
        }

        // Update player stats
        newState.playerStats.totalFoodEaten++;
        newState.playerStats.totalXp += xp;
        newState.playerStats.coins += coins;
        newState.playerStats.totalCoinsEarned += coins;
        newState.playerStats.longestSnake = Math.max(newState.playerStats.longestSnake, newState.snake1.segments.length);

        // Level up check
        const newLevel = calculateLevel(newState.playerStats.totalXp);
        if (newLevel > newState.playerStats.level) {
          newState.playerStats.level = newLevel;
          newState.playerStats.xpToNextLevel = getXpToNextLevel(newLevel, newState.playerStats.totalXp);
          newState.playerStats.coins += newLevel * 10; // Level up bonus
          triggerLevelUp(newLevel);
        } else {
          newState.playerStats.xp = newState.playerStats.totalXp - (newState.playerStats.totalXp - getXpToNextLevel(newState.playerStats.level, newState.playerStats.totalXp));
          newState.playerStats.xpToNextLevel = getXpToNextLevel(newState.playerStats.level, newState.playerStats.totalXp);
        }

        // Add particles
        const foodParticles = createFoodParticles(head.x * 20, head.y * 20);
        setParticles(prev => [...prev, ...foodParticles]);

        // Generate new food
        newState.food.push(generateFood([newState.snake1], newState.food));
        
        // Check for new achievements
        checkAchievements(newState);
      } else {
        // Remove tail if no food eaten
        newState.snake1.segments.pop();
      }

      // Check power-up collision
      const powerUpIndex = newState.powerUps.findIndex(p => p.position.x === head.x && p.position.y === head.y);
      if (powerUpIndex !== -1) {
        const powerUp = newState.powerUps[powerUpIndex];
        triggerPowerUp();
        
        // Remove collected power-up
        newState.powerUps.splice(powerUpIndex, 1);
        
        // Apply power-up effect
        applyPowerUpEffect(newState, powerUp.type);
        
        // Add particles
        const powerUpParticles = createPowerUpParticles(head.x * 20, head.y * 20);
        setParticles(prev => [...prev, ...powerUpParticles]);
      }

      // Generate power-ups occasionally
      if (Math.random() < 0.02) { // 2% chance per frame
        const newPowerUp = generatePowerUp([newState.snake1], newState.food, newState.powerUps);
        if (newPowerUp) {
          newState.powerUps.push(newPowerUp);
        }
      }

      // Update power-up durations
      newState.powerUps = newState.powerUps.map(powerUp => ({
        ...powerUp,
        duration: powerUp.duration ? powerUp.duration - 1 : undefined
      })).filter(powerUp => !powerUp.duration || powerUp.duration > 0);

      // Reset combo if too much time has passed
      if (Date.now() - newState.combo.lastCollectionTime > 5000) {
        newState.combo.count = 0;
        newState.combo.multiplier = 1;
      }

      return newState;
    });
  }, [triggerFoodCollected, triggerPowerUp, triggerLevelUp]);

  const getSnakeDirection = (): Position | null => {
    const keys = keysRef.current;
    
    // Player 1 controls (Arrow keys)
    if (keys.has('arrowup') || keys.has('w')) return { x: 0, y: -1 };
    if (keys.has('arrowdown') || keys.has('s')) return { x: 0, y: 1 };
    if (keys.has('arrowleft') || keys.has('a')) return { x: -1, y: 0 };
    if (keys.has('arrowright') || keys.has('d')) return { x: 1, y: 0 };
    
    return null;
  };

  const applyPowerUpEffect = (state: GameState, type: PowerUpType) => {
    const duration = 300; // 5 seconds at 60fps
    
    switch (type) {
      case PowerUpType.SPEED_BOOST:
        state.gameSpeed = Math.max(50, state.gameSpeed * 0.7);
        break;
      case PowerUpType.DOUBLE_SCORE:
        state.combo.multiplier *= 2;
        break;
      case PowerUpType.INVINCIBILITY:
        // Add invincibility power-up to snake
        state.snake1.powerUps.push({ type, timeLeft: duration });
        break;
      default:
        state.snake1.powerUps.push({ type, timeLeft: duration });
    }
  };

  const handleGameOver = (state: GameState): GameState => {
    triggerGameOver();
    
    const newState = { ...state };
    newState.gameOver = true;
    newState.gameRunning = false;
    
    // Update statistics
    newState.playerStats.gamesPlayed++;
    newState.playerStats.totalDeaths++;
    newState.playerStats.averageScore = Math.round(
      ((newState.playerStats.averageScore * (newState.playerStats.gamesPlayed - 1)) + newState.score) / newState.playerStats.gamesPlayed
    );
    
    // Check for high score
    if (newState.score > newState.playerStats.highScore) {
      newState.playerStats.highScore = newState.score;
      triggerHighScore(newState.score);
    }
    
    // Check achievements
    checkAchievements(newState);
    
    return newState;
  };

  const checkAchievements = (state: GameState) => {
    Object.values(state.achievements).forEach(achievement => {
      if (!achievement.unlocked && achievement.condition(state.playerStats, state)) {
        achievement.unlocked = true;
        achievement.dateUnlocked = new Date().toISOString();
        
        // Add coins reward
        state.playerStats.coins += achievement.reward;
        state.playerStats.totalCoinsEarned += achievement.reward;
        
        // Show toast
        state.achievementToasts.push({
          id: `toast-${Date.now()}`,
          achievement,
          timestamp: Date.now()
        });
        
        triggerAchievement(achievement.name);
        
        // Add particles
        const achievementParticles = createAchievementParticles(400, 300);
        setParticles(prev => [...prev, ...achievementParticles]);
      }
    });
  };

  const toggleGame = () => {
    setGameState(prev => ({
      ...prev,
      gameRunning: !prev.gameRunning,
      gameStartTime: !prev.gameRunning ? Date.now() : prev.gameStartTime
    }));
  };

  const restartGame = () => {
    setGameState(prev => ({
      ...prev,
      snake1: {
        segments: [{ x: 10, y: 10 }],
        direction: { x: 1, y: 0 },
        color: 'bg-green-500',
        powerUps: [],
        skin: prev.skins[prev.currentSkin]
      },
      snake2: null,
      food: [{ x: 15, y: 15 }],
      powerUps: [],
      gameRunning: false,
      gameOver: false,
      score: 0,
      gameSpeed: BASE_GAME_SPEED,
      combo: {
        count: 0,
        multiplier: 1,
        lastCollectionTime: 0,
        maxCombo: 0
      },
      xpPopups: [],
      coinAnimations: [],
      gameStartTime: Date.now()
    }));
  };

  const buyUpgrade = (upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades[upgradeId];
      const cost = calculateUpgradeCost(upgrade);
      
      if (prev.playerStats.coins >= cost) {
        const newUpgrades = { ...prev.upgrades };
        newUpgrades[upgradeId] = { ...upgrade, level: upgrade.level + 1 };
        
        return {
          ...prev,
          upgrades: newUpgrades,
          playerStats: {
            ...prev.playerStats,
            coins: prev.playerStats.coins - cost
          }
        };
      }
      return prev;
    });
  };

  const handleShopPurchase = (itemId: string, cost: number) => {
    setGameState(prev => ({
      ...prev,
      playerStats: {
        ...prev.playerStats,
        coins: prev.playerStats.coins - cost
      }
    }));
  };

  const handleSkinPurchase = (skinId: string) => {
    setGameState(prev => {
      const skin = prev.skins[skinId];
      if (prev.playerStats.coins >= skin.price) {
        const newSkins = { ...prev.skins };
        newSkins[skinId] = { ...skin, unlocked: true };
        
        return {
          ...prev,
          skins: newSkins,
          playerStats: {
            ...prev.playerStats,
            coins: prev.playerStats.coins - skin.price
          }
        };
      }
      return prev;
    });
  };

  const handleThemePurchase = (themeId: string) => {
    setGameState(prev => {
      const theme = prev.themes[themeId];
      if (prev.playerStats.coins >= theme.price) {
        const newThemes = { ...prev.themes };
        newThemes[themeId] = { ...theme, unlocked: true };
        
        return {
          ...prev,
          themes: newThemes,
          playerStats: {
            ...prev.playerStats,
            coins: prev.playerStats.coins - theme.price
          }
        };
      }
      return prev;
    });
  };

  const equipSkin = (skinId: string) => {
    setGameState(prev => ({
      ...prev,
      currentSkin: skinId,
      snake1: {
        ...prev.snake1,
        skin: prev.skins[skinId]
      }
    }));
  };

  const equipTheme = (themeId: string) => {
    setGameState(prev => ({
      ...prev,
      currentTheme: themeId
    }));
  };

  const removeToast = (toastId: string) => {
    setGameState(prev => ({
      ...prev,
      achievementToasts: prev.achievementToasts.filter(toast => toast.id !== toastId)
    }));
  };

  const handleParticleComplete = (particleId: string) => {
    setParticles(prev => prev.filter(p => p.id !== particleId));
  };

  const currentTheme = gameState.themes[gameState.currentTheme];
  const currentSkin = gameState.skins[gameState.currentSkin];

  return (
    <ScreenShake 
      intensity={animations.shakeIntensity} 
      duration={animations.shakeDuration} 
      trigger={animations.shakeTriggered}
    >
      <div className={`min-h-screen p-4 ${currentTheme.backgroundColor}`}>
        <FullscreenToggle />
        <FlashEffect trigger={animations.flashTriggered} />
        <CongratulatoryAnimation
          trigger={animations.congratsTriggered}
          type={animations.congratsType}
          title={animations.congratsTitle}
          subtitle={animations.congratsSubtitle}
        />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          {/* Left side - Coins and Level */}
          <div className="flex items-center gap-4">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-600">{gameState.playerStats.coins}</span>
              </div>
            </div>
            
            <div className="bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2 shadow-lg">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-600" />
                <span className="font-bold text-gray-800">Level {gameState.playerStats.level}</span>
              </div>
            </div>
            
            {gameState.combo.count > 1 && (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl px-4 py-2 shadow-lg animate-pulse">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-white" />
                  <span className="font-bold text-white">{gameState.combo.count}x Combo!</span>
                </div>
              </div>
            )}
          </div>

          {/* Center - Score */}
          <div className="bg-white/95 backdrop-blur-sm rounded-xl px-6 py-3 shadow-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{gameState.score}</div>
              <div className="text-sm text-gray-600">Score</div>
            </div>
          </div>

          {/* Right side - Menu buttons */}
          <div className="flex items-center gap-2">
            <AnimatedButton
              onClick={() => setGameState(prev => ({ ...prev, showShop: true }))}
              variant="secondary"
              size="sm"
            >
              <ShoppingCart className="w-4 h-4" />
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => setGameState(prev => ({ ...prev, showCustomization: true }))}
              variant="secondary"
              size="sm"
            >
              <Palette className="w-4 h-4" />
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => setGameState(prev => ({ ...prev, showAchievements: true }))}
              variant="secondary"
              size="sm"
            >
              <Trophy className="w-4 h-4" />
            </AnimatedButton>
            
            <AnimatedButton
              onClick={() => setGameState(prev => ({ ...prev, showStats: true }))}
              variant="secondary"
              size="sm"
            >
              <BarChart3 className="w-4 h-4" />
            </AnimatedButton>
          </div>
        </div>

        {/* Game Area */}
        <div className="flex justify-center">
          <div className="relative">
            {/* Game Grid */}
            <div 
              className={`grid gap-0 ${currentTheme.backgroundColor} p-4 rounded-2xl shadow-2xl border-4 ${currentTheme.gridColor}`}
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1.25rem)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1.25rem)`
              }}
            >
              {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
                const x = index % GRID_SIZE;
                const y = Math.floor(index / GRID_SIZE);
                
                // Check if this cell contains snake head
                const isSnakeHead = gameState.snake1.segments[0].x === x && gameState.snake1.segments[0].y === y;
                
                // Check if this cell contains snake body
                const isSnakeBody = gameState.snake1.segments.slice(1).some(segment => segment.x === x && segment.y === y);
                
                // Check if this cell contains food
                const isFood = gameState.food.some(food => food.x === x && food.y === y);
                
                // Check if this cell contains power-up
                const powerUp = gameState.powerUps.find(p => p.position.x === x && p.position.y === y);
                
                return (
                  <div
                    key={index}
                    className={`
                      w-5 h-5 border ${currentTheme.gridColor} border-opacity-10
                      ${isSnakeHead ? currentSkin.headColor + ' transform scale-110 rounded-lg shadow-lg' : ''}
                      ${isSnakeBody ? currentSkin.bodyColor + ' rounded-md' : ''}
                      ${isFood ? currentTheme.foodColor + ' rounded-full animate-pulse shadow-lg' : ''}
                      ${powerUp ? `${getPowerUpColor(powerUp.type)} rounded-lg animate-bounce shadow-lg` : ''}
                    `}
                  >
                    {powerUp && (
                      <div className="w-full h-full flex items-center justify-center text-xs">
                        {getPowerUpEmoji(powerUp.type)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* XP Popups */}
            {gameState.xpPopups.map(popup => (
              <XPPopupComponent
                key={popup.id}
                popup={popup}
                gridSize={GRID_SIZE}
                cellSize={20}
              />
            ))}

            {/* Coin Animations */}
            {gameState.coinAnimations.map(animation => (
              <CoinAnimation
                key={animation.id}
                animation={animation}
                gridSize={GRID_SIZE}
              />
            ))}

            {/* Game Over Overlay */}
            {gameState.gameOver && (
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <div className="bg-white rounded-xl p-8 text-center shadow-2xl">
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Game Over!</h2>
                  <p className="text-gray-600 mb-2">Final Score: <span className="font-bold text-orange-600">{gameState.score}</span></p>
                  <p className="text-gray-600 mb-6">Snake Length: <span className="font-bold text-green-600">{gameState.snake1.segments.length}</span></p>
                  
                  <div className="space-y-3">
                    <AnimatedButton onClick={restartGame} className="w-full">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Play Again
                    </AnimatedButton>
                    
                    <div className="text-sm text-gray-500">
                      Press Space to restart
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Game Controls */}
        <div className="mt-6 flex justify-center">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-center gap-4">
              {!gameState.gameRunning && !gameState.gameOver ? (
                <AnimatedButton onClick={toggleGame}>
                  <Play className="w-4 h-4 mr-2" />
                  Start Game
                </AnimatedButton>
              ) : gameState.gameRunning ? (
                <AnimatedButton onClick={toggleGame} variant="secondary">
                  <Pause className="w-4 h-4 mr-2" />
                  Pause
                </AnimatedButton>
              ) : null}
              
              <AnimatedButton onClick={restartGame} variant="secondary">
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </AnimatedButton>
            </div>
          </div>
        </div>

        {/* Controls Help */}
        <div className="mt-4">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-4 mx-auto max-w-2xl">
            <h3 className="font-bold text-gray-800 mb-2 text-center">Controls</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
              <div>
                <strong>Snake 1 (Green):</strong>
                <div className="mt-1">
                  <div>↑ Up</div>
                  <div>↓ Down</div>
                  <div>← Left</div>
                  <div>→ Right</div>
                </div>
              </div>
              <div>
                <strong>Game Controls:</strong>
                <div className="mt-1">
                  <div>Space: Start/Pause/Restart</div>
                  <div>Esc: Close menus</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="mt-6 max-w-md mx-auto">
          <ProgressBar
            value={gameState.playerStats.xp}
            max={gameState.playerStats.xp + gameState.playerStats.xpToNextLevel}
            label={`Level ${gameState.playerStats.level} Progress`}
            showPercentage
            animated
          />
        </div>

        {/* Quick Upgrades */}
        <div className="mt-6 max-w-4xl mx-auto">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-800">Quick Upgrades</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.values(gameState.upgrades).slice(0, 3).map(upgrade => {
                const cost = calculateUpgradeCost(upgrade);
                const canAfford = gameState.playerStats.coins >= cost;
                
                return (
                  <div key={upgrade.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold text-gray-800">{upgrade.name}</h4>
                        <p className="text-sm text-gray-600">Lv {upgrade.level}/{upgrade.maxLevel}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-orange-600 font-bold">{cost} XP</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{upgrade.description}</p>
                    <AnimatedButton
                      onClick={() => buyUpgrade(upgrade.id)}
                      disabled={!canAfford || upgrade.level >= upgrade.maxLevel}
                      size="sm"
                      className="w-full"
                    >
                      {upgrade.level >= upgrade.maxLevel ? 'Maxed' : 'Upgrade'}
                    </AnimatedButton>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-4 text-center">
              <button className="text-orange-600 hover:text-orange-700 text-sm font-semibold">
                Hide All Upgrades
              </button>
            </div>
          </div>
        </div>

        {/* Active Power-ups */}
        {gameState.snake1.powerUps.length > 0 && (
          <div className="mt-4 max-w-md mx-auto">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
              <h3 className="font-bold text-gray-800 mb-3 text-center flex items-center justify-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Power-ups
              </h3>
              <div className="space-y-2">
                {gameState.snake1.powerUps.map((powerUp, index) => (
                  <div key={index} className="flex items-center justify-between bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg p-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPowerUpEmoji(powerUp.type)}</span>
                      <span className="font-semibold text-gray-800 capitalize">
                        {powerUp.type.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-orange-600 font-semibold">
                      {Math.ceil(powerUp.timeLeft / 60)}s
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
        <Shop
          isOpen={gameState.showShop}
          onClose={() => setGameState(prev => ({ ...prev, showShop: false }))}
          playerStats={gameState.playerStats}
          onPurchase={handleShopPurchase}
        />

        <Achievements
          isOpen={gameState.showAchievements}
          onClose={() => setGameState(prev => ({ ...prev, showAchievements: false }))}
          achievements={gameState.achievements}
          challenges={gameState.challenges}
          playerStats={gameState.playerStats}
          gameState={gameState}
        />

        <Statistics
          isOpen={gameState.showStats}
          onClose={() => setGameState(prev => ({ ...prev, showStats: false }))}
          statistics={gameState.statistics}
          playerStats={gameState.playerStats}
        />

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
          onEquipSkin={equipSkin}
          onEquipTheme={equipTheme}
        />

        {/* Achievement Toasts */}
        {gameState.achievementToasts.map(toast => (
          <AchievementToast
            key={toast.id}
            toast={toast}
            onComplete={() => removeToast(toast.id)}
          />
        ))}

        {/* Particle System */}
        <ParticleSystem
          particles={particles}
          onParticleComplete={handleParticleComplete}
        />
      </div>
    </ScreenShake>
  );
}

export default App;