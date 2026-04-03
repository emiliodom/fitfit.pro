import { useState, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import TrainingPage from './components/Training/TrainingPage';
import RunningPage from './components/Running/RunningPage';
import ValgusPage from './components/Valgus/ValgusPage';
import KidsPage from './components/Kids/KidsPage';
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
  const [quoteIndex, setQuoteIndex] = useState(0);

  const quotes = t('quotes');
  const heroQuote = Array.isArray(quotes) && quotes.length > 0 ? quotes[quoteIndex] : '';

  useEffect(() => {
    if (!Array.isArray(quotes) || quotes.length === 0) return;
    setQuoteIndex(Math.floor(Math.random() * quotes.length));
  }, [quotes]);

  useEffect(() => {
    if (!Array.isArray(quotes) || quotes.length <= 1) return;
    const intervalId = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % quotes.length);
    }, 10000);
    return () => clearInterval(intervalId);
  }, [quotes]);

  const TABS = [
    { id: 'training', label: t('nav.training'), icon: '⚡' },
    { id: 'running', label: t('nav.running'), icon: '🏃' },
    { id: 'valgus', label: t('nav.valgus'), icon: '🦵' },
    { id: 'kids', label: t('nav.kids'), icon: '🌈' },
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
      {heroQuote && (
        <div className="motivational-quote">
          <span className="quote-icon">💡</span>
          <p>{heroQuote}</p>
        </div>
      )}
      <main className="main-container">
        {activeTab === 'training' && <TrainingPage tracker={tracker} />}
        {activeTab === 'running' && <RunningPage />}
        {activeTab === 'valgus' && <ValgusPage />}
        {activeTab === 'kids' && <KidsPage />}
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
