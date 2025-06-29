import { useState, useCallback } from 'react';

interface GameAnimations {
  shakeIntensity: number;
  shakeDuration: number;
  shakeTriggered: number;
  flashTriggered: number;
  congratsTriggered: number;
  congratsType: 'achievement' | 'levelup' | 'highscore';
  congratsTitle: string;
  congratsSubtitle: string;
}

export const useGameAnimations = () => {
  const [animations, setAnimations] = useState<GameAnimations>({
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeTriggered: 0,
    flashTriggered: 0,
    congratsTriggered: 0,
    congratsType: 'achievement',
    congratsTitle: '',
    congratsSubtitle: ''
  });

  const triggerShake = useCallback((intensity: number = 5, duration: number = 300) => {
    setAnimations(prev => ({
      ...prev,
      shakeIntensity: intensity,
      shakeDuration: duration,
      shakeTriggered: prev.shakeTriggered + 1
    }));
  }, []);

  const triggerFlash = useCallback(() => {
    setAnimations(prev => ({
      ...prev,
      flashTriggered: prev.flashTriggered + 1
    }));
  }, []);

  const triggerCongratulations = useCallback((
    type: 'achievement' | 'levelup' | 'highscore',
    title: string,
    subtitle: string = ''
  ) => {
    setAnimations(prev => ({
      ...prev,
      congratsTriggered: prev.congratsTriggered + 1,
      congratsType: type,
      congratsTitle: title,
      congratsSubtitle: subtitle
    }));
  }, []);

  const triggerGameOver = useCallback(() => {
    triggerShake(8, 500);
  }, [triggerShake]);

  const triggerPowerUp = useCallback(() => {
    triggerFlash();
    triggerShake(3, 200);
  }, [triggerFlash, triggerShake]);

  const triggerFoodCollected = useCallback(() => {
    triggerShake(2, 100);
  }, [triggerShake]);

  const triggerLevelUp = useCallback((level: number) => {
    triggerCongratulations('levelup', 'Level Up!', `You reached level ${level}`);
    triggerFlash();
  }, [triggerCongratulations, triggerFlash]);

  const triggerAchievement = useCallback((name: string) => {
    triggerCongratulations('achievement', 'Achievement Unlocked!', name);
  }, [triggerCongratulations]);

  const triggerHighScore = useCallback((score: number) => {
    triggerCongratulations('highscore', 'New High Score!', `${score} points`);
  }, [triggerCongratulations]);

  return {
    animations,
    triggerShake,
    triggerFlash,
    triggerCongratulations,
    triggerGameOver,
    triggerPowerUp,
    triggerFoodCollected,
    triggerLevelUp,
    triggerAchievement,
    triggerHighScore
  };
};