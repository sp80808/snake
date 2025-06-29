import React from 'react';
import { XPPopup as XPPopupType } from '../types';

interface XPPopupProps {
  popup: XPPopupType;
  gridSize: number;
  cellSize: number;
}

export const XPPopup: React.FC<XPPopupProps> = ({ popup, gridSize, cellSize }) => {
  const age = Date.now() - popup.timestamp;
  const duration = 1500; // 1.5 seconds
  const progress = Math.min(age / duration, 1);
  
  const opacity = 1 - progress;
  const yOffset = progress * 40; // Float up 40px
  const scale = 1 + progress * 0.2; // Slightly scale up
  
  const left = (popup.x / gridSize) * 100;
  const top = (popup.y / gridSize) * 100;
  
  if (progress >= 1) return null;
  
  return (
    <div
      className="absolute pointer-events-none z-10 font-bold text-sm select-none"
      style={{
        left: `${left}%`,
        top: `${top}%`,
        transform: `translate(-50%, -50%) translateY(-${yOffset}px) scale(${scale})`,
        opacity,
        color: popup.isCombo ? '#ea580c' : '#16a34a', // Orange for combo, green for regular
        textShadow: '1px 1px 2px rgba(0,0,0,0.7)',
        fontSize: popup.isCombo ? '16px' : '14px',
        fontWeight: popup.isCombo ? '800' : '600'
      }}
    >
      +{popup.value} XP
      {popup.isCombo && (
        <span className="ml-1 text-orange-400">🔥</span>
      )}
    </div>
  );
};