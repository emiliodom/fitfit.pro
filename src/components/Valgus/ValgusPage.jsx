import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import valgusData from '../../data/valgusRoutines.json';
import {
  clearPainLog,
  getPainLog,
  logPainEntry,
  removePainEntry,
} from '../../utils/storage';

const todayISO = () => new Date().toISOString().slice(0, 10);

export default function ValgusPage() {
  const { t, lang } = useLanguage();
  const [activeSection, setActiveSection] = useState('routines');
  const [log, setLog] = useState(() => getPainLog());
  const [form, setForm] = useState({
    date: todayISO(),
    pain: 3,
    location: 'medial_knee',
    activity: 'walk',
    notes: '',
  });

  const routineCards = useMemo(() => valgusData.routines || [], []);
  const tips = useMemo(() => (lang === 'es' ? valgusData.cuesEs : valgusData.cues), [lang]);

  const locationOptions = [
    { value: 'medial_knee', label: t('valgus.locations.medialKnee') },
    { value: 'lateral_knee', label: t('valgus.locations.lateralKnee') },
    { value: 'patella', label: t('valgus.locations.patella') },
    { value: 'hip', label: t('valgus.locations.hip') },
    { value: 'ankle', label: t('valgus.locations.ankle') },
  ];

  const activityOptions = [
    { value: 'walk', label: t('valgus.activities.walk') },
    { value: 'run', label: t('valgus.activities.run') },
    { value: 'strength', label: t('valgus.activities.strength') },
    { value: 'mobility', label: t('valgus.activities.mobility') },
    { value: 'sport', label: t('valgus.activities.sport') },
  ];

  const averagePain = log.length
    ? Math.round((log.reduce((sum, entry) => sum + Number(entry.pain || 0), 0) / log.length) * 10) / 10
    : 0;

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm(prev => ({
      ...prev,
      [field]: field === 'pain' ? Number(value) : value,
    }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const entry = logPainEntry({
      ...form,
      createdAt: new Date().toISOString(),
    });
    setLog(prev => [entry, ...prev]);
    setForm(prev => ({ ...prev, notes: '' }));
  };

  const handleDelete = (id) => {
    removePainEntry(id);
    setLog(prev => prev.filter(entry => entry.id !== id));
  };

  const handleClear = () => {
    clearPainLog();
    setLog([]);
  };

  return (
    <div className="animate-in valgus-page">
      <div className="page-header">
        <h1>{t('valgus.title')}</h1>
        <p>{t('valgus.subtitle')}</p>
      </div>

      <div className="info-banner">
        <span className="tag warning">{t('valgus.notice')}</span>
        <p>{t('valgus.disclaimer')}</p>
      </div>

      <div className="sub-tabs">
        <button
          className={`sub-tab ${activeSection === 'routines' ? 'active' : ''}`}
          onClick={() => setActiveSection('routines')}
        >
          {t('valgus.routinesTab')}
        </button>
        <button
          className={`sub-tab ${activeSection === 'pain' ? 'active' : ''}`}
          onClick={() => setActiveSection('pain')}
        >
          {t('valgus.painTab')}
        </button>
      </div>

      {activeSection === 'routines' && (
        <div className="section">
          <div className="grid-2">
            {routineCards.map(routine => (
              <div key={routine.id} className="valgus-card">
                <div className="valgus-card-header">
                  <div>
                    <h3>{lang === 'es' ? routine.nameEs : routine.name}</h3>
                    <p>{lang === 'es' ? routine.goalEs : routine.goal}</p>
                  </div>
                  <div className="valgus-card-meta">
                    <span className="tag">{routine.level}</span>
                    <span className="tag info">{lang === 'es' ? routine.frequencyEs : routine.frequency}</span>
                  </div>
                </div>
                <ul className="valgus-ex-list">
                  {routine.exercises.map((ex, idx) => (
                    <li key={idx}>
                      <div className="valgus-ex-title">
                        {lang === 'es' ? ex.nameEs : ex.name}
                      </div>
                      <div className="valgus-ex-meta">
                        {ex.sets} {t('valgus.sets')} · {ex.reps}
                      </div>
                      <div className="valgus-ex-cue">{lang === 'es' ? ex.cueEs : ex.cue}</div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="card valgus-cues">
            <h3>{t('valgus.cuesTitle')}</h3>
            <ul>
              {tips.map((tip, idx) => (
                <li key={idx}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeSection === 'pain' && (
        <div className="section">
          <div className="grid-2">
            <div className="card pain-card">
              <h2>{t('valgus.painLoggerTitle')}</h2>
              <form className="pain-form" onSubmit={handleSubmit}>
                <label>
                  {t('valgus.date')}
                  <input type="date" value={form.date} onChange={handleChange('date')} />
                </label>
                <label>
                  {t('valgus.painScale')}
                  <div className="pain-scale">
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="1"
                      value={form.pain}
                      onChange={handleChange('pain')}
                    />
                    <span className="pain-score">{form.pain}/10</span>
                  </div>
                </label>
                <label>
                  {t('valgus.location')}
                  <select value={form.location} onChange={handleChange('location')}>
                    {locationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('valgus.activity')}
                  <select value={form.activity} onChange={handleChange('activity')}>
                    {activityOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </label>
                <label>
                  {t('valgus.notes')}
                  <textarea
                    rows="3"
                    value={form.notes}
                    onChange={handleChange('notes')}
                    placeholder={t('valgus.notesPlaceholder')}
                  />
                </label>
                <button className="btn btn-primary" type="submit">{t('valgus.saveEntry')}</button>
              </form>
            </div>

            <div className="card pain-log">
              <div className="pain-log-header">
                <div>
                  <h3>{t('valgus.painHistory')}</h3>
                  <p>{t('valgus.painSummary', { count: String(log.length), avg: String(averagePain) })}</p>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={handleClear}>
                  {t('valgus.clearLog')}
                </button>
              </div>

              {log.length === 0 ? (
                <p className="muted-text">{t('valgus.noEntries')}</p>
              ) : (
                <div className="pain-log-list">
                  {log.map(entry => (
                    <div key={entry.id} className="pain-entry">
                      <div>
                        <div className="pain-entry-title">
                          {entry.date} · {entry.pain}/10
                        </div>
                        <div className="pain-entry-meta">
                          {t(`valgus.locations.${entry.location}`)} · {t(`valgus.activities.${entry.activity}`)}
                        </div>
                        {entry.notes && <div className="pain-entry-notes">{entry.notes}</div>}
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleDelete(entry.id)}>
                        {t('valgus.deleteEntry')}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
