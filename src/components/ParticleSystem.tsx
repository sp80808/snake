import React, { useEffect, useState } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  type: 'spark' | 'coin' | 'star' | 'circle';
}

interface ParticleSystemProps {
  particles: Particle[];
  onParticleComplete: (id: string) => void;
}

export const ParticleSystem: React.FC<ParticleSystemProps> = ({ particles, onParticleComplete }) => {
  const [activeParticles, setActiveParticles] = useState<Particle[]>([]);

  useEffect(() => {
    setActiveParticles(prev => [...prev, ...particles]);
  }, [particles]);

  useEffect(() => {
    const updateParticles = () => {
      setActiveParticles(prev => {
        const updated = prev.map(particle => ({
          ...particle,
          x: particle.x + particle.vx,
          y: particle.y + particle.vy,
          vy: particle.vy + 0.1, // gravity
          life: particle.life - 1,
          size: particle.size * (particle.life / particle.maxLife) // shrink over time
        })).filter(particle => {
          if (particle.life <= 0) {
            onParticleComplete(particle.id);
            return false;
          }
          return true;
        });
        return updated;
      });
    };

    const interval = setInterval(updateParticles, 16); // 60fps
    return () => clearInterval(interval);
  }, [onParticleComplete]);

  const getParticleElement = (particle: Particle) => {
    const opacity = particle.life / particle.maxLife;
    const style = {
      position: 'absolute' as const,
      left: particle.x,
      top: particle.y,
      opacity,
      pointerEvents: 'none' as const,
      transform: `scale(${particle.size / 10})`
    };

    switch (particle.type) {
      case 'spark':
        return (
          <div
            key={particle.id}
            style={style}
            className={`w-2 h-2 ${particle.color} rounded-full shadow-lg`}
          />
        );
      case 'star':
        return (
          <div
            key={particle.id}
            style={style}
            className="text-yellow-400 text-lg animate-spin"
          >
            ⭐
          </div>
        );
      case 'coin':
        return (
          <div
            key={particle.id}
            style={style}
            className="text-orange-400 text-sm animate-bounce"
          >
            🪙
          </div>
        );
      default:
        return (
          <div
            key={particle.id}
            style={style}
            className={`w-3 h-3 ${particle.color} rounded-full`}
          />
        );
    }
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-40">
      {activeParticles.map(getParticleElement)}
    </div>
  );
};

// Utility functions for creating particles
export const createFoodParticles = (x: number, y: number): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < 8; i++) {
    particles.push({
      id: `food-${Date.now()}-${i}`,
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * -4 - 2,
      size: Math.random() * 6 + 4,
      color: 'bg-orange-400',
      life: 60,
      maxLife: 60,
      type: 'spark'
    });
  }
  return particles;
};

export const createPowerUpParticles = (x: number, y: number): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < 12; i++) {
    particles.push({
      id: `powerup-${Date.now()}-${i}`,
      x: x + Math.random() * 30 - 15,
      y: y + Math.random() * 30 - 15,
      vx: (Math.random() - 0.5) * 8,
      vy: Math.random() * -6 - 3,
      size: Math.random() * 8 + 6,
      color: 'bg-purple-400',
      life: 80,
      maxLife: 80,
      type: 'star'
    });
  }
  return particles;
};

export const createAchievementParticles = (x: number, y: number): Particle[] => {
  const particles: Particle[] = [];
  for (let i = 0; i < 20; i++) {
    particles.push({
      id: `achievement-${Date.now()}-${i}`,
      x: x + Math.random() * 40 - 20,
      y: y + Math.random() * 40 - 20,
      vx: (Math.random() - 0.5) * 10,
      vy: Math.random() * -8 - 4,
      size: Math.random() * 10 + 8,
      color: 'bg-yellow-400',
      life: 120,
      maxLife: 120,
      type: 'star'
    });
  }
  return particles;
};