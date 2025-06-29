import React from 'react';
import { X, ShoppingCart, Coins, Zap, Shield, TrendingUp, Star } from 'lucide-react';
import { PlayerStats } from '../types';

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ReactNode;
  category: 'powerup' | 'boost' | 'cosmetic';
}

interface ShopProps {
  isOpen: boolean;
  onClose: () => void;
  playerStats: PlayerStats;
  onPurchase: (itemId: string, cost: number) => void;
}

export const Shop: React.FC<ShopProps> = ({ isOpen, onClose, playerStats, onPurchase }) => {
  if (!isOpen) return null;

  const shopItems: ShopItem[] = [
    {
      id: 'extra_life',
      name: 'Extra Life',
      description: 'Start next game with a shield power-up',
      price: 50,
      icon: <Shield className="w-5 h-5" />,
      category: 'powerup'
    },
    {
      id: 'score_boost',
      name: '2x Score Boost',
      description: 'Double score for the next game',
      price: 75,
      icon: <TrendingUp className="w-5 h-5" />,
      category: 'boost'
    },
    {
      id: 'instant_xp',
      name: '100 Instant XP',
      description: 'Gain 100 XP immediately',
      price: 30,
      icon: <Star className="w-5 h-5" />,
      category: 'boost'
    },
    {
      id: 'combo_starter',
      name: 'Combo Starter',
      description: 'Begin next game with 3x combo',
      price: 60,
      icon: <Zap className="w-5 h-5" />,
      category: 'powerup'
    },
    {
      id: 'instant_xp_large',
      name: '250 Instant XP',
      description: 'Gain 250 XP immediately',
      price: 70,
      icon: <Star className="w-5 h-5" />,
      category: 'boost'
    },
    {
      id: 'lucky_game',
      name: 'Lucky Game',
      description: 'Increased power-up spawn rate for next game',
      price: 45,
      icon: <Zap className="w-5 h-5" />,
      category: 'boost'
    }
  ];

  const canAfford = (price: number) => playerStats.coins >= price;

  const handlePurchase = (item: ShopItem) => {
    if (canAfford(item.price)) {
      onPurchase(item.id, item.price);
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'powerup': return 'from-orange-500 to-orange-600';
      case 'boost': return 'from-black to-gray-800';
      case 'cosmetic': return 'from-gray-600 to-gray-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Coin Shop</h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl px-4 py-2">
                <Coins className="w-5 h-5 text-orange-600" />
                <span className="font-bold text-orange-600">{playerStats.coins}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>
          </div>
        </div>

        {/* Shop Items */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {shopItems.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-xl p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 bg-gradient-to-r ${getCategoryColor(item.category)} rounded-lg text-white`}>
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-800">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-orange-600" />
                    <span className="font-bold text-orange-600">{item.price}</span>
                  </div>
                  <button
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford(item.price)}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all transform hover:scale-105 ${
                      canAfford(item.price)
                        ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {canAfford(item.price) ? 'Buy' : 'Need More Coins'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};