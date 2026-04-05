export default function Navbar({
  tabs,
  activeTab,
  onTabChange,
  lang,
  setLang,
  theme,
  setTheme,
  sidebarOpen,
  setSidebarOpen,
}) {
  const isDark = theme !== 'light';
  return (
    <>
      <header className="topbar">
        <div className="topbar-inner">
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label={sidebarOpen ? 'Collapse navigation' : 'Expand navigation'}
            aria-expanded={sidebarOpen}
            aria-controls="app-sidebar"
          >
            {sidebarOpen ? '⟨⟨' : '☰'}
          </button>
          <div className="nav-logo">FitFit.pro</div>
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
      </header>

      <nav
        id="app-sidebar"
        className={`sidebar ${sidebarOpen ? 'open' : 'collapsed'}`}
        aria-label="Primary"
      >
        <div className="nav-tabs">
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`nav-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => onTabChange(tab.id)}
              aria-label={tab.label}
              aria-pressed={activeTab === tab.id}
            >
              <span className="nav-icon">{tab.icon}</span>
              <span className="nav-label">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>
      {sidebarOpen && <div className="sidebar-scrim" onClick={() => setSidebarOpen(false)} />}
    </>
  );
}
