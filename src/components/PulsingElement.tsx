import React from 'react';

interface PulsingElementProps {
  children: React.ReactNode;
  isActive?: boolean;
  color?: string;
  intensity?: number;
  speed?: number;
  className?: string;
}

export const PulsingElement: React.FC<PulsingElementProps> = ({
  children,
  isActive = true,
  color = 'orange',
  intensity = 0.3,
  speed = 2,
  className = ''
}) => {
  const pulseKeyframes = `
    @keyframes pulse-${color} {
      0%, 100% { 
        box-shadow: 0 0 0 0 rgba(${color === 'orange' ? '249, 115, 22' : '156, 163, 175'}, ${intensity});
      }
      50% { 
        box-shadow: 0 0 0 10px rgba(${color === 'orange' ? '249, 115, 22' : '156, 163, 175'}, 0);
      }
    }
  `;

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        className={`
          ${isActive ? `animate-pulse` : ''} 
          ${className}
        `}
        style={{
          animation: isActive ? `pulse-${color} ${speed}s infinite` : 'none'
        }}
      >
        {children}
      </div>
    </>
  );
};