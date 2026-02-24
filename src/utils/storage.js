// LocalStorage-based persistence for workout tracking

const STORAGE_KEYS = {
  WORKOUT_LOG: 'fitfit_workout_log',
  CURRENT_WEEK: 'fitfit_current_week',
  CURRENT_DAY: 'fitfit_current_day',
  CUSTOM_ROUTINES: 'fitfit_custom_routines',
  MINDFULNESS_LOG: 'fitfit_mindfulness_log',
  SCHEDULE_CONFIG: 'fitfit_schedule_config',
  SETTINGS: 'fitfit_settings',
};

export function saveToStorage(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error('Storage save error:', e);
    return false;
  }
}

export function loadFromStorage(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Storage load error:', e);
    return fallback;
  }
}

export function removeFromStorage(key) {
  localStorage.removeItem(key);
}

// Workout Log functions
export function logWorkout(workoutData) {
  const log = loadFromStorage(STORAGE_KEYS.WORKOUT_LOG, []);
  const entry = {
    id: Date.now(),
    date: new Date().toISOString(),
    ...workoutData,
  };
  log.push(entry);
  saveToStorage(STORAGE_KEYS.WORKOUT_LOG, log);
  return entry;
}

export function getWorkoutLog() {
  return loadFromStorage(STORAGE_KEYS.WORKOUT_LOG, []);
}

export function getWorkoutsForDate(dateStr) {
  const log = getWorkoutLog();
  return log.filter(w => w.date.startsWith(dateStr));
}

export function getWorkoutsForWeek(weekNumber) {
  const log = getWorkoutLog();
  return log.filter(w => w.week === weekNumber);
}

export function clearWorkoutLog() {
  saveToStorage(STORAGE_KEYS.WORKOUT_LOG, []);
}

// Program progression
export function getCurrentProgression() {
  return loadFromStorage(STORAGE_KEYS.CURRENT_WEEK, { week: 1, day: 1, phase: 1 });
}

export function setCurrentProgression(progression) {
  saveToStorage(STORAGE_KEYS.CURRENT_WEEK, progression);
}

export function getScheduleConfig() {
  return loadFromStorage(STORAGE_KEYS.SCHEDULE_CONFIG, {
    programWeeks: 12,
    goal: 'v_taper',
    cardioPreference: 'mixed',
    startDate: null,
  });
}

export function setScheduleConfig(config) {
  saveToStorage(STORAGE_KEYS.SCHEDULE_CONFIG, config);
}

// Mindfulness log
export function logMindfulness(practiceId) {
  const log = loadFromStorage(STORAGE_KEYS.MINDFULNESS_LOG, []);
  log.push({ id: practiceId, date: new Date().toISOString() });
  saveToStorage(STORAGE_KEYS.MINDFULNESS_LOG, log);
}

export function getMindfulnessLog() {
  return loadFromStorage(STORAGE_KEYS.MINDFULNESS_LOG, []);
}

// Export workout log as JSON
export function exportWorkoutLog() {
  const log = getWorkoutLog();
  const blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `fitfit-workout-log-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// Import workout log from JSON
export function importWorkoutLog(jsonString) {
  try {
    const data = JSON.parse(jsonString);
    if (Array.isArray(data)) {
      saveToStorage(STORAGE_KEYS.WORKOUT_LOG, data);
      return true;
    }
    return false;
  } catch (e) {
    console.error('Import error:', e);
    return false;
  }
}

export { STORAGE_KEYS };
