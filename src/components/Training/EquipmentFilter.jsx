import { useLanguage } from '../../i18n/LanguageContext';

export default function EquipmentFilter({ equipment, selected, onToggle }) {
  const { t } = useLanguage();

  return (
    <div className="section">
      <h3 className="section-title">🎯 {t('training.equipmentTitle')}</h3>
      <div className="equipment-filter">
        {equipment.map(eq => (
          <button
            key={eq.id}
            className={`equipment-chip ${selected.includes(eq.id) ? 'active' : ''}`}
            onClick={() => onToggle(eq.id)}
            title={eq.description}
          >
            <span className="chip-icon">{eq.icon}</span>
            {eq.name}
          </button>
        ))}
      </div>
    </div>
  );
}
