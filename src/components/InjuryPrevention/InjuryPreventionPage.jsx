import { useState, useCallback } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import { useTimer } from '../../hooks/useTimer';
import SoundSettings from '../SoundSettings';
import ipData from '../../data/injuryPrevention.json';

function parseDuration(durStr) {
  // "2 min per side" → 120, "60 sec" → 60, "90 sec per side" → 90
  const match = durStr.match(/(\d+)\s*(min|sec)/);
  if (!match) return 60;
  const val = parseInt(match[1]);
  return match[2] === 'min' ? val * 60 : val;
}

function StretchTimer({ durationStr }) {
  const { t } = useLanguage();
  const seconds = parseDuration(durationStr);
  const timer = useTimer(seconds);
  const [finished, setFinished] = useState(false);

  const handleStart = useCallback(() => {
    setFinished(false);
    timer.reset(seconds);
    setTimeout(() => timer.start(), 50);
  }, [timer, seconds]);

  // Check for completion
  if (timer.timeLeft <= 0 && !timer.isRunning && !finished && timer.timeLeft !== seconds) {
    setFinished(true);
  }

  return (
    <div className="stretch-timer">
      <div className="stretch-timer-display">{timer.display}</div>
      {!timer.isRunning && !finished && (
        <button className="btn btn-accent btn-sm" onClick={handleStart}>
          ⏱ {t('recovery.startTimer')}
        </button>
      )}
      {timer.isRunning && (
        <div className="stretch-timer-status">
          <span className="pulse-dot" /> {t('recovery.timerRunning')}
          <button className="btn btn-ghost btn-sm" onClick={timer.pause} style={{ marginLeft: 8 }}>
            ⏸
          </button>
        </div>
      )}
      {finished && (
        <div className="stretch-timer-done">✅ {t('recovery.timerDone')}</div>
      )}
    </div>
  );
}

export default function InjuryPreventionPage() {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('stretches');
  const [expandedArticle, setExpandedArticle] = useState(null);
  const [expandedStretch, setExpandedStretch] = useState(null);

  const categoryLabels = {
    upper_body: t('recovery.upperBody'),
    lower_body: t('recovery.lowerBody'),
    spine: t('recovery.spine'),
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{t('recovery.title')}</h1>
        <p>{t('recovery.subtitle')}</p>
      </div>

      <div className="sub-tabs">
        <button className={`sub-tab ${activeSection === 'stretches' ? 'active' : ''}`} onClick={() => setActiveSection('stretches')}>
          {t('recovery.stretchDashboard')}
        </button>
        <button className={`sub-tab ${activeSection === 'protocols' ? 'active' : ''}`} onClick={() => setActiveSection('protocols')}>
          {t('recovery.prehabProtocols')}
        </button>
        <button className={`sub-tab ${activeSection === 'articles' ? 'active' : ''}`} onClick={() => setActiveSection('articles')}>
          {t('recovery.scienceArticles')}
        </button>
      </div>

      {activeSection === 'stretches' && (
        <div className="section">
          <div className="stats-bar">
            <div className="stat-item">
              <div className="stat-value">{ipData.stretches.length}</div>
              <div className="stat-label">{t('recovery.stretches')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{ipData.stretches.filter(s => s.category === 'upper_body').length}</div>
              <div className="stat-label">{t('recovery.upperBody')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{ipData.stretches.filter(s => s.category === 'lower_body').length}</div>
              <div className="stat-label">{t('recovery.lowerBody')}</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{ipData.stretches.filter(s => s.category === 'spine').length}</div>
              <div className="stat-label">{t('recovery.spine')}</div>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: 12 }}>
            <SoundSettings />
          </div>

          <div className="grid-2">
            {ipData.stretches.map(stretch => (
              <div
                key={stretch.id}
                className="stretch-card"
                style={{ cursor: 'pointer' }}
                onClick={() => setExpandedStretch(expandedStretch === stretch.id ? null : stretch.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div className="stretch-icon">{stretch.icon}</div>
                    <h3>{stretch.name}</h3>
                    <div className="stretch-target">{stretch.targetArea}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span className="tag">{categoryLabels[stretch.category] || stretch.category}</span>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--accent)', marginTop: 4 }}>
                      {stretch.duration}
                    </div>
                  </div>
                </div>
                <div className="stretch-desc">{stretch.description}</div>

                {expandedStretch === stretch.id && (
                  <div style={{ marginTop: 12, animation: 'fadeIn 0.3s ease-out' }} onClick={e => e.stopPropagation()}>
                    <StretchTimer durationStr={stretch.duration} />
                    <div style={{
                      padding: 12,
                      background: 'rgba(255,255,255,0.02)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 8,
                    }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--accent)' }}>{t('recovery.howTo')}:</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{stretch.howTo}</p>
                    </div>
                    <div style={{
                      padding: 12,
                      background: 'rgba(239, 68, 68, 0.06)',
                      borderRadius: 'var(--radius-sm)',
                      marginBottom: 8,
                      borderLeft: '2px solid var(--danger)',
                    }}>
                      <strong style={{ fontSize: '0.82rem', color: 'var(--danger)' }}>{t('recovery.commonMistake')}:</strong>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{stretch.commonMistake}</p>
                    </div>
                    <div className="science-note">
                      <strong>📚 {t('recovery.science')}:</strong> {stretch.scienceNote}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'protocols' && (
        <div className="section">
          <div className="grid-2">
            {ipData.injuryPreventionProtocols.map(protocol => (
              <div key={protocol.id} className="protocol-card">
                <h3>{protocol.name}</h3>
                <div className="protocol-freq">📅 {t('recovery.frequency')}: {protocol.frequency}</div>
                <ul>
                  {protocol.exercises.map((ex, i) => (
                    <li key={i}>{ex}</li>
                  ))}
                </ul>
                <div className="protocol-why">
                  <strong>{t('recovery.whyItMatters')}:</strong> {protocol.whyItMatters}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSection === 'articles' && (
        <div className="section">
          <div style={{ marginBottom: 20 }}>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {t('recovery.articlesIntro')}
            </p>
          </div>
          <div className="grid-2">
            {ipData.articles.map(article => (
              <div
                key={article.id}
                className="article-card"
                onClick={() => setExpandedArticle(expandedArticle === article.id ? null : article.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                  <h3>{article.title}</h3>
                </div>
                <div className="article-tags">
                  <span className="tag">{article.category}</span>
                  {article.tags.map(tag => (
                    <span key={tag} className="tag info">{tag}</span>
                  ))}
                </div>

                {expandedArticle === article.id && (
                  <div style={{ marginTop: 16, animation: 'fadeIn 0.3s ease-out' }}>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                      {article.content}
                    </p>
                  </div>
                )}

                <div className="key-takeaway">
                  <strong>{t('recovery.keyTakeaway')}:</strong> {article.keyTakeaway}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
