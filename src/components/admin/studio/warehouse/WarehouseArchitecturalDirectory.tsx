import type { WarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse';
import { ARCHIVES_CAMPUS_SECTIONS } from '../../../../studio-os-core/studio-warehouse/campus-nav';

type Props = {
  activeZoneId: WarehouseCameraZoneId;
  arrivalComplete: boolean;
  onSelectZone: (zoneId: WarehouseCameraZoneId) => void;
};

/**
 * Permanent vertical architectural directory — wing sections of Studio Archives™ campus.
 */
export function WarehouseArchitecturalDirectory({ activeZoneId, arrivalComplete, onSelectZone }: Props) {
  return (
    <nav className="wh-world__directory" aria-label="Studio Archives campus directory">
      <p className="wh-world__directory-title">Studio Archives™</p>
      {ARCHIVES_CAMPUS_SECTIONS.map((section) => (
        <div key={section.sectionId} className="wh-world__directory-section">
          <p className="wh-world__directory-wing">{section.sectionLabel}</p>
          <ul className="wh-world__directory-list">
            {section.zones.map((entry) => {
              const locked = entry.id !== 'threshold' && !arrivalComplete;
              const isActive = activeZoneId === entry.id;
              const isSubZone = section.zones.length > 1;
              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    className={`wh-world__directory-btn${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}${isSubZone ? ' is-sub' : ''}`}
                    onClick={() => onSelectZone(entry.id)}
                    disabled={locked}
                    title={entry.label}
                  >
                    <span className="wh-world__directory-btn__label">{entry.shortLabel}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
