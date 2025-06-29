import { Upgrade } from './types';

export const createUpgrades = (): Record<string, Upgrade> => ({
  speed: {
    id: 'speed',
    name: 'Snake Speed',
    description: 'Increase movement speed',
    cost: 50,
    level: 0,
    maxLevel: 10,
    effect: (level: number) => level * 10 // 10% speed increase per level
  },
  scoreMultiplier: {
    id: 'scoreMultiplier',
    name: 'Score Multiplier',
    description: 'Increase points earned',
    cost: 75,
    level: 0,
    maxLevel: 8,
    effect: (level: number) => 1 + (level * 0.25) // 25% bonus per level
  },
  powerUpDuration: {
    id: 'powerUpDuration',
    name: 'Power-up Duration',
    description: 'Extend power-up effects',
    cost: 60,
    level: 0,
    maxLevel: 5,
    effect: (level: number) => 1 + (level * 0.3) // 30% longer per level
  },
  xpBonus: {
    id: 'xpBonus',
    name: 'XP Gain',
    description: 'Earn more experience',
    cost: 40,
    level: 0,
    maxLevel: 12,
    effect: (level: number) => 1 + (level * 0.2) // 20% more XP per level
  },
  foodMagnet: {
    id: 'foodMagnet',
    name: 'Food Magnetism',
    description: 'Attract food from distance',
    cost: 100,
    level: 0,
    maxLevel: 3,
    effect: (level: number) => level * 2 // Range in grid units
  },
  powerUpSpawn: {
    id: 'powerUpSpawn',
    name: 'Power-up Spawn Rate',
    description: 'Increase power-up frequency',
    cost: 80,
    level: 0,
    maxLevel: 6,
    effect: (level: number) => level * 15 // 15% increase per level
  }
});

export const calculateUpgradeCost = (baseUpgrade: Upgrade): number => {
  return Math.floor(baseUpgrade.cost * Math.pow(1.5, baseUpgrade.level));
};

export const canAffordUpgrade = (upgrade: Upgrade, availableXp: number): boolean => {
  if (upgrade.level >= upgrade.maxLevel) return false;
  return availableXp >= calculateUpgradeCost(upgrade);
};

export const purchaseUpgrade = (upgrade: Upgrade, playerXp: number): { 
  upgrade: Upgrade; 
  remainingXp: number; 
  success: boolean 
} => {
  if (!canAffordUpgrade(upgrade, playerXp)) {
    return { upgrade, remainingXp: playerXp, success: false };
  }
  
  const cost = calculateUpgradeCost(upgrade);
  
  return {
    upgrade: {
      ...upgrade,
      level: upgrade.level + 1
    },
    remainingXp: playerXp - cost,
    success: true
  };
};