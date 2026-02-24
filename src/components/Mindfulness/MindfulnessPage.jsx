import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import mindfulnessProgram from '../../data/mindfulnessProgram.json';
import { logMindfulness, getMindfulnessLog } from '../../utils/storage';
import { playBeep } from '../../utils/audio';

function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function MindfulnessPage() {
  const { t, lang } = useLanguage();
  const todayIndex = new Date().getDay(); // 0=Sun
  const dayMap = [6, 0, 1, 2, 3, 4, 5]; // Map Sun(0)->6, Mon(1)->0, etc
  const todayJourneyIndex = dayMap[todayIndex];
  const [selectedDay, setSelectedDay] = useState(todayJourneyIndex);
  const [activePractice, setActivePractice] = useState(null);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [log, setLog] = useState(() => getMindfulnessLog());
  const intervalRef = useRef(null);

  const dayPlan = mindfulnessProgram.weeklyJourney[selectedDay];

  const todayCount = log.filter(l =>
    l.date.startsWith(new Date().toISOString().split('T')[0])
  ).length;

  const startPractice = useCallback((practice) => {
    setActivePractice(practice);
    setTimeLeft(practice.duration);
    setTimerRunning(false);
  }, []);

  const toggleTimer = useCallback(() => {
    if (timerRunning) {
      clearInterval(intervalRef.current);
      setTimerRunning(false);
    } else {
      playBeep('start');
      setTimerRunning(true);
    }
  }, [timerRunning]);

  const resetTimer = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerRunning(false);
    if (activePractice) setTimeLeft(activePractice.duration);
  }, [activePractice]);

  const completePractice = useCallback(() => {
    clearInterval(intervalRef.current);
    setTimerRunning(false);
    if (activePractice) {
      logMindfulness(activePractice.id);
      setLog(prev => [...prev, { id: activePractice.id, date: new Date().toISOString() }]);
      playBeep('complete');
    }
    setActivePractice(null);
  }, [activePractice]);

  useEffect(() => {
    if (timerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(intervalRef.current);
            setTimerRunning(false);
            playBeep('complete');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalRef.current);
  }, [timerRunning, timeLeft]);

  const progress = activePractice ? ((activePractice.duration - timeLeft) / activePractice.duration) * 100 : 0;

  // Active Practice View
  if (activePractice) {
    const steps = lang === 'es' ? activePractice.stepsEs : activePractice.steps;
    return (
      <div className="animate-in mindfulness-active">
        <button className="btn btn-ghost" onClick={() => { clearInterval(intervalRef.current); setTimerRunning(false); setActivePractice(null); }}>
          ← {t('common.back')}
        </button>

        <div className="practice-hero">
          <span className="practice-icon-large">{activePractice.icon}</span>
          <h2>{lang === 'es' ? activePractice.nameEs : activePractice.name}</h2>
          <p className="practice-desc-active">
            {lang === 'es' ? activePractice.descriptionEs : activePractice.description}
          </p>
        </div>

        {/* Timer */}
        <div className="practice-timer-card card">
          <div className="timer-ring">
            <svg viewBox="0 0 120 120" className="timer-svg">
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--border-color)" strokeWidth="4" />
              <circle cx="60" cy="60" r="54" fill="none" stroke="var(--accent)" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 54}`}
                strokeDashoffset={`${2 * Math.PI * 54 * (1 - progress / 100)}`}
                strokeLinecap="round"
                transform="rotate(-90 60 60)"
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <div className="timer-center">
              <div className="timer-display-large">{formatTime(timeLeft)}</div>
              <div className="timer-total">{formatTime(activePractice.duration)}</div>
            </div>
          </div>
          <div className="timer-controls-mind">
            <button className="btn btn-primary" onClick={toggleTimer}>
              {timerRunning ? `⏸ ${t('common.pause')}` : `▶ ${t('common.start')}`}
            </button>
            <button className="btn btn-outline" onClick={resetTimer}>↻ {t('common.reset')}</button>
            <button className="btn btn-accent" onClick={completePractice}>✓ {t('common.done')}</button>
          </div>
        </div>

        {/* Steps */}
        <div className="card practice-steps">
          <h3>{t('mindfulness.howTo')}</h3>
          <ol className="guided-steps">
            {steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        </div>

        {activePractice.scienceNote && (
          <div className="science-callout">
            <span>📚</span> {activePractice.scienceNote}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{t('mindfulness.title')}</h1>
        <p>{t('mindfulness.subtitle')}</p>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-value">{todayCount}</div>
          <div className="stat-label">{t('mindfulness.today')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{log.length}</div>
          <div className="stat-label">{t('mindfulness.totalSessions')}</div>
        </div>
        <div className="stat-item">
          <div className="stat-value">{mindfulnessProgram.quickRoutines.length}</div>
          <div className="stat-label">{t('mindfulness.quickOptions')}</div>
        </div>
      </div>

      {/* Week Journey Selector */}
      <div className="section">
        <h2 className="section-title">{t('mindfulness.weekJourney')}</h2>
        <div className="journey-week">
          {mindfulnessProgram.weeklyJourney.map((day, i) => (
            <button
              key={i}
              className={`journey-day ${i === selectedDay ? 'active' : ''} ${i === todayJourneyIndex ? 'today' : ''}`}
              onClick={() => setSelectedDay(i)}
              style={{ borderLeftColor: day.color }}
            >
              <span className="jd-icon">{day.icon}</span>
              <span className="jd-name">
                {(lang === 'es' ? day.dayEs : day.day).slice(0, 3)}
              </span>
              <span className="jd-theme" style={{ color: day.color }}>
                {lang === 'es' ? day.themeEs : day.theme}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Selected Day's Practices */}
      <div className="section">
        <div className="day-journey-header" style={{ borderColor: dayPlan.color }}>
          <span className="djh-icon" style={{ background: dayPlan.color + '22', color: dayPlan.color }}>
            {dayPlan.icon}
          </span>
          <div>
            <h2>{lang === 'es' ? dayPlan.dayEs : dayPlan.day}</h2>
            <p style={{ color: dayPlan.color }}>{lang === 'es' ? dayPlan.themeEs : dayPlan.theme}</p>
          </div>
        </div>

        <div className="practices-grid">
          {dayPlan.practices.map(practice => (
            <div key={practice.id} className="practice-card card" onClick={() => startPractice(practice)}>
              <div className="pc-top">
                <span className="pc-icon">{practice.icon}</span>
                <div className="pc-info">
                  <h3>{lang === 'es' ? practice.nameEs : practice.name}</h3>
                  <span className="pc-duration">{formatTime(practice.duration)}</span>
                </div>
              </div>
              <p className="pc-desc">
                {lang === 'es' ? practice.descriptionEs : practice.description}
              </p>
              <div className="pc-bottom">
                <span className="tag">{practice.type}</span>
                <button className="btn btn-primary btn-sm" onClick={(e) => { e.stopPropagation(); startPractice(practice); }}>
                  ▶ {t('common.start')}
                </button>
              </div>
              {practice.scienceNote && (
                <div className="pc-science">📚 {practice.scienceNote}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Routines */}
      <div className="section">
        <h2 className="section-title">{t('mindfulness.quickRoutines')}</h2>
        <div className="quick-mind-grid">
          {mindfulnessProgram.quickRoutines.map(qr => (
            <div key={qr.id} className="quick-mind-card" onClick={() => {
              const practice = mindfulnessProgram.weeklyJourney
                .flatMap(d => d.practices)
                .find(p => qr.practiceIds.includes(p.id));
              if (practice) startPractice({ ...practice, duration: qr.duration });
            }}>
              <span className="qm-icon">{qr.icon}</span>
              <div className="qm-info">
                <strong>{lang === 'es' ? qr.nameEs : qr.name}</strong>
                <span className="qm-time">{formatTime(qr.duration)}</span>
              </div>
              <p className="qm-desc">{lang === 'es' ? qr.descriptionEs : qr.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
