import React from 'react';
import { X, Palette, Brush, Sparkles } from 'lucide-react';
import { SnakeSkin, GameTheme, PlayerStats } from '../types';

interface CustomizationProps {
  isOpen: boolean;
  onClose: () => void;
  skins: Record<string, SnakeSkin>;
  themes: Record<string, GameTheme>;
  currentSkin: string;
  currentTheme: string;
  playerStats: PlayerStats;
  onPurchaseSkin: (skinId: string) => void;
  onPurchaseTheme: (themeId: string) => void;
  onEquipSkin: (skinId: string) => void;
  onEquipTheme: (themeId: string) => void;
}

export const Customization: React.FC<CustomizationProps> = ({
  isOpen,
  onClose,
  skins,
  themes,
  currentSkin,
  currentTheme,
  playerStats,
  onPurchaseSkin,
  onPurchaseTheme,
  onEquipSkin,
  onEquipTheme
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <Palette className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Customization</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Snake Skins Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Brush className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-800">Snake Skins</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {Object.values(skins).map((skin) => (
                <div key={skin.id} className={`border-2 rounded-xl p-4 transition-all ${
                  currentSkin === skin.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}>
                  <div className="mb-3">
                    <div className="grid grid-cols-4 gap-1 mb-2">
                      {/* Snake preview */}
                      <div className={`aspect-square rounded-sm ${skin.headColor} transform scale-110`}></div>
                      <div className={`aspect-square rounded-sm ${skin.bodyColor}`}></div>
                      <div className={`aspect-square rounded-sm ${skin.bodyColor}`}></div>
                      <div className={`aspect-square rounded-sm ${skin.bodyColor}`}></div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{skin.name}</h4>
                  <div className="flex items-center justify-between">
                    {skin.unlocked ? (
                      <button
                        onClick={() => onEquipSkin(skin.id)}
                        className={`px-3 py-1 rounded-lg text-sm font-semibold transition-all ${
                          currentSkin === skin.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {currentSkin === skin.id ? 'Equipped' : 'Equip'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onPurchaseSkin(skin.id)}
                        disabled={playerStats.coins < skin.price}
                        className="px-3 py-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                      >
                        {skin.price} coins
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Themes Section */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-800">Game Themes</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.values(themes).map((theme) => (
                <div key={theme.id} className={`border-2 rounded-xl p-4 transition-all ${
                  currentTheme === theme.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200'
                }`}>
                  <div className="mb-3">
                    <div className={`h-20 rounded-lg ${theme.backgroundColor} border-2 ${theme.gridColor} relative overflow-hidden`}>
                      <div className={`absolute top-2 left-2 w-3 h-3 rounded-full ${theme.foodColor}`}></div>
                      <div className={`absolute bottom-2 right-2 w-2 h-2 rounded-sm ${theme.gridColor}`}></div>
                      <div className={`absolute bottom-2 right-4 w-2 h-2 rounded-sm ${theme.gridColor}`}></div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-2">{theme.name}</h4>
                  <div className="flex items-center justify-between">
                    {theme.unlocked ? (
                      <button
                        onClick={() => onEquipTheme(theme.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
                          currentTheme === theme.id
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {currentTheme === theme.id ? 'Active' : 'Activate'}
                      </button>
                    ) : (
                      <button
                        onClick={() => onPurchaseTheme(theme.id)}
                        disabled={playerStats.coins < theme.price}
                        className="px-3 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-transform"
                      >
                        {theme.price} coins
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};