import { useNavigate } from 'react-router-dom';
import { STUDIO_ADMINISTRATION_ROUTES } from '../../../studio-os-core/application/routes';
import {
  PORTFOLIO_HEALTH_METRICS,
  STUDIO_COMMAND_CENTER_SUBTITLE,
} from '../../../studio-os-core/platform/command-center-demo';

const ACCENT = '#6366F1';

/** Portfolio control plane entry — sits left of the active organization headquarters card. */
export function StudioCommandCenterCard() {
  const navigate = useNavigate();
  const portfolioHealth = PORTFOLIO_HEALTH_METRICS.find((m) => m.id === 'health');

  return (
    <button
      type="button"
      onClick={() => navigate(STUDIO_ADMINISTRATION_ROUTES.commandCenter)}
      className="w-full h-full text-left studio-living-card studio-glass-depth px-2 py-3 rounded-sm"
      style={{
        border: `1.3px solid ${ACCENT}44`,
        background: `linear-gradient(135deg, rgba(255,255,255,0.94) 0%, ${ACCENT}0A 55%, rgba(255,255,255,0.88) 100%)`,
        cursor: 'pointer',
      }}
    >
      <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: '#808080', margin: 0, letterSpacing: '0.08em' }}>
        STUDIO ADMINISTRATION
      </p>
      <p
        style={{
          fontFamily: '"Covered By Your Grace", sans-serif',
          fontSize: '14px',
          color: ACCENT,
          margin: '2px 0 0',
          lineHeight: 1.05,
        }}
      >
        COMMAND CENTER
      </p>
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '6px', color: '#555', margin: '4px 0 0', lineHeight: 1.35 }}>
        {STUDIO_COMMAND_CENTER_SUBTITLE}
      </p>
      {portfolioHealth ? (
        <p style={{ fontFamily: '"Futura PT Medium"', fontSize: '6px', color: ACCENT, margin: '6px 0 0' }}>
          PORTFOLIO {portfolioHealth.value}
        </p>
      ) : null}
      <p style={{ fontFamily: '"Futura PT Book"', fontSize: '5px', color: '#888', margin: '4px 0 0' }}>
        ABOVE EVERY ORGANIZATION
      </p>
    </button>
  );
}
