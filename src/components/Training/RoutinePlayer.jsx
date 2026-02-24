import { useState, useEffect, useRef, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import MuscleMap from './MuscleMap';
import YouTubeCarousel from './YouTubeCarousel';
import SoundSettings from '../SoundSettings';
import { getExerciseDisplayName } from '../../utils/exerciseDisplay';

export default function RoutinePlayer({ exercises: initialExercises, timer, onFinish, onBack }) {
  const { t, lang } = useLanguage();
  const [exerciseList, setExerciseList] = useState(initialExercises);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [routineStartTime] = useState(Date.now());
  const [completedSets, setCompletedSets] = useState({});
  const [videoExercise, setVideoExercise] = useState(null); // for queue video modal
  const currentExercise = exerciseList[currentIndex];

  // ── Drag & Drop state ──
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);
  const [dragIdx, setDragIdx] = useState(null);
  const [dragOverIdx, setDragOverIdx] = useState(null);

  const handleDragStart = useCallback((e, idx) => {
    dragItem.current = idx;
    setDragIdx(idx);
    e.dataTransfer.effectAllowed = 'move';
    // Make drag image semi-transparent
    if (e.target) {
      e.dataTransfer.setDragImage(e.target, 0, 0);
    }
  }, []);

  const handleDragEnter = useCallback((idx) => {
    dragOverItem.current = idx;
    setDragOverIdx(idx);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
      setDragIdx(null);
      setDragOverIdx(null);
      return;
    }
    const from = dragItem.current;
    const to = dragOverItem.current;

    setExerciseList(prev => {
      const copy = [...prev];
      const [moved] = copy.splice(from, 1);
      copy.splice(to, 0, moved);
      return copy;
    });

    // Adjust currentIndex to follow the current exercise
    setCurrentIndex(prev => {
      if (from === prev) return to;
      if (from < prev && to >= prev) return prev - 1;
      if (from > prev && to <= prev) return prev + 1;
      return prev;
    });

    dragItem.current = null;
    dragOverItem.current = null;
    setDragIdx(null);
    setDragOverIdx(null);
  }, []);

  const totalSets = parseInt(currentExercise?.sets) || 3;
  const currentSetCount = completedSets[currentExercise?.id] || 0;

  const completeSet = () => {
    const newCount = currentSetCount + 1;
    setCompletedSets(prev => ({ ...prev, [currentExercise.id]: newCount }));

    if (newCount >= totalSets) {
      if (currentIndex < exerciseList.length - 1) {
        setIsResting(true);
        timer.reset(currentExercise.rest || 60);
        timer.start();
      } else {
        const duration = Math.round((Date.now() - routineStartTime) / 60000);
        onFinish(duration);
      }
    } else {
      setIsResting(true);
      timer.reset(currentExercise.rest || 60);
      timer.start();
    }
  };

  const skipRest = () => {
    timer.pause();
    setIsResting(false);
    if (currentSetCount >= totalSets) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const nextExercise = () => {
    if (currentIndex < exerciseList.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsResting(false);
      timer.reset(60);
    }
  };

  const prevExercise = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsResting(false);
      timer.reset(60);
    }
  };

  useEffect(() => {
    if (isResting && timer.timeLeft <= 0 && !timer.isRunning) {
      setIsResting(false);
      if (currentSetCount >= totalSets && currentIndex < exerciseList.length - 1) {
        setCurrentIndex(prev => prev + 1);
      }
    }
  }, [timer.timeLeft, timer.isRunning, isResting, currentSetCount, totalSets, currentIndex, exerciseList.length]);

  const progress = ((currentIndex / exerciseList.length) * 100).toFixed(0);

  return (
    <div className="routine-player">
      <div className="player-top-bar">
        <button className="btn btn-ghost" onClick={onBack}>
          ← {t('player.back')}
        </button>
        <div className="player-progress-mini">
          <div className="progress-bar" style={{ width: 120, height: 6 }}>
            <div className="progress-fill" style={{ width: `${progress}%` }} />
          </div>
          <span>{progress}%</span>
        </div>
        <span className="player-count">
          {exerciseList.length} {t('player.exercises')}
        </span>
        <SoundSettings />
      </div>

      {/* Progress Dots */}
      <div className="exercise-progress">
        {exerciseList.map((ex, i) => (
          <div
            key={ex.id}
            className={`progress-dot ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'current' : ''}`}
          />
        ))}
      </div>

      {/* Current Exercise Display */}
      <div className="current-exercise">
        <div className="exercise-number">
          {t('player.exercise')} {currentIndex + 1} / {exerciseList.length}
          {isResting && <span className="rest-badge">{t('player.rest')}</span>}
        </div>
        <div className="exercise-title">{getExerciseDisplayName(currentExercise, lang)}</div>
        <div className="exercise-sets">
          {currentExercise.sets} {t('training.sets')} × {currentExercise.reps}
          <span className="set-counter">
            {t('player.set')} {Math.min(currentSetCount + 1, totalSets)} / {totalSets}
          </span>
        </div>
        <div className="exercise-cue">"{currentExercise.cue}"</div>
        <div className="exercise-muscles">
          {currentExercise.muscles.map(m => (
            <span key={m} className="tag">{m}</span>
          ))}
        </div>
      </div>

      {/* Muscle Map for current exercise */}
      <div className="player-muscle-map">
        <MuscleMap
          highlightedMuscles={currentExercise.muscles}
          lang={lang}
          compact={true}
        />
      </div>

      {/* Timer */}
      {isResting && (
        <div className="card rest-timer-card">
          <h4 className="timer-label">{t('player.restTimer')}</h4>
          <div className={`timer-display ${timer.isRunning ? 'running' : ''}`}>
            {timer.display}
          </div>
          <div className="timer-controls">
            <button className="btn btn-primary btn-sm" onClick={skipRest}>
              {t('player.skipRest')} →
            </button>
          </div>
        </div>
      )}

      {/* Controls */}
      {!isResting && (
        <div className="player-controls-section">
          <div className="card timer-card">
            <h4 className="timer-label">{t('player.manualTimer')}</h4>
            <div className={`timer-display ${timer.isRunning ? 'running' : ''}`}>
              {timer.display}
            </div>
            <div className="timer-controls">
              <button className="btn btn-primary btn-sm" onClick={() => timer.start()}>{t('player.start')}</button>
              <button className="btn btn-outline btn-sm" onClick={() => timer.pause()}>{t('player.pause')}</button>
              <button className="btn btn-outline btn-sm" onClick={() => timer.reset(60)}>60s</button>
              <button className="btn btn-outline btn-sm" onClick={() => timer.reset(90)}>90s</button>
              <button className="btn btn-outline btn-sm" onClick={() => timer.reset(120)}>120s</button>
            </div>
          </div>

          <div className="player-controls">
            <button className="btn btn-ghost" onClick={prevExercise} disabled={currentIndex === 0}>
              ← {t('player.prev')}
            </button>
            <button className="btn btn-primary btn-complete" onClick={completeSet}>
              ✓ {t('player.completeSet')} ({currentSetCount + 1}/{totalSets})
            </button>
            <button className="btn btn-ghost" onClick={nextExercise} disabled={currentIndex === exerciseList.length - 1}>
              {t('player.skip')} →
            </button>
          </div>
        </div>
      )}

      {/* YouTube Videos Modal */}
      <div className="video-section">
        <YouTubeCarousel exerciseName={currentExercise.name} lang={lang} asButton={true} />
      </div>

      {/* Exercise Queue — Drag & Drop + Click for Video */}
      <div className="card queue-card">
        <h4 className="queue-title">
          {t('player.queue')}
          <span className="queue-hint">{lang === 'es' ? '↕ arrastrá para reordenar · click para ver video' : '↕ drag to reorder · click to watch video'}</span>
        </h4>
        {exerciseList.map((ex, i) => (
          <div
            key={ex.id}
            className={`queue-item ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''} ${dragIdx === i ? 'dragging' : ''} ${dragOverIdx === i ? 'drag-over' : ''}`}
            draggable
            onDragStart={(e) => handleDragStart(e, i)}
            onDragEnter={() => handleDragEnter(i)}
            onDragOver={(e) => e.preventDefault()}
            onDragEnd={handleDragEnd}
            onTouchStart={() => { dragItem.current = i; setDragIdx(i); }}
          >
            <span className="queue-drag-handle" title={t('player.dragReorder')}>⠿</span>
            <span className={`queue-dot ${i < currentIndex ? 'done' : ''} ${i === currentIndex ? 'active' : ''}`}>
              {i < currentIndex ? '✓' : i + 1}
            </span>
            <div className="queue-info queue-clickable" onClick={() => setVideoExercise(ex.name)}>
              <strong>{getExerciseDisplayName(ex, lang)}</strong>
              <span className="queue-detail">{ex.sets} × {ex.reps}</span>
            </div>
            {i < currentIndex && <span className="queue-status done">{t('player.done')}</span>}
            {i === currentIndex && <span className="queue-status active">{t('player.active')}</span>}
          </div>
        ))}
      </div>

      {/* Queue Video Modal */}
      {videoExercise && (
        <YouTubeCarousel
          exerciseName={videoExercise}
          lang={lang}
          asModal={true}
          onCloseModal={() => setVideoExercise(null)}
        />
      )}
    </div>
  );
}
