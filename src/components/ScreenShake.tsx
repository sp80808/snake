import React, { useEffect, useState, useRef } from 'react';

interface ScreenShakeProps {
  children: React.ReactNode;
  intensity: number;
  duration: number;
  trigger: number; // Change this value to trigger shake
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({ 
  children, 
  intensity, 
  duration, 
  trigger 
}) => {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimeoutRef = useRef<NodeJS.Timeout>();
  const shakeIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (trigger > 0) {
      startShake();
    }
  }, [trigger]);

  const startShake = () => {
    if (isShaking) return;
    
    setIsShaking(true);
    
    // Clear any existing intervals
    if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
    if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
    
    // Start shake animation
    shakeIntervalRef.current = setInterval(() => {
      const x = (Math.random() - 0.5) * intensity * 2;
      const y = (Math.random() - 0.5) * intensity * 2;
      setShakeOffset({ x, y });
    }, 16); // 60fps
    
    // Stop shake after duration
    shakeTimeoutRef.current = setTimeout(() => {
      setIsShaking(false);
      setShakeOffset({ x: 0, y: 0 });
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
    }, duration);
  };

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) clearTimeout(shakeTimeoutRef.current);
      if (shakeIntervalRef.current) clearInterval(shakeIntervalRef.current);
    };
  }, []);

  return (
    <div
      style={{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        transition: isShaking ? 'none' : 'transform 0.1s ease-out'
      }}
    >
      {children}
    </div>
  );
};