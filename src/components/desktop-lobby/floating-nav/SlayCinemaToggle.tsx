import { useSlayCinemaOptional } from './SlayCinemaContext';
import { SlayCinemaIcon } from './SlayCinemaIcon';
import './SlayCinemaToggle.css';

export function SlayCinemaToggle() {
  const cinema = useSlayCinemaOptional();

  if (!cinema?.isLoungeZone) return null;

  const { isSlayCinemaEnabled, toggleSlayCinema } = cinema;

  return (
    <div className="floating-nav-system__trigger floating-nav-system__trigger--slay-cinema">
      <button
        type="button"
        className={[
          'slay-cinema-toggle',
          isSlayCinemaEnabled ? 'slay-cinema-toggle--on' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={toggleSlayCinema}
        aria-label="Toggle Slay Cinema mode"
        aria-pressed={isSlayCinemaEnabled}
      >
        <span className="slay-cinema-toggle__chrome-cap" aria-hidden />
        <span className="slay-cinema-toggle__crystal" aria-hidden />
        <span className="slay-cinema-toggle__foil" aria-hidden />
        <span className="slay-cinema-toggle__inner">
          <SlayCinemaIcon />
          <span className="slay-cinema-toggle__label">SLAY CINEMA</span>
          <span className="slay-cinema-toggle__state" aria-hidden>
            {isSlayCinemaEnabled ? 'ON' : 'OFF'}
          </span>
        </span>
      </button>
    </div>
  );
}
