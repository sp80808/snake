import React, { useState, useEffect, useRef } from 'react';
import { Maximize, Minimize, Smartphone, Tablet, Monitor } from 'lucide-react';

interface ResponsiveGameContainerProps {
  children: React.ReactNode;
  isDarkMode: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

export const ResponsiveGameContainer: React.FC<ResponsiveGameContainerProps> = ({
  children,
  isDarkMode,
  onFullscreenChange
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [screenSize, setScreenSize] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('landscape');
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect screen size and orientation
  useEffect(() => {
    const updateScreenInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      if (width <= 768) {
        setScreenSize('mobile');
      } else if (width <= 1024) {
        setScreenSize('tablet');
      } else {
        setScreenSize('desktop');
      }
      
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    updateScreenInfo();
    window.addEventListener('resize', updateScreenInfo);
    window.addEventListener('orientationchange', updateScreenInfo);

    return () => {
      window.removeEventListener('resize', updateScreenInfo);
      window.removeEventListener('orientationchange', updateScreenInfo);
    };
  }, []);

  // Fullscreen event listeners
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
      onFullscreenChange?.(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onFullscreenChange]);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error('Fullscreen toggle failed:', error);
    }
  };

  const getContainerClasses = () => {
    const baseClasses = "relative transition-all duration-300 ease-in-out";
    
    if (isFullscreen) {
      return `${baseClasses} w-screen h-screen flex items-center justify-center ${
        isDarkMode ? 'bg-gray-900' : 'bg-gray-100'
      }`;
    }

    // Normal mode responsive classes
    switch (screenSize) {
      case 'mobile':
        return `${baseClasses} w-full max-w-sm mx-auto`;
      case 'tablet':
        return `${baseClasses} w-full max-w-2xl mx-auto`;
      default:
        return `${baseClasses} w-full max-w-4xl mx-auto`;
    }
  };

  const getGameAreaClasses = () => {
    if (isFullscreen) {
      // Calculate optimal size based on screen dimensions
      const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
      return `w-[${maxSize}px] h-[${maxSize}px]`;
    }

    // Responsive game area sizing
    switch (screenSize) {
      case 'mobile':
        return 'w-80 h-80';
      case 'tablet':
        return 'w-96 h-96';
      default:
        return 'w-[500px] h-[500px]';
    }
  };

  const getScreenIcon = () => {
    switch (screenSize) {
      case 'mobile': return <Smartphone className="w-4 h-4" />;
      case 'tablet': return <Tablet className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={getContainerClasses()}
      role="main"
      aria-label="Snake Game Container"
    >
      {/* Fullscreen Controls */}
      <div className={`absolute top-4 right-4 z-50 flex gap-2 ${
        isFullscreen ? 'fixed' : ''
      }`}>
        {/* Screen Size Indicator */}
        <div className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${
          isDarkMode 
            ? 'bg-gray-800 text-gray-300' 
            : 'bg-white text-gray-600'
        } shadow-lg backdrop-blur-sm`}>
          {getScreenIcon()}
          <span className="capitalize">{screenSize}</span>
          <span className="text-orange-500">•</span>
          <span className="capitalize">{orientation}</span>
        </div>

        {/* Fullscreen Toggle */}
        <button
          onClick={toggleFullscreen}
          className={`p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 ${
            isDarkMode 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white text-gray-700 hover:bg-gray-100'
          } backdrop-blur-sm`}
          title={isFullscreen ? 'Exit Fullscreen (ESC)' : 'Enter Fullscreen'}
          aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? (
            <Minimize className="w-5 h-5" />
          ) : (
            <Maximize className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Game Content with Optimal Scaling */}
      <div className={`${getGameAreaClasses()} ${
        isFullscreen ? 'scale-100' : ''
      }`}>
        {children}
      </div>

      {/* Fullscreen Instructions */}
      {isFullscreen && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
          <div className={`px-4 py-2 rounded-lg text-sm ${
            isDarkMode 
              ? 'bg-gray-800/90 text-gray-300' 
              : 'bg-white/90 text-gray-600'
          } backdrop-blur-sm shadow-lg`}>
            Press <kbd className="px-2 py-1 bg-gray-200 text-gray-800 rounded text-xs">ESC</kbd> to exit fullscreen
          </div>
        </div>
      )}
    </div>
  );
};