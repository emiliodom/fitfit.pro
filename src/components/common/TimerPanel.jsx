import { useLanguage } from '../../i18n/LanguageContext';
import { useTimer } from '../../hooks/useTimer';

export default function TimerPanel({
  title,
  hint,
  initialSeconds = 1200,
  presets = [
    { label: '20m', seconds: 1200 },
    { label: '40m', seconds: 2400 },
    { label: '60m', seconds: 3600 },
  ],
}) {
  const { t, lang } = useLanguage();
  const timer = useTimer(initialSeconds);
  const progress = timer.totalSeconds > 0
    ? Math.min(100, Math.max(0, ((timer.totalSeconds - timer.timeLeft) / timer.totalSeconds) * 100))
    : 0;

  return (
    <div className="timer-panel card">
      <div className="timer-panel-header">
        <div>
          <h3 className="timer-panel-title">{title}</h3>
          {hint && <p className="timer-panel-hint">{hint}</p>}
        </div>
        <div className={`timer-panel-status ${timer.isRunning ? 'running' : ''}`}>
          {timer.isRunning ? (lang === 'es' ? 'En curso' : 'Running') : (lang === 'es' ? 'Listo' : 'Ready')}
        </div>
      </div>

      <div className="timer-panel-display-row">
        <div className={`timer-panel-display ${timer.isRunning ? 'running' : ''}`}>
          {timer.display}
        </div>
        <div className="timer-panel-meta">
          <span>{lang === 'es' ? 'Temporizador' : 'Timer'}</span>
          <span>{Math.round(progress)}%</span>
        </div>
      </div>

      <div className="progress-bar timer-progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="timer-panel-presets">
        {presets.map((preset) => (
          <button
            key={`${preset.seconds}-${preset.label}`}
            className="btn btn-ghost btn-sm timer-preset-btn"
            onClick={() => timer.reset(preset.seconds)}
          >
            {preset.label}
          </button>
        ))}
      </div>

      <div className="timer-panel-actions">
        {!timer.isRunning ? (
          <button className="btn btn-primary btn-sm" onClick={timer.start}>
            {t('common.start')}
          </button>
        ) : (
          <button className="btn btn-outline btn-sm" onClick={timer.pause}>
            {t('common.pause')}
          </button>
        )}
        <button className="btn btn-ghost btn-sm" onClick={() => timer.reset(initialSeconds)}>
          {t('common.reset')}
        </button>
      </div>
    </div>
  );
}