import { useState, useEffect, useRef, useCallback } from 'react';
import { playBeep } from '../utils/audio';

export function useTimer(initialSeconds = 60) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [defaultTime, setDefaultTime] = useState(initialSeconds);
  const intervalRef = useRef(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setIsRunning(true);
    playBeep('start');
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          playBeep('end');
          return defaultTime;
        }
        if (prev <= 4) playBeep('tick');
        return prev - 1;
      });
    }, 1000);
  }, [clear, defaultTime]);

  const pause = useCallback(() => {
    clear();
    setIsRunning(false);
  }, [clear]);

  const reset = useCallback((seconds) => {
    clear();
    setIsRunning(false);
    const t = seconds || defaultTime;
    setDefaultTime(t);
    setTimeLeft(t);
  }, [clear, defaultTime]);

  useEffect(() => {
    return clear;
  }, [clear]);

  const display = `${Math.floor(timeLeft / 60).toString().padStart(2, '0')}:${(timeLeft % 60).toString().padStart(2, '0')}`;

  return { timeLeft, isRunning, display, start, pause, reset, totalSeconds: defaultTime };
}
