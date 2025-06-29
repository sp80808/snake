import React, { useState, useEffect } from 'react';
import { Maximize, Minimize } from 'lucide-react';

interface FullscreenToggleProps {
  className?: string;
}

export const FullscreenToggle: React.FC<FullscreenToggleProps> = ({ className = '' }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  return (
    <button
      onClick={toggleFullscreen}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        fixed top-4 right-4 z-50 p-3 bg-white/95 backdrop-blur-sm rounded-xl shadow-lg
        transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95
        ${isHovered ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' : 'text-gray-700'}
        ${className}
      `}
      title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
    >
      <div className={`transition-transform duration-300 ${isHovered ? 'rotate-12' : ''}`}>
        {isFullscreen ? (
          <Minimize className="w-5 h-5" />
        ) : (
          <Maximize className="w-5 h-5" />
        )}
      </div>
    </button>
  );
};