import exerciseVideos from '../data/exerciseVideos.json';
import exerciseVideoOverrides from '../data/exerciseVideoOverrides.json';

export const VIDEO_OVERRIDE_STORAGE_KEY = 'fitfit_video_overrides_v1';

export function normalizeExerciseKey(name) {
  return String(name || '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

export function getStoredVideoOverrides() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(VIDEO_OVERRIDE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function setStoredVideoOverrides(overrides) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(VIDEO_OVERRIDE_STORAGE_KEY, JSON.stringify(overrides || {}));
  } catch {
    // Ignore storage quota / privacy failures.
  }
}

export function clearStoredVideoOverrides() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(VIDEO_OVERRIDE_STORAGE_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function fallbackVideos(baseName) {
  return [
    { label: 'formTutorial', searchQuery: `${baseName} proper form tutorial`, isShort: false },
    { label: 'techniqueTips', searchQuery: `${baseName} technique tips`, isShort: false },
    { label: 'commonMistakes', searchQuery: `${baseName} common mistakes`, isShort: false },
  ];
}

function resolveFromMap(name, source, seen = new Set()) {
  const key = normalizeExerciseKey(name);
  if (!key || seen.has(key)) return null;

  const entry = source?.[key];
  if (!entry) return null;

  if (Array.isArray(entry)) {
    return entry.map((video, index) => ({
      label: video.label || (video.isShort ? 'short' : index === 0 ? 'formTutorial' : 'techniqueTips'),
      videoId: video.videoId,
      isShort: Boolean(video.isShort),
      searchQuery: video.searchQuery || name,
    }));
  }

  if (typeof entry === 'string') {
    seen.add(key);
    return resolveFromMap(entry, source, seen);
  }

  return null;
}

export function resolveExerciseVideos(exerciseName, localOverrides = getStoredVideoOverrides()) {
  const baseName = String(exerciseName || '').replace(/[()]/g, '').trim();
  const key = normalizeExerciseKey(baseName);
  const mergedOverrides = {
    ...exerciseVideoOverrides,
    ...localOverrides,
  };

  const resolveAcrossSources = (name, seen = new Set()) => {
    const sources = [mergedOverrides, exerciseVideos];
    for (const source of sources) {
      const resolved = resolveFromMap(name, source, new Set(seen));
      if (resolved) return resolved;
    }

    const normalized = normalizeExerciseKey(name);
    for (const source of sources) {
      const entry = source?.[normalized];
      if (typeof entry === 'string' && !seen.has(normalized)) {
        const nextSeen = new Set(seen);
        nextSeen.add(normalized);
        const aliasResolved = resolveAcrossSources(entry, nextSeen);
        if (aliasResolved) return aliasResolved;
      }
    }

    return null;
  };

  const resolved = resolveAcrossSources(key);
  if (resolved && resolved.length > 0) {
    return resolved.map((entry) => ({
      ...entry,
      searchQuery: entry.searchQuery || baseName,
    }));
  }

  return fallbackVideos(baseName);
}

export function buildVideoOverrideExport(overrides = getStoredVideoOverrides()) {
  return JSON.stringify(overrides, null, 2);
}
