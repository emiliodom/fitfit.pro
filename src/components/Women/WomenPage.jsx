import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import womenData from '../../data/womenRoutines.json';

export default function WomenPage() {
  const { t, lang } = useLanguage();
  const [activeSection, setActiveSection] = useState('strength');

  const sections = useMemo(() => womenData.sections || [], []);
  const currentSection = sections.find(section => section.id === activeSection) || sections[0];

  return (
    <div className="animate-in women-page">
      <div className="page-header">
        <h1>{t('women.title')}</h1>
        <p>{t('women.subtitle')}</p>
      </div>

      <div className="sub-tabs">
        {sections.map(section => (
          <button
            key={section.id}
            className={`sub-tab ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {lang === 'es' ? section.nameEs : section.name}
          </button>
        ))}
      </div>

      {currentSection && (
        <div className="section">
          <div className="section-headline">
            <h2>{lang === 'es' ? currentSection.nameEs : currentSection.name}</h2>
            <p>{lang === 'es' ? currentSection.descriptionEs : currentSection.description}</p>
          </div>

          <div className="grid-2">
            {currentSection.routines.map(routine => (
              <div key={routine.id} className="women-card">
                <div className="women-card-header">
                  <div>
                    <h3>{lang === 'es' ? routine.nameEs : routine.name}</h3>
                    <p>{lang === 'es' ? routine.focusEs : routine.focus}</p>
                  </div>
                  <div className="women-card-meta">
                    <span className="tag">{routine.duration}</span>
                    <span className="tag info">{lang === 'es' ? routine.levelEs : routine.level}</span>
                  </div>
                </div>
                <ul>
                  {(lang === 'es' ? routine.stepsEs : routine.steps).map((step, idx) => (
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
