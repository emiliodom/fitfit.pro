import { useState, useMemo } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import TrainingPage from './components/Training/TrainingPage';
import SchedulePage from './components/Schedule/SchedulePage';
import NutritionPage from './components/Nutrition/NutritionPage';
import MindfulnessPage from './components/Mindfulness/MindfulnessPage';
import InjuryPreventionPage from './components/InjuryPrevention/InjuryPreventionPage';
import { useRoutineTracker } from './hooks/useRoutineTracker';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('training');
  const tracker = useRoutineTracker();
  const { t, lang, setLang } = useLanguage();

  const quotes = t('quotes');
  const dailyQuote = useMemo(() => {
    if (!Array.isArray(quotes)) return '';
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000);
    return quotes[dayOfYear % quotes.length];
  }, [quotes]);

  const TABS = [
    { id: 'training', label: t('nav.training'), icon: '⚡' },
    { id: 'schedule', label: t('nav.schedule'), icon: '📅' },
    { id: 'nutrition', label: t('nav.nutrition'), icon: '🥗' },
    { id: 'mindfulness', label: t('nav.mindfulness'), icon: '🧘' },
    { id: 'injury', label: t('nav.recovery'), icon: '🛡️' },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <Navbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={lang}
        setLang={setLang}
      />
      {dailyQuote && (
        <div className="motivational-quote">
          <span className="quote-icon">💡</span>
          <p>{dailyQuote}</p>
        </div>
      )}
      <main className="main-container">
        {activeTab === 'training' && <TrainingPage tracker={tracker} />}
        {activeTab === 'schedule' && <SchedulePage tracker={tracker} />}
        {activeTab === 'nutrition' && <NutritionPage />}
        {activeTab === 'mindfulness' && <MindfulnessPage />}
        {activeTab === 'injury' && <InjuryPreventionPage />}
      </main>
      <footer className="app-footer">
        <p>FitFit.pro v0.2 — V-Taper Recomp OS</p>
      </footer>
    </div>
  );
}

export default App;
