import React, { useState } from 'react';
import { X, BarChart3, TrendingUp, Clock, Trophy, Target, Coins } from 'lucide-react';
import { StatsPeriod, PlayerStats } from '../types';

interface StatisticsProps {
  isOpen: boolean;
  onClose: () => void;
  statistics: StatsPeriod;
  playerStats: PlayerStats;
}

export const Statistics: React.FC<StatisticsProps> = ({
  isOpen,
  onClose,
  statistics,
  playerStats
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<keyof StatsPeriod>('allTime');

  if (!isOpen) return null;

  const currentStats = statistics[selectedPeriod];

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const StatCard = ({ title, value, icon, color = "orange" }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className={`p-2 bg-gradient-to-r from-${color}-500 to-${color}-600 rounded-lg`}>
          {icon}
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-800 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Statistics</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <X className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          {/* Period Selector */}
          <div className="flex gap-2 mt-4">
            {(['daily', 'weekly', 'monthly', 'allTime'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                  selectedPeriod === period
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {period === 'allTime' ? 'All Time' : period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard
              title="Games Played"
              value={currentStats.gamesPlayed}
              icon={<Target className="w-5 h-5 text-white" />}
            />
            <StatCard
              title="High Score"
              value={currentStats.highScore}
              icon={<Trophy className="w-5 h-5 text-white" />}
              color="yellow"
            />
            <StatCard
              title="Average Score"
              value={Math.round(currentStats.averageScore)}
              icon={<TrendingUp className="w-5 h-5 text-white" />}
              color="blue"
            />
            <StatCard
              title="Play Time"
              value={formatTime(currentStats.playTime)}
              icon={<Clock className="w-5 h-5 text-white" />}
              color="green"
            />
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Progression Stats */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                Progression
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Level</span>
                  <span className="font-semibold text-gray-800">{playerStats.level}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total XP</span>
                  <span className="font-semibold text-gray-800">{playerStats.totalXp.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">XP to Next Level</span>
                  <span className="font-semibold text-gray-800">{playerStats.xpToNextLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Streak</span>
                  <span className="font-semibold text-gray-800">{playerStats.dailyStreak} days</span>
                </div>
              </div>
            </div>

            {/* Currency Stats */}
            <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-600" />
                Currency
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Coins</span>
                  <span className="font-semibold text-gray-800">{playerStats.coins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Earned</span>
                  <span className="font-semibold text-gray-800">{playerStats.totalCoinsEarned}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period Coins</span>
                  <span className="font-semibold text-gray-800">{currentStats.totalCoins}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Period XP</span>
                  <span className="font-semibold text-gray-800">{currentStats.totalXP}</span>
                </div>
              </div>
            </div>

            {/* Performance Stats */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-blue-600" />
                Performance
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Longest Snake</span>
                  <span className="font-semibold text-gray-800">{playerStats.longestSnake}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Food Eaten</span>
                  <span className="font-semibold text-gray-800">{playerStats.totalFoodEaten}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Average Combo</span>
                  <span className="font-semibold text-gray-800">{currentStats.averageCombo.toFixed(1)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate</span>
                  <span className="font-semibold text-gray-800">
                    {playerStats.gamesPlayed > 0 
                      ? Math.round(((playerStats.gamesPlayed - playerStats.totalDeaths) / playerStats.gamesPlayed) * 100)
                      : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Visualization */}
          <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Level Progress</h3>
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Level {playerStats.level}</span>
                <span>{playerStats.xp} / {playerStats.xp + playerStats.xpToNextLevel} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-gradient-to-r from-orange-500 to-orange-600 h-4 rounded-full transition-all duration-300 flex items-center justify-center"
                  style={{ 
                    width: `${Math.max(5, (playerStats.xp / (playerStats.xp + playerStats.xpToNextLevel)) * 100)}%` 
                  }}
                >
                  <span className="text-xs text-white font-semibold">
                    {Math.round((playerStats.xp / (playerStats.xp + playerStats.xpToNextLevel)) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};