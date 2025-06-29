import React, { useEffect, useState } from 'react';
import { Trophy, Star, Zap } from 'lucide-react';

interface CongratulatoryAnimationProps {
  trigger: number;
  type?: 'achievement' | 'levelup' | 'highscore';
  title?: string;
  subtitle?: string;
  duration?: number;
}

export const CongratulatoryAnimation: React.FC<CongratulatoryAnimationProps> = ({
  trigger,
  type = 'achievement',
  title,
  subtitle,
  duration = 3000
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (trigger > 0) {
      setIsVisible(true);
      
      // Create celebration particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setIsVisible(false);
        setParticles([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch (type) {
      case 'achievement':
        return <Trophy className="w-16 h-16 text-yellow-400" />;
      case 'levelup':
        return <Star className="w-16 h-16 text-orange-400" />;
      case 'highscore':
        return <Zap className="w-16 h-16 text-purple-400" />;
      default:
        return <Trophy className="w-16 h-16 text-yellow-400" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'achievement':
        return 'from-yellow-400 to-orange-500';
      case 'levelup':
        return 'from-orange-400 to-red-500';
      case 'highscore':
        return 'from-purple-400 to-pink-500';
      default:
        return 'from-yellow-400 to-orange-500';
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-fade-in" />
      
      {/* Celebration particles */}
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.id * 100}ms`,
            animationDuration: '2s'
          }}
        />
      ))}
      
      {/* Main animation */}
      <div className="relative animate-bounce-in bg-white rounded-2xl p-8 shadow-2xl max-w-md mx-4">
        <div className="text-center">
          {/* Icon */}
          <div className={`mx-auto mb-4 p-4 rounded-full bg-gradient-to-r ${getColors()} inline-block animate-pulse`}>
            {getIcon()}
          </div>
          
          {/* Title */}
          {title && (
            <h2 className="text-2xl font-bold text-gray-800 mb-2 animate-slide-up">
              {title}
            </h2>
          )}
          
          {/* Subtitle */}
          {subtitle && (
            <p className="text-gray-600 animate-slide-up animation-delay-200">
              {subtitle}
            </p>
          )}
          
          {/* Sparkle effects */}
          <div className="absolute -top-2 -right-2 text-yellow-400 text-2xl animate-spin">
            ✨
          </div>
          <div className="absolute -bottom-2 -left-2 text-orange-400 text-xl animate-bounce">
            🎉
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(-100px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05) translateY(0px);
          }
          70% {
            transform: scale(0.95) translateY(0px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0px);
          }
        }
        
        @keyframes slide-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.4s ease-out;
        }
        
        .animation-delay-200 {
          animation-delay: 0.2s;
          animation-fill-mode: both;
        }
      `}</style>
    </div>
  );
};