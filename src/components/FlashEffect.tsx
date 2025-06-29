import React, { useEffect, useState } from 'react';

interface FlashEffectProps {
  trigger: number;
  color?: string;
  duration?: number;
  intensity?: number;
}

export const FlashEffect: React.FC<FlashEffectProps> = ({ 
  trigger, 
  color = 'bg-white', 
  duration = 200,
  intensity = 0.3 
}) => {
  const [isFlashing, setIsFlashing] = useState(false);

  useEffect(() => {
    if (trigger > 0) {
      setIsFlashing(true);
      const timeout = setTimeout(() => setIsFlashing(false), duration);
      return () => clearTimeout(timeout);
    }
  }, [trigger, duration]);

  if (!isFlashing) return null;

  return (
    <div 
      className={`fixed inset-0 pointer-events-none z-30 ${color} transition-opacity duration-100`}
      style={{ opacity: intensity }}
    />
  );
};