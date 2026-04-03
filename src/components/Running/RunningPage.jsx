import { useMemo, useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import runningData from '../../data/runningRoutines.json';

export default function RunningPage() {
  const { t, lang } = useLanguage();
  const [activeSection, setActiveSection] = useState('pre_run');

  const sections = useMemo(() => (runningData.sections || []), []);
  const currentSection = sections.find(section => section.id === activeSection) || sections[0];

  const intensityLabels = {
    low: t('running.intensityLow'),
    moderate: t('running.intensityModerate'),
    high: t('running.intensityHigh'),
  };

  return (
    <div className="animate-in running-page">
      <div className="page-header">
        <h1>{t('running.title')}</h1>
        <p>{t('running.subtitle')}</p>
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
              <div key={routine.id} className="run-card">
                <div className="run-card-header">
                  <div>
                    <h3>{lang === 'es' ? routine.nameEs : routine.name}</h3>
                    <p className="run-card-focus">
                      {lang === 'es' ? routine.focusEs : routine.focus}
                    </p>
                  </div>
                  <div className="run-card-meta">
                    <span className="tag">{routine.duration}</span>
                    <span className={`tag ${routine.intensity === 'high' ? 'danger' : routine.intensity === 'moderate' ? 'warning' : 'info'}`}>
                      {intensityLabels[routine.intensity]}
                    </span>
                  </div>
                </div>
                <ul className="run-steps">
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
