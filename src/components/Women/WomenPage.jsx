import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import womenData from '../../data/womenRoutines.json';
import YouTubeCarousel from '../Training/YouTubeCarousel';
import { useTimer } from '../../hooks/useTimer';
import RoutinePlayer from '../Training/RoutinePlayer';
import TimerPanel from '../common/TimerPanel';

const parseStep = (text) => {
  const m = text.match(/^([\d-]+)\s*[xX]\s*([\d-]+(?:\s*(?:sec|seg|s|min|m|reps\/side|reps)\b)?)\s*(.*)/i);
  if (m) return { sets: m[1], reps: m[2].trim(), name: m[3].trim() };
  return { sets: 1, reps: '1', name: text };
};

export default function WomenPage({ tracker }) {
  const { t, lang } = useLanguage();
  const [activeSection, setActiveSection] = useState('strength');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const timer = useTimer(60);

  const sections = useMemo(() => womenData.sections || [], []);
  const youtubeRoutines = useMemo(() => ([
    {
      id: 'women-20',
      label: t('youtube.duration20'),
      description: t('youtube.quick'),
      query: '20 minute women strength workout',
    },
    {
      id: 'women-40',
      label: t('youtube.duration40'),
      description: t('youtube.steady'),
      query: '40 minute women full body workout',
    },
    {
      id: 'women-60',
      label: t('youtube.duration60'),
      description: t('youtube.endurance'),
      query: '60 minute women training session',
    },
  ]), [t]);

  const currentSection = sections.find(section => section.id === activeSection) || sections[0];

  const handleStartRoutine = (routine) => {
    const exercises = routine.steps.map((stepEn, idx) => {
      const stepEs = routine.stepsEs?.[idx] || stepEn;
      const enObj = parseStep(stepEn);
      const esObj = parseStep(stepEs);
      return {
        id: `women-${routine.id}-${idx}`,
        name: enObj.name,
        nameEs: esObj.name,
        sets: enObj.sets,
        reps: enObj.reps,
        cue: 'Focus on breathing.',
        cueEs: 'Enfocate en la respiracion.',
        muscles: ['Full Body'],
        difficulty: routine.level?.toLowerCase() || 'intermediate',
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
                category: 'women',
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
    <div className="animate-in women-page">
      <div className="page-header">
        <h1>{t('women.title')}</h1>
        <p>{t('women.subtitle')}</p>
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

      <div className="sub-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`sub-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {lang === 'es' ? section.nameEs : section.name}
          </button>
        ))}
      </div>

      {currentSection && (
        <div className="section">
          <div className="section-headline">
            <h2>{lang === 'es' ? currentSection.nameEs : currentSection.name}</h2>
            <p>{lang === 'es' ? currentSection.descriptionEs : currentSection.description}</p>
          </div>

          <div className="grid-2">
            {currentSection.routines.map(routine => (
              <div key={routine.id} className="women-card">
                <div className="women-card-header">
                  <div>
                    <h3>{lang === 'es' ? routine.nameEs : routine.name}</h3>
                    <p>{lang === 'es' ? routine.focusEs : routine.focus}</p>
                  </div>
                  <div className="women-card-meta">
                    <span className="tag">{routine.duration}</span>
                    <span className="tag info">{lang === 'es' ? routine.levelEs : routine.level}</span>
                  </div>
                </div>
                <ul>
                  {(lang === 'es' ? routine.stepsEs : routine.steps).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
                <button 
                  className="btn btn-primary" 
                  style={{ width: '100%', marginTop: 12 }}
                  onClick={() => handleStartRoutine(routine)}
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
