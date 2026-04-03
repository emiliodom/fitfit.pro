import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import kidsData from '../../data/kidsTraining.json';

export default function KidsPage() {
  const { t, lang } = useLanguage();
  const categories = useMemo(() => kidsData.categories || [], []);
  const [activeCategory, setActiveCategory] = useState(categories[0]?.id || 'walking');

  const currentCategory = categories.find(cat => cat.id === activeCategory) || categories[0];

  return (
    <div className="animate-in kids-page">
      <div className="kids-hero">
        <div className="kids-hero-content">
          <span className="kids-badge">{t('kids.badge')}</span>
          <h1>{t('kids.title')}</h1>
          <p>{t('kids.subtitle')}</p>
        </div>
        <div className="kids-hero-sparkles">
          <span>⭐</span>
          <span>🌈</span>
          <span>✨</span>
          <span>💥</span>
        </div>
      </div>

      <div className="kids-category-strip">
        {categories.map(cat => (
          <button
            key={cat.id}
            className={`kids-pill ${activeCategory === cat.id ? 'active' : ''}`}
            style={{ borderColor: cat.color, color: cat.color }}
            onClick={() => setActiveCategory(cat.id)}
          >
            <span className="kids-pill-icon">{cat.icon}</span>
            <span>{lang === 'es' ? cat.nameEs : cat.name}</span>
          </button>
        ))}
      </div>

      {currentCategory && (
        <div className="section">
          <div className="kids-section-header" style={{ borderColor: currentCategory.color }}>
            <h2>{lang === 'es' ? currentCategory.nameEs : currentCategory.name}</h2>
            <p>{lang === 'es' ? currentCategory.descriptionEs : currentCategory.description}</p>
          </div>
          <div className="kids-grid">
            {currentCategory.sessions.map(session => (
              <div key={session.id} className="kids-card">
                <div className="kids-card-top">
                  <div>
                    <h3>{lang === 'es' ? session.nameEs : session.name}</h3>
                    <p>{lang === 'es' ? session.energyEs : session.energy}</p>
                  </div>
                  <span className="kids-time">{session.duration}</span>
                </div>
                <ul>
                  {(lang === 'es' ? session.stepsEs : session.steps).map((step, idx) => (
                    <li key={idx}>{step}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
