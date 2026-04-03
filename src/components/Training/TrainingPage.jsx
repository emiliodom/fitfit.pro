import { useState, useMemo } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import exerciseData from '../../data/exercises.json';
import predefinedRoutines from '../../data/predefinedRoutines.json';
import { getCurrentProgression } from '../../utils/storage';
import EquipmentFilter from './EquipmentFilter';
import ExerciseCard from './ExerciseCard';
import RoutinePlayer from './RoutinePlayer';
import MuscleMap from './MuscleMap';
import YouTubeCarousel from './YouTubeCarousel';
import { useTimer } from '../../hooks/useTimer';
import { playBeep } from '../../utils/audio';
import { getExerciseDisplayName } from '../../utils/exerciseDisplay';
import womenData from '../../data/womenRoutines.json';
import kidsData from '../../data/kidsTraining.json';
import valgusData from '../../data/valgusRoutines.json';

function getPhaseKey(week) {
  if (week <= 4) return 'foundation';
  if (week <= 8) return 'accumulation';
  return 'intensification';
}

function resolveExercises(ids) {
  return ids.map(id => exerciseData.exercises.find(e => e.id === id)).filter(Boolean);
}

function FeedTimer({ label, t }) {
  const timer = useTimer(180);
  return (
    <div className="feed-timer">
      <div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.6 }}>
          {label}
        </div>
        <div className="feed-timer-display">{timer.display}</div>
      </div>
      <div style={{ display: 'flex', gap: 6 }}>
        {!timer.isRunning ? (
          <button className="btn btn-primary btn-sm" onClick={timer.start}>{t('common.start')}</button>
        ) : (
          <button className="btn btn-ghost btn-sm" onClick={timer.pause}>{t('common.pause')}</button>
        )}
        <button className="btn btn-outline btn-sm" onClick={() => timer.reset(180)}>{t('common.reset')}</button>
      </div>
    </div>
  );
}

export default function TrainingPage({ tracker }) {
  const { t, lang } = useLanguage();
  const difficultyRank = { beginner: 1, intermediate: 2, advanced: 3 };
  const [selectedEquipment, setSelectedEquipment] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [view, setView] = useState('predefined'); // 'predefined' | 'custom' | 'library'
  const [predefinedTab, setPredefinedTab] = useState('library'); // 'goal' | 'library'
  const [workoutDuration, setWorkoutDuration] = useState('medium'); // short | medium | long
  const [workoutLevel, setWorkoutLevel] = useState('all'); // all | beginner | intermediate | advanced
  const [libraryCategory, setLibraryCategory] = useState(null);
  const [previewRoutine, setPreviewRoutine] = useState(null);
  const [quickTarget, setQuickTarget] = useState(null);
  const [showQuickStartModal, setShowQuickStartModal] = useState(false);
  const [quickLevel, setQuickLevel] = useState('beginner');
  const [quickEnvironment, setQuickEnvironment] = useState('home');
  const [quickStyle, setQuickStyle] = useState('normal');
  const [quickDurationMinutes, setQuickDurationMinutes] = useState('30');
  const timer = useTimer(60);
  const [activeFeedId, setActiveFeedId] = useState('women');

  const progression = getCurrentProgression();
  const phaseKey = getPhaseKey(progression.week);
  const dayOfWeek = new Date().getDay();

  const todayRoutine = predefinedRoutines.routines.find(r => r.dayOfWeek === dayOfWeek);

  const equipmentFilteredExercises = useMemo(() => {
    let exercises = exerciseData.exercises;
    if (selectedEquipment.length > 0) {
      exercises = exercises.filter(ex =>
        ex.equipment.some(eq => selectedEquipment.includes(eq))
      );
    }
    return exercises;
  }, [selectedEquipment]);

  const filteredExercises = useMemo(() => {
    let exercises = equipmentFilteredExercises;
    if (selectedCategory === 'glutes') {
      exercises = exercises.filter(ex =>
        ex.muscles.some(m => m.toLowerCase().includes('glute'))
      );
    } else if (selectedCategory) {
      exercises = exercises.filter(ex => ex.category === selectedCategory);
    }
    return exercises;
  }, [equipmentFilteredExercises, selectedCategory]);

  const predefinedWorkoutPacks = useMemo(() => {
    const durationConfig = {
      short: { label: lang === 'es' ? '20-30 min' : '20-30 min', exerciseCount: 6 },
      medium: { label: lang === 'es' ? '30-40 min' : '30-40 min', exerciseCount: 8 },
      long: { label: lang === 'es' ? '40-55 min' : '40-55 min', exerciseCount: 10 },
    };
    const { label: configuredDuration, exerciseCount } = durationConfig[workoutDuration] || durationConfig.medium;

    const noEquipmentIds = new Set(['bodyweight', 'yoga_mat']);
    const weightedIds = new Set(['dumbbells', 'kettlebell', 'barbell']);

    const uniqueById = (items) => {
      const map = new Map();
      items.forEach(ex => map.set(ex.id, ex));
      return Array.from(map.values());
    };

    const pickByCategory = (category) =>
      exerciseData.exercises.filter(ex => ex.category === category).slice(0, exerciseCount);

    const pickByMuscle = (muscleToken) =>
      exerciseData.exercises
        .filter(ex => ex.muscles.some(m => m.toLowerCase().includes(muscleToken)))
        .slice(0, exerciseCount);

    const perGroupCount = Math.max(1, Math.ceil(exerciseCount / 5));

    const noEquipment = exerciseData.exercises
      .filter(ex => ex.equipment.every(eq => noEquipmentIds.has(eq)))
      .slice(0, Math.max(exerciseCount * 2, 12));

    const fullBodyNoEquipment = uniqueById([
      ...noEquipment.filter(ex => ex.category === 'push').slice(0, perGroupCount),
      ...noEquipment.filter(ex => ex.category === 'pull').slice(0, perGroupCount),
      ...noEquipment.filter(ex => ex.category === 'legs').slice(0, perGroupCount),
      ...noEquipment.filter(ex => ex.category === 'core').slice(0, perGroupCount),
      ...noEquipment.filter(ex => ex.category === 'hiit').slice(0, perGroupCount),
    ]).slice(0, exerciseCount);

    const fullBodyWeights = uniqueById([
      ...exerciseData.exercises.filter(ex => ex.category === 'push' && ex.equipment.some(eq => weightedIds.has(eq))).slice(0, perGroupCount),
      ...exerciseData.exercises.filter(ex => ex.category === 'pull' && ex.equipment.some(eq => weightedIds.has(eq))).slice(0, perGroupCount),
      ...exerciseData.exercises.filter(ex => ex.category === 'legs' && ex.equipment.some(eq => weightedIds.has(eq))).slice(0, perGroupCount),
      ...exerciseData.exercises.filter(ex => ex.category === 'core' && ex.equipment.some(eq => weightedIds.has(eq))).slice(0, perGroupCount),
      ...exerciseData.exercises.filter(ex => ex.category === 'hiit' && ex.equipment.some(eq => weightedIds.has(eq))).slice(0, perGroupCount),
    ]).slice(0, exerciseCount);

    const rank = { beginner: 1, intermediate: 2, advanced: 3 };
    const selectedRank = workoutLevel === 'all' ? Infinity : rank[workoutLevel] || Infinity;

    return [
      {
        id: 'no-equipment-full-body',
        title: lang === 'es' ? 'Full Body Sin Equipo' : 'No Equipment Full Body',
        description: lang === 'es'
          ? 'Rutina integral usando solo peso corporal y mat.'
          : 'Balanced full-body training using bodyweight and mat only.',
        duration: configuredDuration,
        difficulty: 'beginner',
        exercises: fullBodyNoEquipment,
      },
      {
        id: 'weights-full-body',
        title: lang === 'es' ? 'Full Body con Pesas' : 'Weights Full Body',
        description: lang === 'es'
          ? 'Push, pull, piernas y core con mancuernas, barra o kettlebell.'
          : 'Push, pull, legs and core with dumbbells, barbell or kettlebell.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: fullBodyWeights,
      },
      {
        id: 'push-focus',
        title: lang === 'es' ? 'Enfoque Push' : 'Push Focus',
        description: lang === 'es' ? 'Pecho, hombros y tríceps.' : 'Chest, shoulders and triceps.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: pickByCategory('push'),
      },
      {
        id: 'pull-focus',
        title: lang === 'es' ? 'Enfoque Pull' : 'Pull Focus',
        description: lang === 'es' ? 'Espalda, bíceps y deltoides posteriores.' : 'Back, biceps and rear delts.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: pickByCategory('pull'),
      },
      {
        id: 'legs-focus',
        title: lang === 'es' ? 'Enfoque Piernas' : 'Legs Focus',
        description: lang === 'es' ? 'Cuádriceps, femorales y glúteos.' : 'Quads, hamstrings and glutes.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: pickByCategory('legs'),
      },
      {
        id: 'glutes-focus',
        title: lang === 'es' ? 'Enfoque Glúteos' : 'Glutes Focus',
        description: lang === 'es' ? 'Trabajo específico para glúteos y cadera.' : 'Targeted glute and hip development.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: pickByMuscle('glute'),
      },
      {
        id: 'core-focus',
        title: lang === 'es' ? 'Enfoque Core' : 'Core Focus',
        description: lang === 'es' ? 'Estabilidad, abdomen y oblicuos.' : 'Stability, abs and obliques.',
        duration: configuredDuration,
        difficulty: 'beginner',
        exercises: pickByCategory('core'),
      },
      {
        id: 'hiit-focus',
        title: lang === 'es' ? 'Enfoque HIIT / Cardio' : 'HIIT / Cardio Focus',
        description: lang === 'es' ? 'Sesión metabólica para resistencia y gasto calórico.' : 'Metabolic conditioning for endurance and calorie burn.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: pickByCategory('hiit'),
      },
      {
        id: 'boxing-focus',
        title: lang === 'es' ? 'Enfoque Boxeo' : 'Boxing Focus',
        description: lang === 'es' ? 'Trabajo técnico y cardio con base de boxeo.' : 'Technique and cardio with boxing-based work.',
        duration: configuredDuration,
        difficulty: 'intermediate',
        exercises: pickByCategory('boxing_cardio'),
      },
      {
        id: 'mobility-focus',
        title: lang === 'es' ? 'Movilidad y Flexibilidad' : 'Mobility & Flexibility',
        description: lang === 'es' ? 'Sesión de movilidad para recuperación activa.' : 'Mobility session for active recovery.',
        duration: configuredDuration,
        difficulty: 'beginner',
        exercises: pickByCategory('flexibility'),
      },
    ]
      .filter(pack => pack.exercises.length > 0)
      .filter(pack => (rank[pack.difficulty] || 3) <= selectedRank);
  }, [lang, workoutDuration, workoutLevel]);

  const quickStartTargets = useMemo(() => ([
    { id: 'push', icon: '💪', label: lang === 'es' ? 'Pecho / Hombros / Tríceps' : 'Push (Chest / Shoulders / Triceps)' },
    { id: 'pull', icon: '🏋️', label: lang === 'es' ? 'Espalda / Bíceps' : 'Pull (Back / Biceps)' },
    { id: 'legs', icon: '🦵', label: lang === 'es' ? 'Piernas' : 'Legs' },
    { id: 'glutes', icon: '🍑', label: lang === 'es' ? 'Glúteos' : 'Glutes' },
    { id: 'core', icon: '🔥', label: lang === 'es' ? 'Core / Abdomen' : 'Core / Abs' },
    { id: 'full_body', icon: '⚡', label: lang === 'es' ? 'Cuerpo Completo' : 'Full Body' },
  ]), [lang]);

  const quickTargetLabel = useMemo(() => {
    return quickStartTargets.find(target => target.id === quickTarget)?.label || '';
  }, [quickStartTargets, quickTarget]);

  const trainingFeed = useMemo(() => {
    const getTips = (key) => {
      const tips = t(key);
      return Array.isArray(tips) ? tips : [tips];
    };

    return [
      {
        id: 'women',
        tab: t('training.feed.womenTab'),
        title: t('training.feed.womenTitle'),
        description: t('training.feed.womenDesc'),
        tips: getTips('training.feed.womenTips'),
        routines: womenData.sections?.[0]?.routines?.slice(0, 3) || [],
        videoQuery: 'women strength workout technique',
        timerLabel: t('training.feed.womenTimer'),
      },
      {
        id: 'kids',
        tab: t('training.feed.kidsTab'),
        title: t('training.feed.kidsTitle'),
        description: t('training.feed.kidsDesc'),
        tips: getTips('training.feed.kidsTips'),
        routines: kidsData.categories?.[0]?.sessions?.slice(0, 3) || [],
        videoQuery: 'kids yoga flow',
        timerLabel: t('training.feed.kidsTimer'),
      },
      {
        id: 'valgus',
        tab: t('training.feed.valgusTab'),
        title: t('training.feed.valgusTitle'),
        description: t('training.feed.valgusDesc'),
        tips: getTips('training.feed.valgusTips'),
        routines: valgusData.routines?.slice(0, 3) || [],
        videoQuery: 'knee valgus alignment exercises',
        timerLabel: t('training.feed.valgusTimer'),
      },
    ];
  }, [t]);

  const activeFeed = trainingFeed.find(card => card.id === activeFeedId) || trainingFeed[0];

  const getTargetPool = (targetId, source) => {
    if (targetId === 'glutes') {
      return source.filter(ex => ex.muscles.some(m => m.toLowerCase().includes('glute')));
    }
    if (targetId === 'full_body') {
      return source.filter(ex => ['push', 'pull', 'legs', 'core', 'hiit', 'boxing_cardio'].includes(ex.category));
    }
    return source.filter(ex => ex.category === targetId);
  };

  const pickRandom = (items, count) => {
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  };

  const buildQuickStartRoutine = () => {
    if (!quickTarget) return [];

    const homeEquipment = new Set(['bodyweight', 'yoga_mat', 'resistance_bands', 'pushup_handles', 'pullup_bar', 'ab_wheel', 'boxing']);
    const gymEquipment = new Set(['dumbbells', 'kettlebell', 'barbell', 'pullup_bar', 'resistance_bands', 'yoga_mat']);
    const allowedEquipment = quickEnvironment === 'home' ? homeEquipment : gymEquipment;

    let availableExercises = exerciseData.exercises.filter(ex =>
      ex.equipment.some(eq => allowedEquipment.has(eq))
    );

    const levelCap = difficultyRank[quickLevel] || 1;
    const levelFiltered = availableExercises.filter(ex => (difficultyRank[ex.difficulty] || 1) <= levelCap);
    if (levelFiltered.length > 0) {
      availableExercises = levelFiltered;
    }

    const targetPool = getTargetPool(quickTarget, availableExercises);
    const totalByDuration = { '20': 6, '30': 8, '45': 10, '60': 12 };
    const totalExercises = totalByDuration[quickDurationMinutes] || 8;

    if (quickStyle === 'hiit') {
      const hiitPool = availableExercises.filter(ex => ['hiit', 'boxing_cardio'].includes(ex.category));
      const strengthPool = targetPool.filter(ex => !['hiit', 'boxing_cardio'].includes(ex.category));
      const hiitCount = Math.max(2, Math.floor(totalExercises * 0.5));
      const strengthCount = Math.max(0, totalExercises - hiitCount);

      const mixed = [
        ...pickRandom(hiitPool, hiitCount),
        ...pickRandom(strengthPool, strengthCount),
      ];
      const unique = Array.from(new Map(mixed.map(ex => [ex.id, ex])).values());
      if (unique.length > 0) {
        return unique.slice(0, totalExercises);
      }
    }

    const normalPool = quickTarget === 'full_body'
      ? targetPool.filter(ex => !['hiit', 'boxing_cardio'].includes(ex.category))
      : targetPool;

    const basePool = normalPool.length > 0 ? normalPool : targetPool;
    if (basePool.length > 0) {
      return pickRandom(basePool, totalExercises);
    }

    return pickRandom(availableExercises, totalExercises);
  };

  const openQuickStartModal = (targetId) => {
    setQuickTarget(targetId);
    setShowQuickStartModal(true);
  };

  const closeQuickStartModal = () => {
    setShowQuickStartModal(false);
  };

  const handleQuickStart = () => {
    const routine = buildQuickStartRoutine();
    if (routine.length === 0) return;
    setShowQuickStartModal(false);
    startRoutine(routine);
  };

  const toggleEquipment = (eqId) => {
    setSelectedEquipment(prev =>
      prev.includes(eqId) ? prev.filter(id => id !== eqId) : [...prev, eqId]
    );
  };

  const toggleExercise = (exercise) => {
    setSelectedExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      return exists ? prev.filter(e => e.id !== exercise.id) : [...prev, exercise];
    });
  };

  const startRoutine = (exercises) => {
    if (!exercises || exercises.length === 0) return;
    playBeep('start');
    setSelectedExercises(exercises);
    setIsPlaying(true);
  };

  const startPredefined = (routine) => {
    const phase = routine.phases[phaseKey];
    if (!phase) return;
    const exercises = resolveExercises(routine.exerciseIds);
    if (exercises.length === 0) return;
    // Inject phase-specific sets
    const phaseSets = parseInt(phase.sets) || 3;
    const withSets = exercises.map((ex) => ({
      ...ex,
      sets: phaseSets,
    }));
    startRoutine(withSets);
  };

  const finishRoutine = (duration) => {
    tracker.trackWorkout({
      exercises: selectedExercises,
      category: selectedExercises[0]?.category || 'general',
      duration,
    });
    playBeep('complete');
    setIsPlaying(false);
    setSelectedExercises([]);
    setPreviewRoutine(null);
  };

  if (isPlaying) {
    return (
      <div className="animate-in">
        <RoutinePlayer
          exercises={selectedExercises}
          timer={timer}
          onFinish={finishRoutine}
          onBack={() => setIsPlaying(false)}
        />
      </div>
    );
  }

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{t('training.title')}</h1>
        <p>{t('training.subtitle')}</p>
      </div>

      <div className="card quick-start-layout">
        <div className="quick-start-header">
          <h2>{lang === 'es' ? '¿Qué parte del cuerpo deseas entrenar hoy?' : 'Which body part do you want to train today?'}</h2>
          <p>{lang === 'es' ? 'Selecciona una zona para abrir una configuración rápida y comenzar al instante.' : 'Pick a focus area to open a quick setup and start immediately.'}</p>
        </div>
        <div className="quick-body-grid">
          {quickStartTargets.map(target => (
            <button
              key={target.id}
              className="quick-body-btn"
              onClick={() => openQuickStartModal(target.id)}
            >
              <span className="quick-body-icon">{target.icon}</span>
              <span>{target.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="section training-feed">
        <div className="section-title">🧭 {t('training.feed.title')}</div>
        <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>{t('training.feed.subtitle')}</p>
        <div className="sub-tabs feed-tabs">
          {trainingFeed.map(card => (
            <button
              key={card.id}
              className={`sub-tab ${activeFeedId === card.id ? 'active' : ''}`}
              onClick={() => setActiveFeedId(card.id)}
            >
              {card.tab}
            </button>
          ))}
        </div>
        {activeFeed && (
          <div className="feed-grid">
            <div className="feed-card">
              <div>
                <h3>{activeFeed.title}</h3>
                <p>{activeFeed.description}</p>
              </div>
              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-muted)' }}>
                  {t('training.feed.tipsLabel')}
                </strong>
                <ul className="feed-tips">
                  {activeFeed.tips.map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>
              <div>
                <strong style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: 0.6, color: 'var(--text-muted)' }}>
                  {t('training.feed.routinesLabel')}
                </strong>
                <div className="feed-routines">
                  {activeFeed.routines.map((routine, idx) => (
                    <div key={idx} className="feed-routine">
                      <span>{lang === 'es' ? routine.nameEs || routine.name : routine.name}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{routine.duration || routine.level || routine.frequency}</span>
                    </div>
                  ))}
                </div>
              </div>
              <YouTubeCarousel exerciseName={activeFeed.videoQuery} lang={lang} asButton={true} />
              <FeedTimer label={activeFeed.timerLabel} t={t} />
            </div>
          </div>
        )}
      </div>

      {/* View Toggle */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${view === 'predefined' ? 'active' : ''}`}
          onClick={() => setView('predefined')}
        >
          ▶ {t('training.predefined')}
        </button>
        <button
          className={`toggle-btn ${view === 'custom' ? 'active' : ''}`}
          onClick={() => setView('custom')}
        >
          🛠 {t('training.custom')}
        </button>
        <button
          className={`toggle-btn ${view === 'library' ? 'active' : ''}`}
          onClick={() => setView('library')}
        >
          📖 {t('training.exerciseLibrary')}
        </button>
      </div>

      {/* === PREDEFINED VIEW === */}
      {view === 'predefined' && (
        <div className="predefined-view">
          <div className="sub-tabs predefined-subtabs">
            <button
              className={`sub-tab ${predefinedTab === 'library' ? 'active' : ''}`}
              onClick={() => setPredefinedTab('library')}
            >
              🗂️ {t('training.workoutLibrary')}
            </button>
            <button
              className={`sub-tab ${predefinedTab === 'goal' ? 'active' : ''}`}
              onClick={() => setPredefinedTab('goal')}
            >
              🎯 {t('training.goalBased')}
            </button>
          </div>

          {predefinedTab === 'goal' && (
            <>
              {/* Today's Routine */}
              {todayRoutine && !todayRoutine.isRest && (
                <div className="today-routine card">
                  <div className="today-header">
                    <div>
                      <span className="today-badge">{t('training.today')}</span>
                      <h2 className="today-title">
                        {lang === 'es' ? todayRoutine.nameEs : todayRoutine.name}
                      </h2>
                      <p className="today-type">{todayRoutine.type}</p>
                    </div>
                    <button className="btn btn-primary btn-play" onClick={() => startPredefined(todayRoutine)}>
                      ▶ {t('training.play')}
                    </button>
                  </div>
                  <div className="today-meta">
                    <span className="tag">{todayRoutine.duration}</span>
                    <span className="tag">{phaseKey}</span>
                    <span className="tag">{todayRoutine.phases[phaseKey]?.exerciseIds?.length || 0} {t('training.exercises')}</span>
                  </div>
                  {todayRoutine.scienceNote && (
                    <p className="science-note">📚 {todayRoutine.scienceNote}</p>
                  )}
                  {/* Preview exercises */}
                  <div className="today-exercises">
                    {resolveExercises(todayRoutine.phases[phaseKey]?.exerciseIds || []).map(ex => (
                      <div key={ex.id} className="preview-exercise">
                        <span className="preview-name">{getExerciseDisplayName(ex, lang)}</span>
                        <span className="preview-detail">{ex.sets}×{ex.reps}</span>
                      </div>
                    ))}
                  </div>
                  {/* Muscle Map for today */}
                  <div className="today-muscles">
                    <MuscleMap
                      highlightedMuscles={Array.from(new Set(
                        resolveExercises(todayRoutine.phases[phaseKey]?.exerciseIds || [])
                          .flatMap(ex => ex.muscles)
                      ))}
                      lang={lang}
                      compact={true}
                    />
                  </div>
                </div>
              )}

              {todayRoutine?.isRest && (
                <div className="card today-routine rest-day">
                  <h2>{lang === 'es' ? todayRoutine.nameEs : todayRoutine.name}</h2>
                  <p style={{ color: 'var(--text-muted)' }}>
                    {lang === 'es' ? todayRoutine.descriptionEs : todayRoutine.description || t('training.restRecover')}
                  </p>
                </div>
              )}

              {/* Quick Routines */}
              <div className="section">
                <h2 className="section-title">{t('training.quickRoutines')}</h2>
                <div className="grid-3">
                  {predefinedRoutines.quickRoutines.map(qr => {
                    const exercises = resolveExercises(qr.exerciseIds);
                    return (
                      <div key={qr.id} className="quick-routine-card card" onClick={() => setPreviewRoutine(qr)}>
                        <div className="qr-header">
                          <h3>{lang === 'es' ? qr.nameEs : qr.name}</h3>
                          <span className="tag">{qr.duration}</span>
                        </div>
                        <p className="qr-desc">
                          {lang === 'es' ? qr.descriptionEs : qr.description}
                        </p>
                        <div className="qr-meta">
                          <span>{exercises.length} {t('training.exercises')}</span>
                          <span>{qr.difficulty}</span>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={(e) => {
                          e.stopPropagation();
                          startRoutine(exercises);
                        }}>
                          ▶ {t('training.play')}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Full Week Routines  */}
              <div className="section">
                <h2 className="section-title">{t('training.weekPlan')}</h2>
                <div className="week-routines">
                  {predefinedRoutines.routines.map(r => {
                    const isToday = r.dayOfWeek === dayOfWeek;
                    return (
                      <div key={r.id} className={`week-routine-card ${isToday ? 'today' : ''} ${r.isRest ? 'rest' : ''}`}>
                        <div className="wr-day">{lang === 'es' ? r.dayEs : r.day}</div>
                        <div className="wr-name">{lang === 'es' ? r.nameEs : r.name}</div>
                        <div className="wr-type">{r.type}</div>
                        {!r.isRest && (
                          <button className="btn btn-outline btn-sm" onClick={() => startPredefined(r)}>
                            ▶
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {predefinedTab === 'library' && (
            <div className="section">
              <h2 className="section-title">{t('training.workoutLibraryTitle')}</h2>
              <p className="qr-desc">{t('training.workoutLibrarySubtitle')}</p>

              <div className="workout-config-row">
                <div className="workout-config-item">
                  <label htmlFor="workout-duration" className="workout-config-label">{t('training.configDuration')}</label>
                  <select
                    id="workout-duration"
                    className="workout-config-select"
                    value={workoutDuration}
                    onChange={(e) => setWorkoutDuration(e.target.value)}
                  >
                    <option value="short">{t('training.durationShort')}</option>
                    <option value="medium">{t('training.durationMedium')}</option>
                    <option value="long">{t('training.durationLong')}</option>
                  </select>
                </div>
                <div className="workout-config-item">
                  <label htmlFor="workout-level" className="workout-config-label">{t('training.configLevel')}</label>
                  <select
                    id="workout-level"
                    className="workout-config-select"
                    value={workoutLevel}
                    onChange={(e) => setWorkoutLevel(e.target.value)}
                  >
                    <option value="all">{t('training.levelAll')}</option>
                    <option value="beginner">{t('training.beginner')}</option>
                    <option value="intermediate">{t('training.intermediate')}</option>
                    <option value="advanced">{t('training.advanced')}</option>
                  </select>
                </div>
              </div>

              <div className="grid-3">
                {predefinedWorkoutPacks.map(pack => (
                  <div
                    key={pack.id}
                    className="quick-routine-card card"
                    onClick={() => startRoutine(pack.exercises)}
                  >
                    <div className="qr-header">
                      <h3>{pack.title}</h3>
                      <span className="tag">{pack.duration}</span>
                    </div>
                    <p className="qr-desc">{pack.description}</p>
                    <div className="qr-meta">
                      <span>{pack.exercises.length} {t('training.exercises')}</span>
                      <span>{t(`training.${pack.difficulty}`)}</span>
                    </div>
                    <div className="pack-preview-list">
                      {pack.exercises.slice(0, 4).map(ex => (
                        <span key={ex.id} className="pack-preview-item">• {getExerciseDisplayName(ex, lang)}</span>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        startRoutine(pack.exercises);
                      }}
                      style={{ marginTop: 10 }}
                    >
                      ▶ {t('training.play')}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* === CUSTOM VIEW === */}
      {view === 'custom' && (
        <div className="custom-view">
          <EquipmentFilter
            equipment={exerciseData.equipment}
            selected={selectedEquipment}
            onToggle={toggleEquipment}
          />

          <div className="section">
            <div className="sub-tabs">
              <button
                className={`sub-tab ${selectedCategory === null ? 'active' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                {t('common.all')} <span className="sub-tab-count">{equipmentFilteredExercises.length}</span>
              </button>
              {exerciseData.categories.map(cat => {
                const count = equipmentFilteredExercises.filter(ex => ex.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    className={`sub-tab ${selectedCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.name} <span className="sub-tab-count">{count}</span>
                  </button>
                );
              })}
              <button
                className={`sub-tab ${selectedCategory === 'glutes' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('glutes')}
              >
                {t('training.glutes')}{' '}
                <span className="sub-tab-count">
                  {equipmentFilteredExercises.filter(ex => ex.muscles.some(m => m.toLowerCase().includes('glute'))).length}
                </span>
              </button>
            </div>

            {selectedExercises.length > 0 && (
              <div className="card selected-bar">
                <div className="selected-info">
                  <strong>
                    {t('training.exercisesSelected', { count: selectedExercises.length })}
                  </strong>
                  <span className="selected-list">
                    {selectedExercises.map(e => getExerciseDisplayName(e, lang)).join(' → ')}
                  </span>
                </div>
                <div className="selected-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setSelectedExercises([])}>
                    {t('common.clear')}
                  </button>
                  <button className="btn btn-primary" onClick={() => startRoutine(selectedExercises)}>
                    ▶ {t('training.play')}
                  </button>
                </div>
              </div>
            )}

            <div className="grid-results-count">
              {filteredExercises.length} {filteredExercises.length === 1 ? t('training.exercise') : t('training.exercises')}
            </div>

            <div className="grid-3">
              {filteredExercises.map(exercise => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  isSelected={selectedExercises.some(e => e.id === exercise.id)}
                  onToggle={() => toggleExercise(exercise)}
                  equipmentData={exerciseData.equipment}
                  lang={lang}
                />
              ))}
            </div>

            {filteredExercises.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <p>{t('training.noExercises')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* === LIBRARY VIEW === */}
      {view === 'library' && (
        <div className="custom-view">
          <div className="section">
            <div className="sub-tabs">
              <button
                className={`sub-tab ${libraryCategory === null ? 'active' : ''}`}
                onClick={() => setLibraryCategory(null)}
              >
                {t('common.all')} <span className="sub-tab-count">{exerciseData.exercises.length}</span>
              </button>
              {exerciseData.categories.map(cat => {
                const count = exerciseData.exercises.filter(ex => ex.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    className={`sub-tab ${libraryCategory === cat.id ? 'active' : ''}`}
                    onClick={() => setLibraryCategory(cat.id)}
                  >
                    {cat.name} <span className="sub-tab-count">{count}</span>
                  </button>
                );
              })}
            </div>

            {(() => {
              const libraryExercises = libraryCategory
                ? exerciseData.exercises.filter(ex => ex.category === libraryCategory)
                : exerciseData.exercises;
              return (
                <>
                  <div className="grid-results-count">
                    {libraryExercises.length} {libraryExercises.length === 1 ? t('training.exercise') : t('training.exercises')}
                  </div>
                  <div className="grid-3">
                    {libraryExercises.map(exercise => (
                      <ExerciseCard
                        key={exercise.id}
                        exercise={exercise}
                        isSelected={false}
                        onToggle={() => {}}
                        equipmentData={exerciseData.equipment}
                        lang={lang}
                      />
                    ))}
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewRoutine && (
        <div className="modal-backdrop" onClick={() => setPreviewRoutine(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang === 'es' ? previewRoutine.nameEs : previewRoutine.name}</h2>
              <button className="btn btn-ghost" onClick={() => setPreviewRoutine(null)}>✕</button>
            </div>
            <p>{lang === 'es' ? previewRoutine.descriptionEs : previewRoutine.description}</p>
            <div className="preview-exercises-list">
              {resolveExercises(previewRoutine.exerciseIds).map(ex => (
                <div key={ex.id} className="preview-ex-row">
                  <span>{getExerciseDisplayName(ex, lang)}</span>
                  <span className="preview-detail">{ex.sets}×{ex.reps}</span>
                  <span className="tag">{ex.difficulty}</span>
                </div>
              ))}
            </div>
            <MuscleMap
              highlightedMuscles={Array.from(new Set(
                resolveExercises(previewRoutine.exerciseIds).flatMap(ex => ex.muscles)
              ))}
              lang={lang}
            />
            <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }}
              onClick={() => {
                startRoutine(resolveExercises(previewRoutine.exerciseIds));
                setPreviewRoutine(null);
              }}>
              ▶ {t('training.play')}
            </button>
          </div>
        </div>
      )}

      {showQuickStartModal && (
        <div className="modal-backdrop" onClick={closeQuickStartModal}>
          <div className="modal-content quick-start-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{lang === 'es' ? 'Configura tu rutina' : 'Configure your workout'}</h2>
              <button className="btn btn-ghost" onClick={closeQuickStartModal}>✕</button>
            </div>

            <p className="quick-start-target">
              {lang === 'es' ? 'Zona seleccionada:' : 'Selected area:'} <strong>{quickTargetLabel}</strong>
            </p>

            <div className="quick-start-form-grid">
              <label className="quick-start-field">
                <span>{lang === 'es' ? 'Nivel' : 'Level'}</span>
                <select value={quickLevel} onChange={(e) => setQuickLevel(e.target.value)}>
                  <option value="beginner">{t('training.beginner')}</option>
                  <option value="intermediate">{t('training.intermediate')}</option>
                  <option value="advanced">{t('training.advanced')}</option>
                </select>
              </label>

              <label className="quick-start-field">
                <span>{lang === 'es' ? 'Equipo' : 'Equipment'}</span>
                <select value={quickEnvironment} onChange={(e) => setQuickEnvironment(e.target.value)}>
                  <option value="home">{lang === 'es' ? 'Casero' : 'Home'}</option>
                  <option value="gym">{lang === 'es' ? 'Gimnasio' : 'Gym'}</option>
                </select>
              </label>

              <label className="quick-start-field">
                <span>{lang === 'es' ? 'Tipo' : 'Style'}</span>
                <select value={quickStyle} onChange={(e) => setQuickStyle(e.target.value)}>
                  <option value="normal">{lang === 'es' ? 'Normal' : 'Normal'}</option>
                  <option value="hiit">HIIT</option>
                </select>
              </label>

              <label className="quick-start-field">
                <span>{lang === 'es' ? 'Duración' : 'Duration'}</span>
                <select value={quickDurationMinutes} onChange={(e) => setQuickDurationMinutes(e.target.value)}>
                  <option value="20">20 min</option>
                  <option value="30">30 min</option>
                  <option value="45">45 min</option>
                  <option value="60">60 min</option>
                </select>
              </label>
            </div>

            <div className="quick-start-actions">
              <button className="btn btn-ghost" onClick={closeQuickStartModal}>
                {lang === 'es' ? 'Cancelar' : 'Cancel'}
              </button>
              <button className="btn btn-primary" onClick={handleQuickStart}>
                ▶ {lang === 'es' ? 'Iniciar rutina' : 'Start routine'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
