import React from 'react';

interface FloatingTextProps {
  text: string;
  x: number;
  y: number;
  color?: string;
  size?: string;
  duration?: number;
  onComplete?: () => void;
}

export const FloatingText: React.FC<FloatingTextProps> = ({
  text,
  x,
  y,
  color = 'text-orange-600',
  size = 'text-lg',
  duration = 2000,
  onComplete
}) => {
  React.useEffect(() => {
    if (onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onComplete]);

  return (
    <div
      className={`
        absolute pointer-events-none select-none font-bold ${color} ${size}
        animate-float-up z-30
      `}
      style={{
        left: x,
        top: y,
        textShadow: '2px 2px 4px rgba(0,0,0,0.7)',
        animation: `floatUp ${duration}ms ease-out forwards`
      }}
    >
      {text}
      <style jsx>{`
        @keyframes floatUp {
          0% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-20px) scale(1.1);
          }
          100% {
            opacity: 0;
            transform: translateY(-40px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};