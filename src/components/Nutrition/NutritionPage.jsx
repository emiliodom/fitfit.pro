import { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import mealPlanData from '../../data/mealPlan.json';
import recipesData from '../../data/recipes.json';

const MEAL_ICONS = { breakFast: '🌅', lunch: '☀️', dinner: '🌙', snack: '⚡' };
const MEAL_KEYS = ['breakFast', 'lunch', 'dinner', 'snack'];

export default function NutritionPage() {
  const { t, lang } = useLanguage();
  const todayIndex = (new Date().getDay() + 6) % 7; // Mon=0
  const [selectedDay, setSelectedDay] = useState(todayIndex);
  const [expandedMeal, setExpandedMeal] = useState(null);
  const [activeSection, setActiveSection] = useState('plan');

  const dayPlan = mealPlanData.weeklyPlan[selectedDay];

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1>{t('nutrition.title')}</h1>
        <p>{t('nutrition.subtitle')}</p>
      </div>

      <div className="sub-tabs">
        <button className={`sub-tab ${activeSection === 'plan' ? 'active' : ''}`} onClick={() => setActiveSection('plan')}>
          {t('nutrition.weekPlan')}
        </button>
        <button className={`sub-tab ${activeSection === 'protocol' ? 'active' : ''}`} onClick={() => setActiveSection('protocol')}>
          {t('nutrition.protocol')}
        </button>
        <button className={`sub-tab ${activeSection === 'grocery' ? 'active' : ''}`} onClick={() => setActiveSection('grocery')}>
          {t('nutrition.grocery')}
        </button>
      </div>

      {activeSection === 'plan' && (
        <>
          {/* Week Day Selector */}
          <div className="week-selector">
            {mealPlanData.weeklyPlan.map((day, i) => (
              <button
                key={i}
                className={`day-pill ${i === selectedDay ? 'active' : ''} ${i === todayIndex ? 'today' : ''}`}
                onClick={() => { setSelectedDay(i); setExpandedMeal(null); }}
              >
                <span className="day-pill-short">
                  {(lang === 'es' ? day.dayEs : day.day).slice(0, 3)}
                </span>
                {i === todayIndex && <span className="today-dot" />}
              </button>
            ))}
          </div>

          {/* Day Header */}
          <div className="day-header-card card">
            <div className="day-header-top">
              <div>
                <h2 className="day-title">{lang === 'es' ? dayPlan.dayEs : dayPlan.day}</h2>
                <p className="day-theme">{lang === 'es' ? dayPlan.themeEs : dayPlan.theme}</p>
              </div>
              <div className="day-macros-summary">
                <div className="macro-pill cal">
                  <span className="macro-val">{dayPlan.dailyTotals.calories}</span>
                  <span className="macro-unit">kcal</span>
                </div>
                <div className="macro-pill pro">
                  <span className="macro-val">{dayPlan.dailyTotals.protein}g</span>
                  <span className="macro-unit">P</span>
                </div>
                <div className="macro-pill carb">
                  <span className="macro-val">{dayPlan.dailyTotals.carbs}g</span>
                  <span className="macro-unit">C</span>
                </div>
                <div className="macro-pill fat">
                  <span className="macro-val">{dayPlan.dailyTotals.fat}g</span>
                  <span className="macro-unit">F</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meals */}
          <div className="meals-grid">
            {MEAL_KEYS.map(key => {
              const meal = dayPlan.meals[key];
              const isExpanded = expandedMeal === key;
              return (
                <div
                  key={key}
                  className={`meal-card card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedMeal(isExpanded ? null : key)}
                >
                  <div className="meal-card-top">
                    <div className="meal-icon-wrap">
                      <span className="meal-time-icon">{MEAL_ICONS[key]}</span>
                      <span className="meal-icon">{meal.icon}</span>
                    </div>
                    <div className="meal-info">
                      <h3 className="meal-name">{lang === 'es' ? meal.nameEs : meal.name}</h3>
                      <span className="meal-time">{meal.time}</span>
                    </div>
                    <div className="meal-cals">
                      <span className="meal-cal-value">{meal.calories}</span>
                      <span className="meal-cal-unit">kcal</span>
                    </div>
                  </div>

                  {/* Macros bar */}
                  <div className="meal-macros">
                    <span className="mm pro">P:{meal.protein}g</span>
                    <span className="mm carb">C:{meal.carbs}g</span>
                    <span className="mm fat">F:{meal.fat}g</span>
                  </div>

                  {isExpanded && (
                    <div className="meal-expanded">
                      <div className="meal-ingredients">
                        <h4>{t('nutrition.ingredients')}</h4>
                        <ul>
                          {(lang === 'es' ? meal.ingredientsEs : meal.ingredients).map((ing, i) => (
                            <li key={i}>{ing}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="meal-steps">
                        <h4>{t('nutrition.quickSteps')}</h4>
                        <p>{meal.quickSteps}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Week Overview Grid */}
          <div className="section">
            <h2 className="section-title">{t('nutrition.weekOverview')}</h2>
            <div className="week-overview-table">
              <div className="wot-header">
                <div className="wot-cell wot-label">&nbsp;</div>
                {mealPlanData.weeklyPlan.map((d, i) => (
                  <div key={i} className={`wot-cell wot-day ${i === todayIndex ? 'today' : ''}`}>
                    {(lang === 'es' ? d.dayEs : d.day).slice(0, 3)}
                  </div>
                ))}
              </div>
              {MEAL_KEYS.map(key => (
                <div key={key} className="wot-row">
                  <div className="wot-cell wot-label">{MEAL_ICONS[key]}</div>
                  {mealPlanData.weeklyPlan.map((d, i) => (
                    <div
                      key={i}
                      className={`wot-cell wot-meal ${i === selectedDay ? 'selected' : ''}`}
                      onClick={() => { setSelectedDay(i); setExpandedMeal(key); }}
                      title={lang === 'es' ? d.meals[key].nameEs : d.meals[key].name}
                    >
                      <span className="wot-icon">{d.meals[key].icon}</span>
                      <span className="wot-cal">{d.meals[key].calories}</span>
                    </div>
                  ))}
                </div>
              ))}
              <div className="wot-row wot-totals">
                <div className="wot-cell wot-label">Σ</div>
                {mealPlanData.weeklyPlan.map((d, i) => (
                  <div key={i} className={`wot-cell ${i === todayIndex ? 'today' : ''}`}>
                    <strong>{d.dailyTotals.calories}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {activeSection === 'protocol' && (
        <div className="grid-2">
          <div className="card">
            <h2 style={{ color: 'var(--accent)', marginBottom: 16 }}>
              {recipesData.fastingProtocol.name}
            </h2>
            <div className="fasting-windows">
              <div className="fast-window">
                <div className="fw-label">{t('nutrition.fast')}</div>
                <div className="fw-time">{recipesData.fastingProtocol.fastWindow}</div>
              </div>
              <div className="feed-window">
                <div className="fw-label">{t('nutrition.feed')}</div>
                <div className="fw-time">{recipesData.fastingProtocol.feedWindow}</div>
              </div>
            </div>
            <ul className="protocol-rules">
              {recipesData.fastingProtocol.rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
          <div className="card">
            <h2 style={{ marginBottom: 16 }}>{t('nutrition.macroTargets')}</h2>
            <div className="table-scroll">
              <table className="data-table">
                <tbody>
                  <tr><th>{t('nutrition.protein')}</th><td>{recipesData.macroTargets.protein}</td></tr>
                  <tr><th>{t('nutrition.carbs')}</th><td>{recipesData.macroTargets.carbs}</td></tr>
                  <tr><th>{t('nutrition.fats')}</th><td>{recipesData.macroTargets.fats}</td></tr>
                  <tr><th>{t('nutrition.calories')}</th><td>{recipesData.macroTargets.calories}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'grocery' && (
        <div className="grid-2">
          {Object.entries(recipesData.groceryList).map(([category, items]) => (
            <div key={category} className="card">
              <h3 className="grocery-cat">
                {category === 'protein' ? `🥩 ${t('nutrition.protein')}` :
                 category === 'carbs' ? `🌾 ${t('nutrition.carbs')}` :
                 category === 'fats' ? `🥑 ${t('nutrition.fats')}` : `🥬 ${t('nutrition.vegetables')}`}
              </h3>
              <div className="grocery-items">
                {items.map(item => (
                  <span key={item} className="grocery-chip">{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
