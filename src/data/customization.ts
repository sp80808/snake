import { SnakeSkin, GameTheme } from '../types';

export const createSkins = (): Record<string, SnakeSkin> => ({
  default: {
    id: 'default',
    name: 'Classic Green',
    price: 0,
    headColor: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
    bodyColor: 'bg-gradient-to-br from-emerald-300 to-emerald-500',
    unlocked: true
  },
  
  fire: {
    id: 'fire',
    name: 'Fire Snake',
    price: 50,
    headColor: 'bg-gradient-to-br from-red-400 to-red-600',
    bodyColor: 'bg-gradient-to-br from-orange-400 to-red-500',
    unlocked: false
  },
  
  ice: {
    id: 'ice',
    name: 'Ice Snake',
    price: 75,
    headColor: 'bg-gradient-to-br from-cyan-400 to-blue-600',
    bodyColor: 'bg-gradient-to-br from-blue-300 to-cyan-500',
    unlocked: false
  },
  
  shadow: {
    id: 'shadow',
    name: 'Shadow Snake',
    price: 100,
    headColor: 'bg-gradient-to-br from-gray-700 to-black',
    bodyColor: 'bg-gradient-to-br from-gray-600 to-gray-800',
    unlocked: false
  },
  
  golden: {
    id: 'golden',
    name: 'Golden Snake',
    price: 150,
    headColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    bodyColor: 'bg-gradient-to-br from-yellow-300 to-yellow-500',
    unlocked: false
  },
  
  rainbow: {
    id: 'rainbow',
    name: 'Rainbow Snake',
    price: 200,
    headColor: 'bg-gradient-to-br from-pink-400 via-purple-500 to-indigo-600',
    bodyColor: 'bg-gradient-to-br from-purple-400 to-pink-500',
    unlocked: false
  },
  
  neon: {
    id: 'neon',
    name: 'Neon Snake',
    price: 125,
    headColor: 'bg-gradient-to-br from-lime-400 to-green-500',
    bodyColor: 'bg-gradient-to-br from-lime-300 to-lime-500',
    unlocked: false
  },
  
  royal: {
    id: 'royal',
    name: 'Royal Snake',
    price: 175,
    headColor: 'bg-gradient-to-br from-purple-600 to-indigo-700',
    bodyColor: 'bg-gradient-to-br from-purple-400 to-purple-600',
    unlocked: false
  }
});

export const createThemes = (): Record<string, GameTheme> => ({
  classic: {
    id: 'classic',
    name: 'Classic',
    price: 0,
    backgroundColor: 'bg-gradient-to-br from-gray-100 to-gray-200',
    gridColor: 'border-gray-300',
    foodColor: 'bg-gradient-to-br from-red-400 to-red-600',
    unlocked: true
  },
  
  retro: {
    id: 'retro',
    name: 'Retro Arcade',
    price: 100,
    backgroundColor: 'bg-black',
    gridColor: 'border-green-500',
    foodColor: 'bg-gradient-to-br from-green-400 to-green-600',
    unlocked: false
  },
  
  neon: {
    id: 'neon',
    name: 'Neon City',
    price: 150,
    backgroundColor: 'bg-gradient-to-br from-purple-900 to-pink-900',
    gridColor: 'border-cyan-400',
    foodColor: 'bg-gradient-to-br from-cyan-400 to-blue-500',
    unlocked: false
  },
  
  forest: {
    id: 'forest',
    name: 'Forest',
    price: 125,
    backgroundColor: 'bg-gradient-to-br from-green-800 to-green-900',
    gridColor: 'border-green-600',
    foodColor: 'bg-gradient-to-br from-red-500 to-red-700',
    unlocked: false
  },
  
  space: {
    id: 'space',
    name: 'Space',
    price: 200,
    backgroundColor: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
    gridColor: 'border-blue-400',
    foodColor: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    unlocked: false
  },
  
  ocean: {
    id: 'ocean',
    name: 'Ocean Depths',
    price: 175,
    backgroundColor: 'bg-gradient-to-br from-blue-900 to-blue-800',
    gridColor: 'border-blue-400',
    foodColor: 'bg-gradient-to-br from-orange-400 to-red-500',
    unlocked: false
  }
});