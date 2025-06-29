import React, { useRef, useState, useCallback } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

interface TouchControlsProps {
  onDirectionChange: (direction: { x: number; y: number }) => void;
  isDarkMode: boolean;
  isVisible: boolean;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onDirectionChange,
  isDarkMode,
  isVisible
}) => {
  const [activeDirection, setActiveDirection] = useState<string | null>(null);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleDirectionPress = useCallback((direction: { x: number; y: number }, directionName: string) => {
    setActiveDirection(directionName);
    onDirectionChange(direction);
    
    // Visual feedback timeout
    setTimeout(() => setActiveDirection(null), 150);
  }, [onDirectionChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    
    const minSwipeDistance = 30;
    
    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (Math.abs(deltaX) > minSwipeDistance) {
        if (deltaX > 0) {
          handleDirectionPress({ x: 1, y: 0 }, 'right');
        } else {
          handleDirectionPress({ x: -1, y: 0 }, 'left');
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(deltaY) > minSwipeDistance) {
        if (deltaY > 0) {
          handleDirectionPress({ x: 0, y: 1 }, 'down');
        } else {
          handleDirectionPress({ x: 0, y: -1 }, 'up');
        }
      }
    }
    
    touchStartRef.current = null;
  }, [handleDirectionPress]);

  const buttonBaseClasses = `
    w-12 h-12 rounded-lg flex items-center justify-center
    transition-all duration-150 active:scale-95 select-none
    ${isDarkMode 
      ? 'bg-gray-800/80 text-white border border-gray-600' 
      : 'bg-white/80 text-gray-700 border border-gray-300'
    }
    backdrop-blur-sm shadow-lg
  `;

  const getButtonClasses = (directionName: string) => {
    const isActive = activeDirection === directionName;
    return `${buttonBaseClasses} ${
      isActive 
        ? 'scale-95 bg-orange-500 text-white border-orange-400' 
        : 'hover:bg-orange-50 hover:border-orange-300'
    }`;
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Swipe Area (invisible overlay for swipe detection) */}
      <div
        className="absolute inset-0 z-10"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Swipe area for game controls"
      />

      {/* D-Pad Style Controls */}
      <div className="fixed bottom-8 right-8 z-20 md:hidden">
        <div className="relative w-36 h-36">
          {/* Up */}
          <button
            className={getButtonClasses('up')}
            onTouchStart={() => handleDirectionPress({ x: 0, y: -1 }, 'up')}
            style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)' }}
            aria-label="Move up"
          >
            <ChevronUp className="w-6 h-6" />
          </button>

          {/* Left */}
          <button
            className={getButtonClasses('left')}
            onTouchStart={() => handleDirectionPress({ x: -1, y: 0 }, 'left')}
            style={{ position: 'absolute', top: '50%', left: 0, transform: 'translateY(-50%)' }}
            aria-label="Move left"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Right */}
          <button
            className={getButtonClasses('right')}
            onTouchStart={() => handleDirectionPress({ x: 1, y: 0 }, 'right')}
            style={{ position: 'absolute', top: '50%', right: 0, transform: 'translateY(-50%)' }}
            aria-label="Move right"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Down */}
          <button
            className={getButtonClasses('down')}
            onTouchStart={() => handleDirectionPress({ x: 0, y: 1 }, 'down')}
            style={{ position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)' }}
            aria-label="Move down"
          >
            <ChevronDown className="w-6 h-6" />
          </button>

          {/* Center indicator */}
          <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${
            isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
          }`} />
        </div>

        {/* Swipe Instruction */}
        <div className={`mt-3 text-xs text-center ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Tap or Swipe
        </div>
      </div>

      {/* Alternative Linear Controls for Landscape Mobile */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20 md:hidden landscape:flex hidden">
        <div className="flex gap-2 bg-black/20 backdrop-blur-sm rounded-xl p-2">
          <button
            className={getButtonClasses('left')}
            onTouchStart={() => handleDirectionPress({ x: -1, y: 0 }, 'left')}
            aria-label="Move left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div className="flex flex-col gap-2">
            <button
              className={getButtonClasses('up')}
              onTouchStart={() => handleDirectionPress({ x: 0, y: -1 }, 'up')}
              aria-label="Move up"
            >
              <ChevronUp className="w-5 h-5" />
            </button>
            <button
              className={getButtonClasses('down')}
              onTouchStart={() => handleDirectionPress({ x: 0, y: 1 }, 'down')}
              aria-label="Move down"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
          
          <button
            className={getButtonClasses('right')}
            onTouchStart={() => handleDirectionPress({ x: 1, y: 0 }, 'right')}
            aria-label="Move right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};