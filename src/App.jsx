import { useState, useEffect } from 'react';
import { useLanguage } from './i18n/LanguageContext';
import Navbar from './components/Navbar';
import TrainingPage from './components/Training/TrainingPage';
import RunningPage from './components/Running/RunningPage';
import ValgusPage from './components/Valgus/ValgusPage';
import KidsPage from './components/Kids/KidsPage';
import WomenPage from './components/Women/WomenPage';
import SchedulePage from './components/Schedule/SchedulePage';
import NutritionPage from './components/Nutrition/NutritionPage';
import MindfulnessPage from './components/Mindfulness/MindfulnessPage';
import InjuryPreventionPage from './components/InjuryPrevention/InjuryPreventionPage';
import VideoAdminPage from './components/Admin/VideoAdminPage';
import { useRoutineTracker } from './hooks/useRoutineTracker';
import { Activity, Baby, Brain, CalendarDays, Dumbbell, Footprints, Salad, Sparkles, Shield, Video } from 'lucide-react';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('training');
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    try {
      return window.innerWidth > 1120;
    } catch {
      return true;
    }
  });
  const tracker = useRoutineTracker();
  const { t, lang, setLang } = useLanguage();
  const [quoteIndex, setQuoteIndex] = useState(0);
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem('fitfit_theme') || 'dark';
    } catch {
      return 'dark';
    }
  });

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

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('fitfit_theme', theme);
    } catch {}
  }, [theme]);

  const TABS = [
    { id: 'training', label: t('nav.training'), icon: <Dumbbell size={16} /> },
    { id: 'running', label: t('nav.running'), icon: <Footprints size={16} /> },
    { id: 'valgus', label: t('nav.valgus'), icon: <Shield size={16} /> },
    { id: 'kids', label: t('nav.kids'), icon: <Baby size={16} /> },
    { id: 'women', label: t('nav.women'), icon: <Sparkles size={16} /> },
    { id: 'schedule', label: t('nav.schedule'), icon: <CalendarDays size={16} /> },
    { id: 'nutrition', label: t('nav.nutrition'), icon: <Salad size={16} /> },
    { id: 'mindfulness', label: t('nav.mindfulness'), icon: <Brain size={16} /> },
    { id: 'injury', label: t('nav.recovery'), icon: <Activity size={16} /> },
    { id: 'video-admin', label: 'Video Studio', icon: <Video size={16} /> },
  ];

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`app ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
      <Navbar
        tabs={TABS}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      {heroQuote && (
        <div className="motivational-quote">
          <span className="quote-icon">💡</span>
          <p>{heroQuote}</p>
        </div>
      )}
      <main className="main-container">
        {activeTab === 'training' && <TrainingPage tracker={tracker} />}
        {activeTab === 'running' && <RunningPage tracker={tracker} />}
        {activeTab === 'valgus' && <ValgusPage tracker={tracker} />}
        {activeTab === 'kids' && <KidsPage tracker={tracker} />}
        {activeTab === 'women' && <WomenPage tracker={tracker} />}
        {activeTab === 'schedule' && <SchedulePage tracker={tracker} />}
        {activeTab === 'nutrition' && <NutritionPage />}
        {activeTab === 'mindfulness' && <MindfulnessPage />}
        {activeTab === 'injury' && <InjuryPreventionPage />}
        {activeTab === 'video-admin' && <VideoAdminPage />}
      </main>
      <footer className="app-footer">
        <p>FitFit.pro v0.2 — V-Taper Recomp OS</p>
      </footer>
    </div>
  );
}

export default App;
