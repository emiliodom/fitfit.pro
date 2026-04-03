export default function Navbar({ tabs, activeTab, onTabChange, lang, setLang, theme, setTheme }) {
  const isDark = theme !== 'light';
  return (
    <nav className="navbar">
      <div className="nav-inner">
        <div className="nav-logo">FitFit.pro</div>
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
        <div className="nav-controls">
          <button
            className="theme-toggle"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? '🌙 Dark ON' : '☀ Light ON'}
          </button>
          <button
            className="lang-toggle"
            onClick={() => setLang(lang === 'en' ? 'es' : 'en')}
            title={lang === 'en' ? 'Cambiar a Español' : 'Switch to English'}
            aria-label={lang === 'en' ? 'Switch to Spanish' : 'Switch to English'}
          >
            {lang === 'en' ? '🇺🇸 EN ON' : '🇪🇸 ES ON'}
          </button>
        </div>
      </div>
    </nav>
  );
}
