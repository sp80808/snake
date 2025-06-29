import React from 'react';
import { X, Trophy, Award, Star, Target, Clock, Zap } from 'lucide-react';
import { Achievement, Challenge, PlayerStats, GameState } from '../types';

interface AchievementsProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Record<string, Achievement>;
  challenges: Record<string, Challenge>;
  playerStats: PlayerStats;
  gameState: GameState;
}

export const Achievements: React.FC<AchievementsProps> = ({
  isOpen,
  onClose,
  achievements,
  challenges,
  playerStats,
  gameState
}) => {
  if (!isOpen) return null;

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="w-5 h-5 text-amber-600" />;
      case 'silver': return <Star className="w-5 h-5 text-gray-400" />;
      case 'gold': return <Trophy className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'bronze': return 'from-amber-500 to-amber-600';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-500';
    }
  };

  const activeChallenges = Object.values(challenges).filter(c => !c.completed);
  const completedAchievements = Object.values(achievements).filter(a => a.unlocked);
  const lockedAchievements = Object.values(achievements).filter(a => !a.unlocked);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl">
                <Trophy className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800">Achievements & Challenges</h2>
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
          {/* Active Challenges */}
          {activeChallenges.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <Target className="w-6 h-6 text-orange-600" />
                <h3 className="text-xl font-bold text-gray-800">Active Challenges</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeChallenges.map((challenge) => {
                  const progress = challenge.progress(playerStats, gameState);
                  const progressPercent = Math.min((progress.current / progress.target) * 100, 100);
                  
                  return (
                    <div key={challenge.id} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-orange-50 to-orange-100">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="w-5 h-5 text-orange-600" />
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            challenge.type === 'daily' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                          }`}>
                            {challenge.type.toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-orange-600 font-semibold">
                            +{challenge.reward.coins} coins, +{challenge.reward.xp} XP
                          </div>
                        </div>
                      </div>
                      <h4 className="font-semibold text-gray-800 mb-1">{challenge.name}</h4>
                      <p className="text-sm text-gray-600 mb-3">{challenge.description}</p>
                      <div className="mb-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-semibold">{progress.current}/{progress.target}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-orange-500 to-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Achievements */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Trophy className="w-6 h-6 text-orange-600" />
              <h3 className="text-xl font-bold text-gray-800">Unlocked Achievements ({completedAchievements.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedAchievements.map((achievement) => (
                <div key={achievement.id} className="border border-gray-200 rounded-xl p-4 bg-gradient-to-r from-green-50 to-green-100">
                  <div className="flex items-start justify-between mb-2">
                    <div className={`p-2 bg-gradient-to-r ${getTierColor(achievement.tier)} rounded-lg`}>
                      {getTierIcon(achievement.tier)}
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize bg-gradient-to-r ${getTierColor(achievement.tier)} text-white`}>
                        {achievement.tier}
                      </span>
                      <div className="text-xs text-green-600 font-semibold mt-1">
                        +{achievement.reward} coins
                      </div>
                    </div>
                  </div>
                  <h4 className="font-semibold text-gray-800 mb-1">{achievement.name}</h4>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  {achievement.dateUnlocked && (
                    <p className="text-xs text-gray-500">
                      Unlocked: {new Date(achievement.dateUnlocked).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Locked Achievements */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-6 h-6 text-gray-400" />
              <h3 className="text-xl font-bold text-gray-800">Locked Achievements ({lockedAchievements.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map((achievement) => {
                const progress = achievement.progress(playerStats, gameState);
                const progressPercent = Math.min((progress.current / progress.target) * 100, 100);
                
                return (
                  <div key={achievement.id} className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="p-2 bg-gray-300 rounded-lg">
                        {getTierIcon(achievement.tier)}
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-1 text-xs font-semibold rounded-full capitalize bg-gray-300 text-gray-600">
                          {achievement.tier}
                        </span>
                        <div className="text-xs text-gray-500 font-semibold mt-1">
                          +{achievement.reward} coins
                        </div>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-700 mb-1">{achievement.name}</h4>
                    <p className="text-sm text-gray-500 mb-3">{achievement.description}</p>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Progress</span>
                        <span className="font-semibold text-gray-600">{progress.current}/{progress.target}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-gray-400 to-gray-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};