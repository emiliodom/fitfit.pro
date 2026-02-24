// Audio utilities for workout feedback — configurable sound packs
const audioCtx = typeof window !== 'undefined'
  ? new (window.AudioContext || window.webkitAudioContext)()
  : null;

const STORAGE_KEY = 'fitfit-sound-pack';
const VOLUME_KEY = 'fitfit-sound-volume';

export const SOUND_PACKS = {
  classic: {
    label: '🔔 Classic Beep',
    start:    { freq: 880, type: 'sine',   dur: 0.1 },
    end:      { freq: 600, freqEnd: 300, type: 'square', dur: 0.5 },
    tick:     { freq: 440, type: 'sine',   dur: 0.05 },
    complete: { freq: 523, freq2: 659, type: 'sine', dur: 0.15 },
  },
  gym: {
    label: '🏋️ Gym Bell',
    start:    { freq: 1200, type: 'triangle', dur: 0.08 },
    end:      { freq: 800, freqEnd: 400, type: 'sawtooth', dur: 0.4 },
    tick:     { freq: 600, type: 'triangle', dur: 0.04 },
    complete: { freq: 784, freq2: 988, type: 'triangle', dur: 0.2 },
  },
  soft: {
    label: '🌊 Soft Chime',
    start:    { freq: 660, type: 'sine', dur: 0.2 },
    end:      { freq: 440, freqEnd: 220, type: 'sine', dur: 0.6 },
    tick:     { freq: 330, type: 'sine', dur: 0.08 },
    complete: { freq: 440, freq2: 554, type: 'sine', dur: 0.25 },
  },
  none: {
    label: '🔇 Silent',
    start: null, end: null, tick: null, complete: null,
  },
};

export function getSoundPack() {
  if (typeof window === 'undefined') return 'classic';
  return localStorage.getItem(STORAGE_KEY) || 'classic';
}

export function setSoundPack(pack) {
  localStorage.setItem(STORAGE_KEY, pack);
}

export function getVolume() {
  if (typeof window === 'undefined') return 0.1;
  return parseFloat(localStorage.getItem(VOLUME_KEY) || '0.1');
}

export function setVolume(v) {
  localStorage.setItem(VOLUME_KEY, String(v));
}

export function playBeep(type = 'start') {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const pack = SOUND_PACKS[getSoundPack()] || SOUND_PACKS.classic;
  const cfg = pack[type];
  if (!cfg) return;

  const vol = getVolume();
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  osc.type = cfg.type;
  osc.frequency.setValueAtTime(cfg.freq, audioCtx.currentTime);
  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);

  if (cfg.freqEnd) {
    osc.frequency.exponentialRampToValueAtTime(cfg.freqEnd, audioCtx.currentTime + cfg.dur);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + cfg.dur);
  }

  osc.start();
  osc.stop(audioCtx.currentTime + cfg.dur);

  // Two-tone for complete
  if (cfg.freq2) {
    setTimeout(() => {
      const osc2 = audioCtx.createOscillator();
      const gain2 = audioCtx.createGain();
      osc2.connect(gain2);
      gain2.connect(audioCtx.destination);
      osc2.type = cfg.type;
      osc2.frequency.setValueAtTime(cfg.freq2, audioCtx.currentTime);
      gain2.gain.setValueAtTime(vol, audioCtx.currentTime);
      osc2.start();
      osc2.stop(audioCtx.currentTime + 0.2);
    }, 150);
  }
}
