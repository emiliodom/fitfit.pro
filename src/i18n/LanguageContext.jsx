import { createContext, useContext, useState, useCallback } from 'react';
import en from './en.json';
import es from './es.json';

const translations = { en, es };
const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('fitfit_lang') || 'es';
    } catch { return 'es'; }
  });

  const switchLang = useCallback((newLang) => {
    setLang(newLang);
    try { localStorage.setItem('fitfit_lang', newLang); } catch {}
  }, []);

  const t = useCallback((path, replacements = {}) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        // Fallback to English
        let fallback = translations.en;
        for (const k of keys) fallback = fallback?.[k];
        value = fallback || path;
        break;
      }
    }
    if (typeof value === 'string') {
      Object.entries(replacements).forEach(([k, v]) => {
        value = value.replace(`{${k}}`, v);
      });
    }
    return value || path;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang: switchLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
