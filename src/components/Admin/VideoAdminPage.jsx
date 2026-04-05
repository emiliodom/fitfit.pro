import { useEffect, useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import exerciseData from '../../data/exercises.json';
import { getExerciseDisplayName } from '../../utils/exerciseDisplay';
import {
  buildVideoOverrideExport,
  clearStoredVideoOverrides,
  getStoredVideoOverrides,
  normalizeExerciseKey,
  resolveExerciseVideos,
  setStoredVideoOverrides,
} from '../../utils/videoLibrary';

const SLOT_LABELS = ['formTutorial', 'techniqueTips', 'commonMistakes'];

function makeEmptyDraft(exerciseName) {
  const resolved = resolveExerciseVideos(exerciseName, {});
  return SLOT_LABELS.map((label, index) => ({
    label,
    videoId: resolved[index]?.videoId || '',
    searchQuery: resolved[index]?.searchQuery || exerciseName,
    isShort: Boolean(resolved[index]?.isShort),
  }));
}

function makeDraftFromOverride(exerciseName, override) {
  if (typeof override === 'string') {
    return makeEmptyDraft(exerciseName);
  }

  if (Array.isArray(override) && override.length > 0) {
    return SLOT_LABELS.map((label, index) => ({
      label: override[index]?.label || label,
      videoId: override[index]?.videoId || '',
      searchQuery: override[index]?.searchQuery || exerciseName,
      isShort: Boolean(override[index]?.isShort),
    }));
  }

  return makeEmptyDraft(exerciseName);
}

function cleanDrafts(draftSlots) {
  return draftSlots
    .map((slot) => ({
      label: slot.label,
      videoId: slot.videoId.trim(),
      searchQuery: slot.searchQuery.trim(),
      isShort: Boolean(slot.isShort),
    }))
    .filter((slot) => slot.videoId || slot.searchQuery);
}

export default function VideoAdminPage() {
  const { t, lang } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [draftSlots, setDraftSlots] = useState(() => makeEmptyDraft(''));
  const [aliasTo, setAliasTo] = useState('');
  const [savedMessage, setSavedMessage] = useState('');
  const [storedOverrides, setStoredOverridesState] = useState(() => getStoredVideoOverrides());

  const exerciseList = useMemo(() => {
    const q = normalizeExerciseKey(search);
    return [...exerciseData.exercises]
      .filter((exercise) => {
        if (!q) return true;
        const name = normalizeExerciseKey(getExerciseDisplayName(exercise, lang));
        const rawName = normalizeExerciseKey(exercise.name);
        return name.includes(q) || rawName.includes(q) || (exercise.category || '').toLowerCase().includes(q);
      })
      .sort((a, b) => getExerciseDisplayName(a, lang).localeCompare(getExerciseDisplayName(b, lang)));
  }, [search, lang]);

  const selectedKey = selectedExercise ? normalizeExerciseKey(selectedExercise.name) : '';
  const resolvedVideos = useMemo(
    () => (selectedExercise ? resolveExerciseVideos(selectedExercise.name, storedOverrides) : []),
    [selectedExercise, storedOverrides],
  );

  useEffect(() => {
    if (!selectedExercise) return;
    const override = storedOverrides[selectedKey];
    setDraftSlots(makeDraftFromOverride(selectedExercise.name, override));
    setAliasTo(typeof override === 'string' ? override : '');
  }, [selectedExercise, selectedKey, storedOverrides]);

  useEffect(() => {
    if (exerciseList.length === 0) {
      setSelectedExercise(null);
      return;
    }
    if (!selectedExercise || !exerciseList.find((item) => item.id === selectedExercise.id)) {
      setSelectedExercise(exerciseList[0]);
    }
  }, [exerciseList, selectedExercise]);

  const updateSlot = (index, field, value) => {
    setDraftSlots((prev) => prev.map((slot, slotIndex) => (
      slotIndex === index ? { ...slot, [field]: value } : slot
    )));
  };

  const persistOverride = () => {
    if (!selectedExercise) return;

    const next = { ...storedOverrides };
    if (aliasTo.trim()) {
      next[selectedKey] = aliasTo.trim();
    } else {
      const cleaned = cleanDrafts(draftSlots);
      if (cleaned.length > 0) {
        next[selectedKey] = cleaned;
      } else {
        delete next[selectedKey];
      }
    }

    setStoredVideoOverrides(next);
    setStoredOverridesState(next);
    setSavedMessage(lang === 'es' ? 'Guardado' : 'Saved');
    window.setTimeout(() => setSavedMessage(''), 1800);
  };

  const resetSelected = () => {
    if (!selectedExercise) return;
    const next = { ...storedOverrides };
    delete next[selectedKey];
    setStoredVideoOverrides(next);
    setStoredOverridesState(next);
    setAliasTo('');
    setDraftSlots(makeEmptyDraft(selectedExercise.name));
  };

  const clearAll = () => {
    clearStoredVideoOverrides();
    setStoredOverridesState({});
    setAliasTo('');
    setDraftSlots(makeEmptyDraft(selectedExercise?.name || ''));
  };

  const exportJson = () => {
    const blob = new Blob([buildVideoOverrideExport(storedOverrides)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'fitfit-video-overrides.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const openGoogleSearch = (query) => {
    window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="animate-in admin-page">
      <div className="page-header admin-header">
        <div>
          <span className="eyebrow">Video Studio</span>
          <h1>{t('training.formVideos')}</h1>
          <p>{lang === 'es' ? 'Asigna, reemplaza y exporta los videos de apoyo para cada ejercicio.' : 'Assign, replace, and export support videos for every exercise.'}</p>
        </div>
        <div className="admin-header-actions">
          <button className="btn btn-ghost" onClick={exportJson}>{lang === 'es' ? 'Exportar JSON' : 'Export JSON'}</button>
          <button className="btn btn-outline" onClick={clearAll}>{lang === 'es' ? 'Limpiar todo' : 'Clear all'}</button>
        </div>
      </div>

      <div className="admin-layout">
        <aside className="card admin-sidebar">
          <div className="field-stack">
            <label className="field-label" htmlFor="video-admin-search">{lang === 'es' ? 'Buscar ejercicio' : 'Search exercise'}</label>
            <input
              id="video-admin-search"
              className="field-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={lang === 'es' ? 'Nombre, categoría o músculo' : 'Name, category, or muscle'}
            />
          </div>

          <div className="admin-list">
            {exerciseList.map((exercise) => {
              const key = normalizeExerciseKey(exercise.name);
              const hasOverride = Object.prototype.hasOwnProperty.call(storedOverrides, key);
              return (
                <button
                  key={exercise.id}
                  className={`admin-list-item ${selectedExercise?.id === exercise.id ? 'active' : ''}`}
                  onClick={() => setSelectedExercise(exercise)}
                >
                  <div>
                    <strong>{getExerciseDisplayName(exercise, lang)}</strong>
                    <span>{exercise.category || 'general'}</span>
                  </div>
                  <span className={`tag ${hasOverride ? 'info' : ''}`}>{hasOverride ? 'override' : 'base'}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="card admin-editor">
          {selectedExercise ? (
            <>
              <div className="admin-editor-header">
                <div>
                  <span className="eyebrow">{selectedExercise.category || 'general'}</span>
                  <h2>{getExerciseDisplayName(selectedExercise, lang)}</h2>
                  <p>{lang === 'es' ? 'Edita tres capas de video y guarda el override local.' : 'Edit the three video layers and save a local override.'}</p>
                </div>
                <div className="admin-editor-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => openGoogleSearch(selectedExercise.name)}>
                    {lang === 'es' ? 'Buscar en Google' : 'Search Google'}
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={persistOverride}>
                    {lang === 'es' ? 'Guardar' : 'Save'}
                  </button>
                </div>
              </div>

              {savedMessage && <div className="notice success">{savedMessage}</div>}

              <div className="admin-summary-grid">
                {resolvedVideos.map((video, index) => (
                  <div key={`${video.label}-${index}`} className="admin-summary-card">
                    <span className="tag">{video.label}</span>
                    <strong>{video.videoId || (lang === 'es' ? 'Búsqueda' : 'Search fallback')}</strong>
                    <p>{video.searchQuery}</p>
                  </div>
                ))}
              </div>

              <div className="admin-alias-row">
                <div className="field-stack grow">
                  <label className="field-label" htmlFor="video-admin-alias">{lang === 'es' ? 'Alias a otro ejercicio' : 'Alias another exercise'}</label>
                  <input
                    id="video-admin-alias"
                    className="field-input"
                    value={aliasTo}
                    onChange={(e) => setAliasTo(e.target.value)}
                    placeholder={lang === 'es' ? 'opcional' : 'optional'}
                  />
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setAliasTo('')}>
                  {lang === 'es' ? 'Quitar alias' : 'Clear alias'}
                </button>
                <button className="btn btn-ghost btn-sm" onClick={resetSelected}>
                  {lang === 'es' ? 'Reiniciar ejercicio' : 'Reset exercise'}
                </button>
              </div>

              <div className="admin-slots">
                {draftSlots.map((slot, index) => (
                  <article key={slot.label} className="admin-slot card">
                    <div className="admin-slot-header">
                      <div>
                        <span className="tag">{slot.label}</span>
                        <h3>{slot.label}</h3>
                      </div>
                      <button className="btn btn-ghost btn-sm" onClick={() => openGoogleSearch(slot.searchQuery || selectedExercise.name)}>
                        Google
                      </button>
                    </div>

                    <div className="field-stack">
                      <label className="field-label">YouTube video ID</label>
                      <input
                        className="field-input"
                        value={slot.videoId}
                        onChange={(e) => updateSlot(index, 'videoId', e.target.value)}
                        placeholder="dQw4w9WgXcQ"
                      />
                    </div>

                    <div className="field-stack">
                      <label className="field-label">Search query</label>
                      <input
                        className="field-input"
                        value={slot.searchQuery}
                        onChange={(e) => updateSlot(index, 'searchQuery', e.target.value)}
                        placeholder={selectedExercise.name}
                      />
                    </div>
                  </article>
                ))}
              </div>
            </>
          ) : (
            <div className="empty-state">
              <h2>{lang === 'es' ? 'Selecciona un ejercicio' : 'Select an exercise'}</h2>
              <p>{lang === 'es' ? 'Usa la lista de la izquierda para editar sus videos.' : 'Use the list on the left to edit its videos.'}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}