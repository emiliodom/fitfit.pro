import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider } from '../i18n/LanguageContext';
import App from '../App.jsx';

const renderApp = () =>
  render(
    <LanguageProvider>
      <App />
    </LanguageProvider>
  );

describe('App navigation', () => {
  beforeEach(() => {
    localStorage.setItem('fitfit_lang', 'en');
  });

  it('shows core nav tabs', () => {
    renderApp();
    expect(screen.getByRole('button', { name: /Training/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Running/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Valgus/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cataleya/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Women/i })).toBeInTheDocument();
  });

  it('switches tabs and updates header', async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Running/i }));
    expect(screen.getByRole('heading', { name: /Running Lab/i })).toBeInTheDocument();
  });

  it('toggles language labels', async () => {
    renderApp();
    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /Switch to Spanish/i }));
    expect(screen.getByRole('button', { name: /Entrenamiento/i })).toBeInTheDocument();
  });

  it('toggles theme state', async () => {
    renderApp();
    const user = userEvent.setup();
    const themeToggle = screen.getByRole('button', { name: /Switch to Light Theme/i });
    await user.click(themeToggle);
    expect(document.body.getAttribute('data-theme')).toBe('light');
  });
});
