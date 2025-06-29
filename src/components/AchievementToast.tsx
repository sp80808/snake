import React, { useEffect, useState } from 'react';
import { Trophy, Star, Award } from 'lucide-react';
import { AchievementToast as AchievementToastType } from '../types';

interface AchievementToastProps {
  toast: AchievementToastType;
  onComplete: () => void;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({ toast, onComplete }) => {
  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer1 = setTimeout(() => setVisible(true), 100);
    const timer2 = setTimeout(() => {
      setVisible(false);
      setTimeout(onComplete, 300);
    }, 4000);

    const progressTimer = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 100));
    }, 40);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearInterval(progressTimer);
    };
  }, [onComplete]);

  const getTierIcon = () => {
    switch (toast.achievement.tier) {
      case 'bronze': return <Award className="w-6 h-6 text-amber-600" />;
      case 'silver': return <Star className="w-6 h-6 text-gray-400" />;
      case 'gold': return <Trophy className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getTierColor = () => {
    switch (toast.achievement.tier) {
      case 'bronze': return 'from-amber-500 to-amber-600';
      case 'silver': return 'from-gray-400 to-gray-500';
      case 'gold': return 'from-yellow-400 to-yellow-500';
    }
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ${
        visible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-white rounded-xl shadow-2xl border-2 border-orange-200 p-4 min-w-80 max-w-sm">
        <div className="flex items-start gap-3">
          <div className={`p-2 bg-gradient-to-r ${getTierColor()} rounded-lg flex-shrink-0`}>
            {getTierIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-gray-800 text-sm">Achievement Unlocked!</h3>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full capitalize bg-gradient-to-r ${getTierColor()} text-white`}>
                {toast.achievement.tier}
              </span>
            </div>
            <h4 className="font-semibold text-gray-700 text-sm mb-1">{toast.achievement.name}</h4>
            <p className="text-xs text-gray-600 mb-2">{toast.achievement.description}</p>
            <div className="flex items-center justify-between text-xs">
              <span className="text-orange-600 font-semibold">+{toast.achievement.reward} coins</span>
              <span className="text-gray-500">{toast.achievement.tier.toUpperCase()}</span>
            </div>
          </div>
        </div>
        <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
          <div 
            className="bg-gradient-to-r from-orange-500 to-orange-600 h-1 rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
};