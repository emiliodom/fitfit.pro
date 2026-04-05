import React, { useState, useEffect, useRef } from 'react';
import { resolveExerciseVideos } from '../../utils/videoLibrary';

export { resolveExerciseVideos };

/* ── Embed URL helpers ── */
function embedUrl(entry) {
  if (!entry?.videoId) return '';
  return `https://www.youtube.com/embed/${encodeURIComponent(entry.videoId)}?rel=0&modestbranding=1&playsinline=1`;
}

function youtubeWatchUrl(entry) {
  if (entry?.videoId) {
    return `https://www.youtube.com/watch?v=${encodeURIComponent(entry.videoId)}`;
  }
  return `https://www.google.com/search?q=${encodeURIComponent(entry.searchQuery)}`;
}

const ICONS = { formTutorial: '🎬', techniqueTips: '🔍', commonMistakes: '⚠️', short: '⚡' };
const LABEL_MAP = {
  en: {
    formTutorial: 'Form Tutorial',
    techniqueTips: 'Aux / Technique',
    commonMistakes: 'Common Mistakes',
    short: 'Short',
    formVideos: 'Form Videos',
    watchOn: 'Open on YouTube',
    close: 'Close',
    loading: 'Loading video…',
    noPreview: 'No direct video saved yet.',
    searchGoogle: 'Search on Google',
    searchYoutube: 'Search on YouTube',
  },
  es: {
    formTutorial: 'Tutorial de Forma',
    techniqueTips: 'Aux / Técnica',
    commonMistakes: 'Errores Comunes',
    short: 'Corto',
    formVideos: 'Videos de Forma',
    watchOn: 'Abrir en YouTube',
    close: 'Cerrar',
    loading: 'Cargando video…',
    noPreview: 'No hay un video directo guardado.',
    searchGoogle: 'Buscar en Google',
    searchYoutube: 'Buscar en YouTube',
  },
};

function youtubeSearchUrl(query) {
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

function thumbColor(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 40%, 25%)`;
}

/* ── Modal Component ── */
function VideoModal({ exerciseName, videos, labels, activeIdx, setActiveIdx, onClose }) {
  const overlayRef = useRef(null);
  const active = videos[activeIdx];
  const footerLabel = active?.videoId ? labels.watchOn : labels.searchGoogle;

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  const playerUrl = embedUrl(active);

  return (
    <div className="yt-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="yt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="yt-modal-header">
          <div className="yt-modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#FF0000">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
              <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fff"/>
            </svg>
            <span>{exerciseName}</span>
            <span className="yt-badge-direct">WEB</span>
          </div>
          <button className="yt-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Main Player */}
        <div className={`yt-modal-player ${active.isShort ? 'yt-modal-short' : ''}`}>
          {playerUrl ? (
            <iframe
              key={`${activeIdx}-${active.videoId || active.searchQuery}`}
              src={playerUrl}
              title={active.searchQuery}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              frameBorder="0"
            />
          ) : (
            <div className="yt-modal-empty">
              <p>{labels.noPreview}</p>
              <div className="yt-modal-links">
                <a href={`https://www.google.com/search?q=${encodeURIComponent(active.searchQuery)}`} target="_blank" rel="noopener noreferrer">
                  🔎 {labels.searchGoogle}
                </a>
                <a href={youtubeSearchUrl(active.searchQuery)} target="_blank" rel="noopener noreferrer">
                  ▶ {labels.searchYoutube}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Video Selector Strip */}
        <div className="yt-modal-strip">
          {videos.map((v, i) => (
            <button
              key={i}
              className={`yt-modal-thumb ${i === activeIdx ? 'active' : ''}`}
              onClick={() => setActiveIdx(i)}
            >
              <div className="yt-modal-thumb-bg" style={{ background: thumbColor(v.searchQuery) }}>
                <span className="yt-modal-thumb-icon">{ICONS[v.label] || '🎬'}</span>
                {i === activeIdx && <div className="yt-modal-thumb-playing">▶</div>}
                <span className="yt-modal-thumb-hd">●</span>
              </div>
              <span className="yt-modal-thumb-label">{labels[v.label]}</span>
            </button>
          ))}
        </div>

        {/* Footer link */}
        <a
          href={youtubeWatchUrl(active)}
          target="_blank"
          rel="noopener noreferrer"
          className="yt-modal-external"
        >
          🔎 {footerLabel} →
        </a>
      </div>
    </div>
  );
}

/* ── Main Export ── */
export default function YouTubeCarousel({ exerciseName, lang = 'en', asButton = false, asModal = false, onCloseModal }) {
  const [showModal, setShowModal] = useState(asModal);
  const [activeIndex, setActiveIndex] = useState(0);

  if (!exerciseName) return null;

  const videos = resolveExerciseVideos(exerciseName);
  const labels = LABEL_MAP[lang] || LABEL_MAP.en;

  const openModal = (idx = 0) => {
    setActiveIndex(idx);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    if (onCloseModal) onCloseModal();
  };

  // Direct modal mode (opened from queue click)
  if (asModal) {
    return (
      <VideoModal
        exerciseName={exerciseName}
        videos={videos}
        labels={labels}
        activeIdx={activeIndex}
        setActiveIdx={setActiveIndex}
        onClose={closeModal}
      />
    );
  }

  // Button-only mode (used inside RoutinePlayer)
  if (asButton) {
    return (
      <>
        <button className="btn btn-outline yt-open-btn yt-open-btn-full" onClick={() => openModal(0)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000" className="yt-open-icon">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
            <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fff"/>
          </svg>
          {labels.formVideos}
        </button>
        {showModal && (
          <VideoModal
            exerciseName={exerciseName}
            videos={videos}
            labels={labels}
            activeIdx={activeIndex}
            setActiveIdx={setActiveIndex}
            onClose={closeModal}
          />
        )}
      </>
    );
  }

  // Card carousel mode (legacy — still usable elsewhere)
  return (
    <div className="youtube-carousel">
      <div className="yt-carousel-header">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="#FF0000">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/>
          <path d="M9.545 15.568V8.432L15.818 12l-6.273 3.568z" fill="#fff"/>
        </svg>
        <span>{labels.formVideos}</span>
      </div>
      <div className="yt-carousel-track">
        {videos.slice(1).map((v, i) => (
          <button
            key={i}
            className={`yt-card ${i + 1 === activeIndex ? 'yt-card-active' : ''}`}
            onClick={() => openModal(i + 1)}
          >
            <div className="yt-card-thumb" style={{ background: thumbColor(v.searchQuery) }}>
              <span className="yt-card-icon">{ICONS[v.label] || '🎬'}</span>
              <div className="yt-play-btn">▶</div>
            </div>
            <div className="yt-card-label">{labels[v.label]}</div>
          </button>
        ))}
      </div>
      {showModal && (
        <VideoModal
          exerciseName={exerciseName}
          videos={videos}
          labels={labels}
          activeIdx={activeIndex}
          setActiveIdx={setActiveIndex}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
