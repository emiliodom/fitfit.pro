import { useState, useCallback } from 'react';
import { logWorkout, getWorkoutLog } from '../utils/storage';

export function useRoutineTracker() {
  const [workoutLog, setWorkoutLog] = useState(() => getWorkoutLog());

  const trackWorkout = useCallback((routine) => {
    const entry = logWorkout({
      exercises: routine.exercises.map(e => ({
        id: e.id,
        name: e.name,
        sets: e.sets,
        reps: e.reps,
        completed: true,
      })),
      category: routine.category || 'general',
      duration: routine.duration || 0,
      week: routine.week || 1,
    });
    setWorkoutLog(prev => [...prev, entry]);
    return entry;
  }, []);

  const getCompletedDays = useCallback(() => {
    const days = new Set();
    workoutLog.forEach(w => {
      days.add(w.date.split('T')[0]);
    });
    return days;
  }, [workoutLog]);

  const getWorkoutsThisWeek = useCallback(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    return workoutLog.filter(w => new Date(w.date) >= startOfWeek);
  }, [workoutLog]);

  const getTotalWorkouts = useCallback(() => workoutLog.length, [workoutLog]);

  const getStreak = useCallback(() => {
    const days = [...getCompletedDays()].sort().reverse();
    if (days.length === 0) return 0;

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let checkDate = new Date(today);

    for (let i = 0; i < 365; i++) {
      const dateStr = checkDate.toISOString().split('T')[0];
      if (days.includes(dateStr)) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else if (i === 0) {
        // Today might not be done yet, check yesterday
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  }, [getCompletedDays]);

  return {
    workoutLog,
    trackWorkout,
    getCompletedDays,
    getWorkoutsThisWeek,
    getTotalWorkouts,
    getStreak,
  };
}
