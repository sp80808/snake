import React, { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  color?: string;
  height?: string;
  showPercentage?: boolean;
  animated?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  color = 'orange',
  height = 'h-2',
  showPercentage = false,
  animated = true,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    if (animated) {
      const duration = 500; // ms
      const steps = 30;
      const stepValue = (percentage - displayValue) / steps;
      
      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        setDisplayValue(prev => {
          const newValue = prev + stepValue;
          if (currentStep >= steps) {
            clearInterval(timer);
            return percentage;
          }
          return newValue;
        });
      }, duration / steps);

      return () => clearInterval(timer);
    } else {
      setDisplayValue(percentage);
    }
  }, [percentage, animated]);

  const getColorClasses = () => {
    switch (color) {
      case 'orange':
        return 'from-orange-500 to-orange-600';
      case 'green':
        return 'from-green-500 to-green-600';
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'red':
        return 'from-red-500 to-red-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      default:
        return 'from-orange-500 to-orange-600';
    }
  };

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-600">{Math.round(displayValue)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden`}>
        <div
          className={`${height} bg-gradient-to-r ${getColorClasses()} rounded-full transition-all duration-300 relative overflow-hidden`}
          style={{ width: `${Math.max(0, displayValue)}%` }}
        >
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 transform -skew-x-12 animate-pulse" />
        </div>
      </div>
    </div>
  );
};