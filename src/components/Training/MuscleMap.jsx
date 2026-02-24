import React from 'react';

const MUSCLE_PATHS = {
  // --- FRONT VIEW ---
  chest: {
    label: 'Chest', labelEs: 'Pecho',
    paths: [
      'M 82,75 Q 90,72 100,74 L 100,90 Q 92,92 82,88 Z',
      'M 118,75 Q 110,72 100,74 L 100,90 Q 108,92 118,88 Z'
    ],
    view: 'front'
  },
  shoulders: {
    label: 'Shoulders', labelEs: 'Hombros',
    paths: [
      'M 70,68 Q 75,60 85,64 L 82,75 Q 74,76 70,72 Z',
      'M 130,68 Q 125,60 115,64 L 118,75 Q 126,76 130,72 Z'
    ],
    view: 'front'
  },
  biceps: {
    label: 'Biceps', labelEs: 'Bíceps',
    paths: [
      'M 68,78 Q 65,88 66,100 L 72,100 Q 76,90 74,78 Z',
      'M 132,78 Q 135,88 134,100 L 128,100 Q 124,90 126,78 Z'
    ],
    view: 'front'
  },
  forearms: {
    label: 'Forearms', labelEs: 'Antebrazos',
    paths: [
      'M 66,100 Q 62,112 60,125 L 66,126 Q 70,114 72,100 Z',
      'M 134,100 Q 138,112 140,125 L 134,126 Q 130,114 128,100 Z'
    ],
    view: 'front'
  },
  abs: {
    label: 'Abs', labelEs: 'Abdominales',
    paths: [
      'M 90,92 L 110,92 L 110,130 Q 100,134 90,130 Z'
    ],
    view: 'front'
  },
  obliques: {
    label: 'Obliques', labelEs: 'Oblicuos',
    paths: [
      'M 82,90 L 90,92 L 90,128 Q 84,126 80,118 Z',
      'M 118,90 L 110,92 L 110,128 Q 116,126 120,118 Z'
    ],
    view: 'front'
  },
  quads: {
    label: 'Quads', labelEs: 'Cuádriceps',
    paths: [
      'M 84,135 Q 82,155 80,175 L 95,178 Q 96,158 95,135 Z',
      'M 116,135 Q 118,155 120,175 L 105,178 Q 104,158 105,135 Z'
    ],
    view: 'front'
  },
  // --- BACK VIEW ---
  traps: {
    label: 'Traps', labelEs: 'Trapecios',
    paths: [
      'M 90,60 Q 100,56 110,60 L 108,70 Q 100,67 92,70 Z'
    ],
    view: 'back'
  },
  lats: {
    label: 'Lats', labelEs: 'Dorsales',
    paths: [
      'M 82,78 Q 80,95 82,112 L 92,108 Q 92,92 90,78 Z',
      'M 118,78 Q 120,95 118,112 L 108,108 Q 108,92 110,78 Z'
    ],
    view: 'back'
  },
  rear_delts: {
    label: 'Rear Delts', labelEs: 'Deltoides Post.',
    paths: [
      'M 72,68 Q 78,62 86,66 L 84,76 Q 76,76 72,72 Z',
      'M 128,68 Q 122,62 114,66 L 116,76 Q 124,76 128,72 Z'
    ],
    view: 'back'
  },
  triceps: {
    label: 'Triceps', labelEs: 'Tríceps',
    paths: [
      'M 70,78 Q 66,90 66,102 L 74,102 Q 78,92 76,78 Z',
      'M 130,78 Q 134,90 134,102 L 126,102 Q 122,92 124,78 Z'
    ],
    view: 'back'
  },
  lower_back: {
    label: 'Lower Back', labelEs: 'Espalda Baja',
    paths: [
      'M 92,108 L 108,108 L 108,130 Q 100,134 92,130 Z'
    ],
    view: 'back'
  },
  glutes: {
    label: 'Glutes', labelEs: 'Glúteos',
    paths: [
      'M 82,130 Q 80,142 84,150 L 100,148 Q 98,138 92,130 Z',
      'M 118,130 Q 120,142 116,150 L 100,148 Q 102,138 108,130 Z'
    ],
    view: 'back'
  },
  hamstrings: {
    label: 'Hamstrings', labelEs: 'Isquiotibiales',
    paths: [
      'M 82,152 Q 80,170 82,188 L 96,188 Q 96,170 94,152 Z',
      'M 118,152 Q 120,170 118,188 L 104,188 Q 104,170 106,152 Z'
    ],
    view: 'back'
  },
  calves: {
    label: 'Calves', labelEs: 'Pantorrillas',
    paths: [
      'M 82,192 Q 80,210 82,228 L 94,228 Q 94,212 92,192 Z',
      'M 118,192 Q 120,210 118,228 L 106,228 Q 106,212 108,192 Z'
    ],
    view: 'back'
  }
};

const BODY_OUTLINE_FRONT = `
  M 100,20
  Q 88,20 86,32 Q 84,42 86,50 Q 88,56 92,58
  Q 84,60 76,62 Q 68,66 66,72 Q 62,80 60,92
  Q 58,104 56,118 Q 54,128 56,132
  Q 58,130 60,126
  L 66,126
  Q 68,132 66,140
  Q 62,150 60,155
  L 64,156
  Q 68,148 72,140
  Q 76,130 80,122
  Q 82,128 84,135
  Q 80,150 78,168
  Q 76,184 78,200
  Q 80,216 82,230
  Q 84,238 82,246
  L 96,248
  Q 98,240 98,230
  Q 100,235 102,230
  Q 102,240 104,248
  L 118,246
  Q 116,238 118,230
  Q 120,216 122,200
  Q 124,184 122,168
  Q 120,150 116,135
  Q 118,128 120,122
  Q 124,130 128,140
  Q 132,148 136,156
  L 140,155
  Q 138,150 134,140
  Q 132,132 134,126
  L 140,126
  Q 142,130 144,132
  Q 146,128 144,118
  Q 142,104 140,92
  Q 138,80 134,72
  Q 132,66 124,62
  Q 116,60 108,58
  Q 112,56 114,50
  Q 116,42 114,32
  Q 112,20 100,20 Z
`;

const BODY_OUTLINE_BACK = BODY_OUTLINE_FRONT;

export default function MuscleMap({ highlightedMuscles = [], lang = 'en', compact = false }) {
  const size = compact ? 140 : 200;
  const activeColor = '#10b981';
  const inactiveColor = '#1e293b';
  const outlineColor = '#334155';

  const frontMuscles = Object.entries(MUSCLE_PATHS).filter(([, v]) => v.view === 'front');
  const backMuscles = Object.entries(MUSCLE_PATHS).filter(([, v]) => v.view === 'back');

  const renderView = (muscles, label) => (
    <div style={{ textAlign: 'center' }}>
      <svg viewBox="40 10 120 250" width={size} height={size * 1.4} style={{ filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.15))' }}>
        {/* Body outline */}
        <path d={BODY_OUTLINE_FRONT} fill="#0f172a" stroke={outlineColor} strokeWidth="1" />

        {/* Muscle groups */}
        {muscles.map(([key, muscle]) => {
          const isActive = highlightedMuscles.some(m =>
            m.toLowerCase().replace(/[\s_-]/g, '') === key.toLowerCase().replace(/[\s_-]/g, '')
          );
          return muscle.paths.map((path, i) => (
            <path
              key={`${key}-${i}`}
              d={path}
              fill={isActive ? activeColor : inactiveColor}
              fillOpacity={isActive ? 0.7 : 0.3}
              stroke={isActive ? activeColor : outlineColor}
              strokeWidth={isActive ? 1.2 : 0.5}
              style={{
                transition: 'all 0.3s ease',
                filter: isActive ? 'drop-shadow(0 0 4px rgba(16,185,129,0.5))' : 'none'
              }}
            >
              <title>{lang === 'es' ? muscle.labelEs : muscle.label}</title>
            </path>
          ));
        })}
      </svg>
      {!compact && <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 4 }}>{label}</div>}
    </div>
  );

  const activeMuscleLabels = highlightedMuscles.map(m => {
    const key = Object.keys(MUSCLE_PATHS).find(k =>
      k.toLowerCase().replace(/[\s_-]/g, '') === m.toLowerCase().replace(/[\s_-]/g, '')
    );
    if (!key) return m;
    return lang === 'es' ? MUSCLE_PATHS[key].labelEs : MUSCLE_PATHS[key].label;
  });

  return (
    <div className="muscle-map" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
      <div style={{ display: 'flex', gap: compact ? 8 : 16, justifyContent: 'center' }}>
        {renderView(frontMuscles, lang === 'es' ? 'Frente' : 'Front')}
        {renderView(backMuscles, lang === 'es' ? 'Espalda' : 'Back')}
      </div>
      {!compact && activeMuscleLabels.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, justifyContent: 'center', marginTop: 4 }}>
          {activeMuscleLabels.map((label, i) => (
            <span key={i} style={{
              background: 'rgba(16,185,129,0.15)',
              color: activeColor,
              padding: '2px 8px',
              borderRadius: 12,
              fontSize: '0.7rem',
              border: `1px solid ${activeColor}33`
            }}>
              {label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
