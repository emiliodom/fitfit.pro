import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import kidsData from '../../data/kidsTraining.json';
import YouTubeCarousel from '../Training/YouTubeCarousel';
import { useTimer } from '../../hooks/useTimer';
import RoutinePlayer from '../Training/RoutinePlayer';
import TimerPanel from '../common/TimerPanel';

const parseStep = (text) => {
  const m = text.match(/^([\d-]+)\s*[xX]\s*([\d-]+(?:\s*(?:sec|seg|s|min|m|reps\/side|reps)\b)?)\s*(.*)/i);
  if (m) return { sets: m[1], reps: m[2].trim(), name: m[3].trim() };
  return { sets: 1, reps: '1', name: text };
};

export default function KidsPage({ tracker }) {
  const { t, lang } = useLanguage();
  const categories = useMemo(() => kidsData.categories || [], []);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'walking');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const timer = useTimer(60);

  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];
  const youtubeRoutines = useMemo(() => ([
    {
      id: 'kids-20',
      label: t('youtube.duration20'),
      description: t('youtube.quick'),
      query: '20 minute kids workout',
    },
    {
      id: 'kids-40',
      label: t('youtube.duration40'),
      description: t('youtube.steady'),
      query: '40 minute kids movement session',
    },
    {
      id: 'kids-60',
      label: t('youtube.duration60'),
      description: t('youtube.endurance'),
      query: '60 minute kids yoga and movement',
    },
  ]), [t]);
  const handleStartRoutine = (session) => {
    const exercises = session.steps.map((stepEn, idx) => {
      const stepEs = session.stepsEs?.[idx] || stepEn;
      const enObj = parseStep(stepEn);
      const esObj = parseStep(stepEs);
      return {
        id: `kids-${session.id}-${idx}`,
        name: enObj.name,
        nameEs: esObj.name,
        sets: Math.max(1, parseInt(enObj.sets) || 1),
        reps: enObj.reps,
        cue: 'Have fun!',
        cueEs: 'Diviertete!',
        muscles: ['Full Body'],
        difficulty: 'beginner',
        equipment: []
      };
    });
    setSelectedExercises(exercises);
    setIsPlaying(true);
  };

  if (isPlaying) {
    return (
      <div className="animate-in">
        <RoutinePlayer
          exercises={selectedExercises}
          timer={timer}
          onFinish={(duration) => {
            if (tracker) {
              tracker.trackWorkout({
                exercises: selectedExercises,
                category: 'kids',
                duration,
              });
            }
            setIsPlaying(false);
            setSelectedExercises([]);
          }}
          onBack={() => {
            setIsPlaying(false);
            setSelectedExercises([]);
          }}
        />
      </div>
    );
  }

  return (
    <div className="animate-in kids-page">
      <div className="kids-hero">
        <div className="kids-hero-content">
          <span className="kids-badge">{t('kids.badge')}</span>
          <h1>{t('kids.title')}</h1>
          <p>{t('kids.subtitle')}</p>
        </div>
        <div className="kids-hero-sparkles">
          <span>⭐</span>
          <span>🌈</span>
          <span>✨</span>
          <span>💥</span>
        </div>
      </div>

      <div className="card section">
        <h2 className="section-title">{t('youtube.title')}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>{t('youtube.subtitle')}</p>
        <div className="youtube-routines">
          {youtubeRoutines.map(item => (
            <div key={item.id} className="youtube-routine-card">
              <h4>{item.label}</h4>
              <p>{item.description}</p>
              <YouTubeCarousel exerciseName={item.query} lang={lang} asButton={true} />
            </div>
          ))}
        </div>
        <TimerPanel
          title={t('youtube.timerTitle')}
          hint={t('youtube.timerHint')}
          initialSeconds={1200}
          presets={[
            { label: t('youtube.duration20'), seconds: 1200 },
            { label: t('youtube.duration40'), seconds: 2400 },
            { label: t('youtube.duration60'), seconds: 3600 },
          ]}
        />
      </div>

      <div className="kids-category-strip">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`kids-pill ${activeCategory === cat.id ? 'active' : ''}`}
            style={{ borderColor: cat.color, color: cat.color }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="kids-pill-icon">{cat.icon}</span>
            <span>{lang === 'es' ? cat.nameEs : cat.name}</span>
          </button>
        ))}
      </div>

      {currentCategory && (
        <div className="section">
          <div className="kids-section-header" style={{ borderColor: currentCategory.color }}>
            <h2>{lang === 'es' ? currentCategory.nameEs : currentCategory.name}</h2>
            <p>{lang === 'es' ? currentCategory.descriptionEs : currentCategory.description}</p>
          </div>
          <div className="kids-grid">
            {currentCategory.sessions.map(session => (
              <div key={session.id} className="kids-card">
                <div className="kids-card-top">
                  <div>
                    <h3>{lang === 'es' ? session.nameEs : session.name}</h3>
                    <p>{lang === 'es' ? session.energyEs : session.energy}</p>
                  </div>
                  <span className="kids-time">{session.duration}</span>
                </div>
                <ul>
                  {(lang === 'es' ? session.stepsEs : session.steps).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 12, backgroundColor: currentCategory.color, borderColor: currentCategory.color }}
                  onClick={() => handleStartRoutine(session)}
                >
                  ▶ {t('common.start')}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
