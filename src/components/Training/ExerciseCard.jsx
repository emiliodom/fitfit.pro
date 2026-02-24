import { useState } from 'react';
import { createPortal } from 'react-dom';
import YouTubeCarousel from './YouTubeCarousel';
import { useLanguage } from '../../i18n/LanguageContext';
import { getExerciseDisplayName } from '../../utils/exerciseDisplay';

export default function ExerciseCard({ exercise, isSelected, onToggle, equipmentData, lang }) {
  const { t } = useLanguage();
  const [showVideo, setShowVideo] = useState(false);
  const displayName = getExerciseDisplayName(exercise, lang);

  const getEquipmentNames = (eqIds) => {
    return eqIds.map(id => {
      const eq = equipmentData.find(e => e.id === id);
      return eq ? eq.name : id;
    }).join(', ');
  };

  const difficultyColor = {
    beginner: 'var(--accent)',
    intermediate: 'var(--warning)',
    advanced: 'var(--danger)',
  };

  return (
    <>
      <div
        className={`exercise-card ${isSelected ? 'selected' : ''}`}
        onClick={onToggle}
      >
        {isSelected && <div className="ex-check">✓</div>}
        <div className="ex-name">{displayName}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
          {exercise.muscles.map(m => (
            <span key={m} className="tag" style={{ fontSize: '0.65rem' }}>{m}</span>
          ))}
        </div>
        <div className="ex-detail">
          <span>{exercise.sets} sets × {exercise.reps}</span>
          <span style={{ color: difficultyColor[exercise.difficulty], fontSize: '0.75rem', fontWeight: 600 }}>
            {exercise.difficulty}
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <span className="ex-equipment">{getEquipmentNames(exercise.equipment)}</span>
        </div>
        <div style={{ color: 'var(--text-dim)', fontSize: '0.78rem', marginTop: 6, fontStyle: 'italic' }}>
          {exercise.cue}
        </div>
        {/* Video button */}
        <button
          className="ex-video-btn"
          title={t('training.watchForm')}
          onClick={(e) => {
            e.stopPropagation();
            setShowVideo(true);
          }}
        >
          🎬 {t('training.formVideos')}
        </button>
      </div>
      {showVideo && createPortal(
        <YouTubeCarousel
          exerciseName={exercise.name}
          lang={lang || 'en'}
          asModal
          onCloseModal={() => setShowVideo(false)}
        />,
        document.body
      )}
    </>
  );
}
