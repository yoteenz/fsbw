import type { WarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse';
import { WAREHOUSE_CAMPUS_DIRECTORY } from '../../../../studio-os-core/studio-warehouse/campus-nav';

type Props = {
  activeZoneId: WarehouseCameraZoneId;
  arrivalComplete: boolean;
  onSelectZone: (zoneId: WarehouseCameraZoneId) => void;
};

/**
 * Permanent vertical architectural directory — part of the left wall, not a webpage nav.
 */
export function WarehouseArchitecturalDirectory({ activeZoneId, arrivalComplete, onSelectZone }: Props) {
  return (
    <nav className="wh-world__directory" aria-label="Campus architectural directory">
      <p className="wh-world__directory-title">Campus</p>
      <ul className="wh-world__directory-list">
        {WAREHOUSE_CAMPUS_DIRECTORY.map((entry) => {
          const zoneMeta = entry;
          const locked = entry.id !== 'threshold' && !arrivalComplete;
          const isActive = activeZoneId === entry.id;
          return (
            <li key={entry.id}>
              <button
                type="button"
                className={`wh-world__directory-btn${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
                onClick={() => onSelectZone(entry.id)}
                disabled={locked}
                title={zoneMeta.label}
              >
                <span className="wh-world__directory-btn__label">{entry.shortLabel}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
