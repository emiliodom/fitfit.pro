import { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { SOUND_PACKS, getSoundPack, setSoundPack, getVolume, setVolume, playBeep } from '../utils/audio';

export default function SoundSettings() {
  const { t } = useLanguage();
  const [pack, setPack] = useState(getSoundPack());
  const [vol, setVol] = useState(getVolume());
  const [open, setOpen] = useState(false);

  const handlePack = (key) => {
    setPack(key);
    setSoundPack(key);
    playBeep('start');
  };

  const handleVolume = (e) => {
    const v = parseFloat(e.target.value);
    setVol(v);
    setVolume(v);
  };

  if (!open) {
    return (
      <button
        className="sound-toggle-btn"
        onClick={() => setOpen(true)}
        title={t('sound.settings')}
      >
        🔊
      </button>
    );
  }

  return (
    <div className="sound-settings">
      <div className="sound-settings-header">
        <span>🔊 {t('sound.title')}</span>
        <button className="sound-close-btn" onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="sound-pack-list">
        {Object.entries(SOUND_PACKS).map(([key, p]) => (
          <button
            key={key}
            className={`sound-pack-btn ${pack === key ? 'active' : ''}`}
            onClick={() => handlePack(key)}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="sound-volume">
        <label>{t('sound.volume')}</label>
        <input
          type="range"
          min="0"
          max="0.3"
          step="0.01"
          value={vol}
          onChange={handleVolume}
          onMouseUp={() => playBeep('tick')}
          onTouchEnd={() => playBeep('tick')}
        />
      </div>
    </div>
  );
}
