import React, { useMemo } from 'react';
import { Position, Snake, PowerUp } from '../types';
import { getPowerUpEmoji, getPowerUpColor } from '../gameLogic';

interface AccessibleGameGridProps {
  gridSize: number;
  snake1: Snake;
  snake2?: Snake | null;
  food: Position[];
  powerUps: PowerUp[];
  currentTheme: any;
  currentSkin: any;
  isDarkMode: boolean;
  isFullscreen: boolean;
}

export const AccessibleGameGrid: React.FC<AccessibleGameGridProps> = ({
  gridSize,
  snake1,
  snake2,
  food,
  powerUps,
  currentTheme,
  currentSkin,
  isDarkMode,
  isFullscreen
}) => {
  // Calculate cell size based on screen and fullscreen state
  const cellSize = useMemo(() => {
    if (isFullscreen) {
      const maxSize = Math.min(window.innerWidth * 0.8, window.innerHeight * 0.8);
      return Math.floor(maxSize / gridSize);
    }
    
    // Responsive cell sizing
    if (window.innerWidth <= 480) return 16; // Mobile
    if (window.innerWidth <= 768) return 20; // Tablet
    return 24; // Desktop
  }, [gridSize, isFullscreen]);

  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
    gridTemplateRows: `repeat(${gridSize}, ${cellSize}px)`,
    gap: '1px',
    padding: isFullscreen ? '20px' : '16px',
    borderRadius: isFullscreen ? '24px' : '16px'
  };

  const getCellContent = (x: number, y: number) => {
    // Check if this cell contains snake head
    const isSnake1Head = snake1.segments[0].x === x && snake1.segments[0].y === y;
    const isSnake2Head = snake2?.segments[0].x === x && snake2?.segments[0].y === y;
    
    // Check if this cell contains snake body
    const isSnake1Body = snake1.segments.slice(1).some(segment => segment.x === x && segment.y === y);
    const isSnake2Body = snake2?.segments.slice(1).some(segment => segment.x === x && segment.y === y);
    
    // Check if this cell contains food
    const isFood = food.some(food => food.x === x && food.y === y);
    
    // Check if this cell contains power-up
    const powerUp = powerUps.find(p => p.position.x === x && p.position.y === y);
    
    let content = '';
    let ariaLabel = '';
    let className = `transition-all duration-200 ${
      isDarkMode 
        ? 'border-gray-700 border-opacity-50' 
        : `${currentTheme.gridColor} border-opacity-30`
    }`;
    
    // Set cell size
    className += ` w-[${cellSize}px] h-[${cellSize}px] border`;
    
    if (isSnake1Head) {
      content = '🐍';
      ariaLabel = 'Snake head';
      className += ` ${currentSkin.headColor} transform scale-110 rounded-lg shadow-lg`;
    } else if (isSnake2Head) {
      content = '🐍';
      ariaLabel = 'Player 2 snake head';
      className += ' bg-gradient-to-br from-blue-400 to-blue-600 transform scale-110 rounded-lg shadow-lg';
    } else if (isSnake1Body) {
      ariaLabel = 'Snake body';
      className += ` ${currentSkin.bodyColor} rounded-md`;
    } else if (isSnake2Body) {
      ariaLabel = 'Player 2 snake body';
      className += ' bg-gradient-to-br from-blue-300 to-blue-500 rounded-md';
    } else if (isFood) {
      content = '🍎';
      ariaLabel = 'Food';
      className += ` ${isDarkMode ? 'bg-gradient-to-br from-red-400 to-red-600' : currentTheme.foodColor} rounded-full animate-pulse shadow-lg`;
    } else if (powerUp) {
      content = getPowerUpEmoji(powerUp.type);
      ariaLabel = `Power-up: ${powerUp.type.replace('_', ' ')}`;
      className += ` bg-gradient-to-br ${getPowerUpColor(powerUp.type)} rounded-lg animate-bounce shadow-lg`;
    } else {
      ariaLabel = 'Empty cell';
    }
    
    return { content, ariaLabel, className };
  };

  return (
    <div
      style={gridStyle}
      className={`${
        isDarkMode 
          ? 'bg-gray-900 border-gray-600' 
          : `${currentTheme.backgroundColor} ${currentTheme.gridColor}`
      } shadow-2xl border-4 mx-auto`}
      role="grid"
      aria-label={`Snake game grid, ${gridSize} by ${gridSize} cells`}
      tabIndex={0}
    >
      {Array.from({ length: gridSize * gridSize }).map((_, index) => {
        const x = index % gridSize;
        const y = Math.floor(index / gridSize);
        const { content, ariaLabel, className } = getCellContent(x, y);
        
        return (
          <div
            key={index}
            className={className}
            role="gridcell"
            aria-label={`${ariaLabel} at row ${y + 1}, column ${x + 1}`}
            style={{
              width: cellSize,
              height: cellSize,
              fontSize: Math.max(10, cellSize * 0.6),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {content}
          </div>
        );
      })}
    </div>
  );
};