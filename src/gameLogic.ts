import { Position, Snake, PowerUp, PowerUpType, GameState } from './types';

export const GRID_SIZE = 20;
export const BASE_GAME_SPEED = 200;
export const XP_PER_FOOD = 10;
export const XP_PER_POWER_UP = 25;

export const generateFood = (snakes: Snake[], existingFood: Position[]): Position => {
  const occupiedPositions = new Set<string>();
  
  // Add snake segments
  snakes.forEach(snake => {
    snake.segments.forEach(segment => {
      occupiedPositions.add(`${segment.x},${segment.y}`);
    });
  });
  
  // Add existing food
  existingFood.forEach(food => {
    occupiedPositions.add(`${food.x},${food.y}`);
  });
  
  let newFood: Position;
  do {
    newFood = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (occupiedPositions.has(`${newFood.x},${newFood.y}`));
  
  return newFood;
};

export const generatePowerUp = (snakes: Snake[], food: Position[], existingPowerUps: PowerUp[]): PowerUp | null => {
  if (Math.random() > 0.15) return null; // 15% chance to spawn
  
  const occupiedPositions = new Set<string>();
  
  snakes.forEach(snake => {
    snake.segments.forEach(segment => {
      occupiedPositions.add(`${segment.x},${segment.y}`);
    });
  });
  
  food.forEach(f => occupiedPositions.add(`${f.x},${f.y}`));
  existingPowerUps.forEach(p => occupiedPositions.add(`${p.position.x},${p.position.y}`));
  
  let position: Position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (occupiedPositions.has(`${position.x},${position.y}`));
  
  const powerUpTypes = Object.values(PowerUpType);
  const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
  
  return {
    id: `powerup-${Date.now()}-${Math.random()}`,
    position,
    type: randomType,
    duration: 300 // 5 seconds at 60fps
  };
};

export const moveSnake = (snake: Snake, direction: Position): Snake => {
  const newSegments = [...snake.segments];
  const head = { ...newSegments[0] };
  
  head.x += direction.x;
  head.y += direction.y;
  
  newSegments.unshift(head);
  
  return {
    ...snake,
    segments: newSegments,
    direction
  };
};

export const checkCollision = (position: Position, obstacles: Position[]): boolean => {
  return obstacles.some(obstacle => 
    obstacle.x === position.x && obstacle.y === position.y
  );
};

export const checkWallCollision = (position: Position): boolean => {
  return position.x < 0 || position.x >= GRID_SIZE || 
         position.y < 0 || position.y >= GRID_SIZE;
};

export const calculateXpForLevel = (level: number): number => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

export const calculateLevel = (totalXp: number): number => {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXp) {
    xpNeeded += calculateXpForLevel(level);
    if (xpNeeded <= totalXp) level++;
  }
  
  return level;
};

export const getXpToNextLevel = (currentLevel: number, totalXp: number): number => {
  let xpUsed = 0;
  for (let i = 1; i < currentLevel; i++) {
    xpUsed += calculateXpForLevel(i);
  }
  
  const xpForCurrentLevel = calculateXpForLevel(currentLevel);
  const currentLevelProgress = totalXp - xpUsed;
  
  return xpForCurrentLevel - currentLevelProgress;
};

export const getPowerUpEmoji = (type: PowerUpType): string => {
  switch (type) {
    case PowerUpType.SPEED_BOOST: return '⚡';
    case PowerUpType.INVINCIBILITY: return '🛡️';
    case PowerUpType.FOOD_MAGNET: return '🧲';
    case PowerUpType.DOUBLE_SCORE: return '💎';
    case PowerUpType.SLOW_MOTION: return '🐌';
    case PowerUpType.SHIELD: return '⭐';
    default: return '?';
  }
};

export const getPowerUpColor = (type: PowerUpType): string => {
  switch (type) {
    case PowerUpType.SPEED_BOOST: return 'from-yellow-400 to-orange-500';
    case PowerUpType.INVINCIBILITY: return 'from-purple-400 to-pink-500';
    case PowerUpType.FOOD_MAGNET: return 'from-blue-400 to-cyan-500';
    case PowerUpType.DOUBLE_SCORE: return 'from-green-400 to-emerald-500';
    case PowerUpType.SLOW_MOTION: return 'from-gray-400 to-slate-500';
    case PowerUpType.SHIELD: return 'from-amber-400 to-yellow-500';
    default: return 'from-gray-400 to-gray-500';
  }
};