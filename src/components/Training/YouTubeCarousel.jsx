import React, { useState, useEffect, useRef } from 'react';
import exerciseVideos from '../../data/exerciseVideos.json';

/* ── Resolve video entries: JSON-mapped first, then search fallback ── */
function resolveVideos(exerciseName) {
  const key = exerciseName.toLowerCase().replace(/[()]/g, '').trim();
  const mapped = exerciseVideos[key] || [];
  const base = exerciseName.replace(/[()]/g, '').trim();

  // 3 focused slots: primary form, auxiliary / technique, common mistakes
  const slots = [
    { label: 'formTutorial',     searchQuery: `${base} proper form tutorial`,       isShort: false },
    { label: 'techniqueTips',    searchQuery: `${base} technique tips`,             isShort: false },
    { label: 'commonMistakes',   searchQuery: `${base} common mistakes`,            isShort: false },
  ];

  return slots.map(slot => {
    // Check if JSON has a direct video for this slot
    const found = mapped.find(m => m.label === slot.label);
    if (found) {
      return {
        ...slot,
        videoId: found.videoId,
        isShort: found.isShort ?? slot.isShort,
      };
    }
    // Fallback: no videoId → will use search embed
    return slot;
  });
}

/* ── Embed URL helpers ── */
function directEmbedUrl(videoId, isShort = false) {
  // Shorts still play well in standard embed
  return `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
}

function searchEmbedUrl(query, isShort = false) {
  const q = isShort ? `${query} #shorts` : query;
  return `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(q)}&autoplay=1&rel=0`;
}

function embedUrl(entry) {
  if (entry.videoId) return directEmbedUrl(entry.videoId, entry.isShort);
  return searchEmbedUrl(entry.searchQuery, entry.isShort);
}

function youtubeWatchUrl(entry) {
  if (entry.videoId) {
    return entry.isShort
      ? `https://www.youtube.com/shorts/${entry.videoId}`
      : `https://www.youtube.com/watch?v=${entry.videoId}`;
  }
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(entry.searchQuery)}`;
}

const ICONS = { formTutorial: '🎬', techniqueTips: '🔍', commonMistakes: '⚠️' };
const LABEL_MAP = {
  en: {
    formTutorial: 'Form Tutorial',
    techniqueTips: 'Aux / Technique',
    commonMistakes: 'Common Mistakes',
    formVideos: 'Form Videos',
    watchOn: 'Watch on YouTube',
    close: 'Close',
    loading: 'Loading video…',
    noPreview: 'Click to search on YouTube',
  },
  es: {
    formTutorial: 'Tutorial de Forma',
    techniqueTips: 'Aux / Técnica',
    commonMistakes: 'Errores Comunes',
    formVideos: 'Videos de Forma',
    watchOn: 'Ver en YouTube',
    close: 'Cerrar',
    loading: 'Cargando video…',
    noPreview: 'Click para buscar en YouTube',
  },
};

/* ── YouTube search embed URL (no API key needed) ── */
// (moved to helpers above)

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
            {active.videoId && <span className="yt-badge-direct">HD</span>}
          </div>
          <button className="yt-modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Main Player */}
        <div className={`yt-modal-player ${active.isShort ? 'yt-modal-short' : ''}`}>
          <iframe
            key={`${activeIdx}-${active.videoId || active.searchQuery}`}
            src={playerUrl}
            title={active.searchQuery}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            frameBorder="0"
          />
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
                {v.videoId && <span className="yt-modal-thumb-hd">●</span>}
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
          🔎 {labels.watchOn} →
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

  const videos = resolveVideos(exerciseName);
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
        <button className="btn btn-outline yt-open-btn" onClick={() => openModal(0)} style={{ width: '100%' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#FF0000" style={{ marginRight: 8 }}>
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
