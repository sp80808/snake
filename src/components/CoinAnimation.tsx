import React from 'react';
import { Coins } from 'lucide-react';
import { CoinAnimation as CoinAnimationType } from '../types';

interface CoinAnimationProps {
  animation: CoinAnimationType;
  gridSize: number;
}

export const CoinAnimation: React.FC<CoinAnimationProps> = ({ animation, gridSize }) => {
  const age = Date.now() - animation.timestamp;
  const duration = 2000; // 2 seconds
  const progress = Math.min(age / duration, 1);
  
  const opacity = 1 - progress;
  const yOffset = progress * 60; // Float up 60px
  const scale = 1 + progress * 0.3; // Scale up
  
  const left = (animation.x / gridSize) * 100;
  const top = (animation.y / gridSize) * 100;
  
  if (progress >= 1) return null;
  
  return (
    <div
      className="absolute pointer-events-none z-10 font-bold text-lg select-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) translateY(-${yOffset}px) scale(${scale})`,
        opacity,
        color: '#ea580c',
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
      }}
    >
      <div className="flex items-center gap-1">
        <Coins className="w-5 h-5" />
        <span>+{animation.value}</span>
      </div>
    </div>
  );
};