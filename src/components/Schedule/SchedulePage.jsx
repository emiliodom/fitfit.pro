import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import scheduleData from '../../data/schedule.json';
import predefinedRoutines from '../../data/predefinedRoutines.json';
import {
  exportWorkoutLog,
  getCurrentProgression,
  setCurrentProgression,
  getScheduleConfig,
  setScheduleConfig,
} from '../../utils/storage';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_ES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export default function SchedulePage({ tracker }) {
  const { t, lang } = useLanguage();
  const [progression, setProgression] = useState(() => getCurrentProgression());
  const [scheduleConfig, setScheduleConfigState] = useState(() => getScheduleConfig());
  const todayIndex = new Date().getDay();
  const todayName = DAYS[todayIndex];
  const thisWeekWorkouts = tracker.getWorkoutsThisWeek();

  const goalLabels = useMemo(() => ({
    v_taper: t('schedule.goalVTaper'),
    strength: t('schedule.goalStrength'),
    fat_loss: t('schedule.goalFatLoss'),
    conditioning: t('schedule.goalConditioning'),
  }), [t]);

  const cardioTextByPlan = useMemo(() => ({
    mixed: null,
    run: t('schedule.cardioRunText'),
    bike: t('schedule.cardioBikeText'),
    none: t('schedule.cardioNoneText'),
  }), [t]);

  const totalWeeks = Number(scheduleConfig.programWeeks) || 12;
  const totalDays = totalWeeks * 7;
  const todayDate = new Date();
  const todayISO = todayDate.toISOString().slice(0, 10);

  const startDateISO = scheduleConfig.startDate || todayISO;
  const startDate = useMemo(() => {
    const parsed = new Date(startDateISO);
    return Number.isNaN(parsed.getTime()) ? new Date(todayISO) : parsed;
  }, [startDateISO, todayISO]);

  const getRoutinePhaseKey = (week) => {
    const ratio = week / totalWeeks;
    if (ratio <= 1 / 3) return 'foundation';
    if (ratio <= 2 / 3) return 'accumulation';
    return 'intensification';
  };

  const getPhaseMeta = (week) => {
    const phases = scheduleData.program.phases;
    const total = phases.length;
    const idx = Math.min(total - 1, Math.floor(((week - 1) * total) / totalWeeks));
    return phases[idx] || phases[0];
  };

  const phaseRanges = useMemo(() => {
    const phases = scheduleData.program.phases;
    const total = phases.length;
    return phases.map((phase, idx) => {
      const start = Math.floor((idx * totalWeeks) / total) + 1;
      const end = Math.floor(((idx + 1) * totalWeeks) / total);
      return { ...phase, rangeStart: start, rangeEnd: Math.max(start, end) };
    });
  }, [totalWeeks]);

  const currentPhase = getPhaseMeta(progression.week);

  const currentWeekOverload = scheduleData.progressionRules.weeklyOverload[
    ((progression.week - 1) % 4)
  ];

  const todayRoutine = predefinedRoutines.routines.find(r => r.dayOfWeek === todayIndex);
  const elapsedDays = Math.floor((todayDate.getTime() - startDate.getTime()) / 86400000) + 1;
  const challengeDay = Math.min(totalDays, Math.max(1, elapsedDays));

  useEffect(() => {
    if (progression.week > totalWeeks) {
      const correctedPhase = scheduleData.program.phases.findIndex(p => p.id === getPhaseMeta(totalWeeks).id) + 1;
      const corrected = { ...progression, week: totalWeeks, phase: correctedPhase };
      setProgression(corrected);
      setCurrentProgression(corrected);
    }
  }, [progression, totalWeeks]);

  const updateScheduleConfig = (patch) => {
    const next = { ...scheduleConfig, ...patch };
    setScheduleConfigState(next);
    setScheduleConfig(next);
  };

  const advanceWeek = () => {
    const newWeek = Math.min(progression.week + 1, totalWeeks);
    const newPhase = scheduleData.program.phases.findIndex(p => p.id === getPhaseMeta(newWeek).id) + 1;
    const next = { ...progression, week: newWeek, phase: newPhase };
    setProgression(next);
    setCurrentProgression(next);
  };

  const resetProgression = () => {
    const reset = { week: 1, day: 1, phase: 1 };
    setProgression(reset);
    setCurrentProgression(reset);
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{t('schedule.title')}</h1>
        <p>{goalLabels[scheduleConfig.goal] || scheduleData.program.goal}</p>
      </div>

      <div className="card section">
        <div className="card-header">
          <h2>{t('schedule.configTitle')}</h2>
        </div>
        <div className="workout-config-row">
          <div className="workout-config-item">
            <label className="workout-config-label" htmlFor="program-start-date">{t('schedule.startDate')}</label>
            <input
              id="program-start-date"
              className="workout-config-select"
              type="date"
              value={startDateISO}
              onChange={(e) => updateScheduleConfig({ startDate: e.target.value || todayISO })}
            />
          </div>

          <div className="workout-config-item">
            <label className="workout-config-label" htmlFor="program-weeks">{t('schedule.programWeeks')}</label>
            <select
              id="program-weeks"
              className="workout-config-select"
              value={scheduleConfig.programWeeks}
              onChange={(e) => updateScheduleConfig({ programWeeks: Number(e.target.value) })}
            >
              <option value={8}>{t('schedule.weeks8')}</option>
              <option value={12}>{t('schedule.weeks12')}</option>
              <option value={16}>{t('schedule.weeks16')}</option>
            </select>
          </div>

          <div className="workout-config-item">
            <label className="workout-config-label" htmlFor="goal-profile">{t('schedule.goalProfile')}</label>
            <select
              id="goal-profile"
              className="workout-config-select"
              value={scheduleConfig.goal}
              onChange={(e) => updateScheduleConfig({ goal: e.target.value })}
            >
              <option value="v_taper">{t('schedule.goalVTaper')}</option>
              <option value="strength">{t('schedule.goalStrength')}</option>
              <option value="fat_loss">{t('schedule.goalFatLoss')}</option>
              <option value="conditioning">{t('schedule.goalConditioning')}</option>
            </select>
          </div>

          <div className="workout-config-item">
            <label className="workout-config-label" htmlFor="cardio-plan">{t('schedule.cardioPlan')}</label>
            <select
              id="cardio-plan"
              className="workout-config-select"
              value={scheduleConfig.cardioPreference}
              onChange={(e) => updateScheduleConfig({ cardioPreference: e.target.value })}
            >
              <option value="mixed">{t('schedule.cardioMixed')}</option>
              <option value="run">{t('schedule.cardioRun')}</option>
              <option value="bike">{t('schedule.cardioBike')}</option>
              <option value="none">{t('schedule.cardioNone')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{progression.week}</div>
          <div className="stat-label">{t('schedule.currentWeek')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{challengeDay}</div>
          <div className="stat-label">{t('schedule.challengeDay')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{tracker.getTotalWorkouts()}</div>
          <div className="stat-label">{t('schedule.totalWorkouts')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{thisWeekWorkouts.length}</div>
          <div className="stat-label">{t('schedule.thisWeek')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{tracker.getStreak()}</div>
          <div className="stat-label">{t('schedule.streak')}</div>
        </div>
      </div>

      {/* Today's Training Card */}
      {todayRoutine && (
        <div className="card section today-schedule-card">
          <div className="tsc-badge">{t('schedule.todayTraining')}</div>
          <h2>{lang === 'es' ? todayRoutine.nameEs : todayRoutine.name}</h2>
          <div className="tsc-meta">
            <span className="tag">{todayRoutine.type}</span>
            <span className="tag">{todayRoutine.duration}</span>
            <span className="tag">{currentPhase.name}</span>
            <span className="tag">{t('schedule.day')} {challengeDay}/{totalDays}</span>
          </div>
          {todayRoutine.isRest ? (
            <p className="tsc-rest">{t('schedule.restDay')}</p>
          ) : (
            <p className="tsc-focus">{t('schedule.goToTraining')}</p>
          )}
        </div>
      )}

      {/* Progress */}
      <div className="card section">
        <div className="card-header">
          <h2>{t('schedule.programProgress')}</h2>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline btn-sm" onClick={advanceWeek}>
              {t('schedule.advanceWeek')} →
            </button>
            <button className="btn btn-ghost btn-sm" onClick={resetProgression}>
              {t('common.reset')}
            </button>
          </div>
        </div>
        <div style={{ marginBottom: 8 }}>
          <span style={{ color: 'var(--accent)', fontWeight: 700 }}>{t('schedule.phase')}: {currentPhase.name}</span>
          <span style={{ color: 'var(--text-muted)', marginLeft: 12, fontSize: '0.85rem' }}>
            {currentPhase.focus}
          </span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(progression.week / totalWeeks) * 100}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-dim)', marginTop: 4 }}>
          <span>{t('schedule.week')} {progression.week} / {totalWeeks}</span>
          <span>{Math.round((progression.week / totalWeeks) * 100)}%</span>
        </div>
      </div>

      {/* Current Week Strategy */}
      <div className="card section">
        <h3 style={{ color: 'var(--accent)', marginBottom: 8 }}>
          {t('schedule.week')} {progression.week}: {currentWeekOverload.label}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
          {currentWeekOverload.strategy}
        </p>
      </div>

      {/* Weekly Blueprint */}
      <div className="section">
        <h2 className="section-title">📅 {t('schedule.weeklyBlueprint')}</h2>
        <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {scheduleData.weeklyTemplate.map(day => {
            const isToday = day.day === todayName;
            const routine = predefinedRoutines.routines.find(r => r.day === day.day);
            return (
              <div key={day.day} className={`schedule-day ${isToday ? 'today' : ''}`}>
                <div className="day-name">{lang === 'es' ? (DAYS_ES[DAYS.indexOf(day.day)] || day.day) : day.day}</div>
                <div className="day-focus">{day.focus}</div>
                <div style={{ marginTop: 6 }}>
                  <span className={`tag ${day.type === 'rest' ? 'warning' : day.type === 'recovery' ? 'info' : ''}`}>
                    {day.type}
                  </span>
                </div>
                <div className="day-cardio">{day.cardio}</div>
                {scheduleConfig.cardioPreference !== 'mixed' && (
                  <div className="day-cardio" style={{ color: 'var(--accent)' }}>
                    {cardioTextByPlan[scheduleConfig.cardioPreference]}
                  </div>
                )}
                <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: 4 }}>
                  {day.duration}
                </div>
                {routine && !routine.isRest && (
                  <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--accent)' }}>
                    {routine.phases[getRoutinePhaseKey(progression.week)]?.exerciseIds?.length || 0} exercises
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Phase Overview */}
      <div className="section">
        <h2 className="section-title">🏗️ {t('schedule.phaseMap')}</h2>
        <div className="grid-3">
          {phaseRanges.map(phase => (
            <div
              key={phase.id}
              className={`phase-card ${phase.id === currentPhase.id ? 'active' : ''}`}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h4>{phase.name}</h4>
                <span className="tag">{phase.intensity}</span>
              </div>
              <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginBottom: 6 }}>
                {t('schedule.weeks')} {phase.rangeStart}—{phase.rangeEnd}
              </div>
              <p>{phase.notes}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Overload Protocol */}
      <div className="section">
        <h2 className="section-title">📈 {t('schedule.overloadCycle')}</h2>
        <div className="grid-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
          {scheduleData.progressionRules.weeklyOverload.map((week, i) => (
            <div
              key={i}
              className={`phase-card ${week.label === 'Deload' ? 'deload' : ''} ${((progression.week - 1) % 4) === i ? 'active' : ''}`}
            >
              <h4>{week.label}</h4>
              <p>{week.strategy}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data Export */}
      <div className="card section">
        <div className="card-header">
          <h3>📊 {t('schedule.workoutData')}</h3>
          <button className="btn btn-outline btn-sm" onClick={exportWorkoutLog}>
            {t('schedule.exportJSON')}
          </button>
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
          {t('schedule.exportDesc')} <strong style={{ color: 'var(--accent)' }}>{tracker.getTotalWorkouts()}</strong>
        </p>
        {tracker.workoutLog.length > 0 && (
          <div style={{ marginTop: 16, maxHeight: 200, overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('schedule.date')}</th>
                  <th>{t('schedule.type')}</th>
                  <th>{t('schedule.exercises')}</th>
                  <th>{t('schedule.duration')}</th>
                </tr>
              </thead>
              <tbody>
                {tracker.workoutLog.slice(-10).reverse().map(w => (
                  <tr key={w.id}>
                    <td>{new Date(w.date).toLocaleDateString()}</td>
                    <td><span className="tag">{w.category}</span></td>
                    <td>{w.exercises?.length || 0}</td>
                    <td>{w.duration || '—'} min</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
