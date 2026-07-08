import type { WarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse';
import { ARCHIVES_CAMPUS_SECTIONS } from '../../../../studio-os-core/studio-warehouse/campus-nav';
import { INDUSTRIAL_CAMPUS_WINGS } from '../../../../studio-os-core/studio-warehouse/industrial-campus';

type Props = {
  activeZoneId: WarehouseCameraZoneId;
  arrivalComplete: boolean;
  onSelectZone: (zoneId: WarehouseCameraZoneId) => void;
};

/**
 * Permanent vertical architectural directory — Industrial Design Campus™ wings.
 */
export function WarehouseArchitecturalDirectory({ activeZoneId, arrivalComplete, onSelectZone }: Props) {
  return (
    <nav className="wh-world__directory" aria-label="Industrial Design Campus directory">
      <p className="wh-world__directory-title">IDC™</p>
      {ARCHIVES_CAMPUS_SECTIONS.map((section) => {
        const isWarehouseSection = section.sectionId === 'warehouse-wing';
        return (
          <div key={section.sectionId} className="wh-world__directory-section">
            <p className="wh-world__directory-wing">{section.sectionLabel}</p>
            {isWarehouseSection ? (
              INDUSTRIAL_CAMPUS_WINGS.map((wing) => (
                <div key={wing.id} className="wh-world__directory-section">
                  <p className="wh-world__directory-wing wh-world__directory-wing--campus">{wing.label}</p>
                  <ul className="wh-world__directory-list">
                    {wing.zoneIds.map((zoneId) => {
                      const entry = section.zones.find((z) => z.id === zoneId);
                      if (!entry) return null;
                      const locked = !arrivalComplete;
                      const isActive = activeZoneId === entry.id;
                      return (
                        <li key={entry.id}>
                          <button
                            type="button"
                            className={`wh-world__directory-btn is-sub${isActive ? ' is-active' : ''}${locked ? ' is-locked' : ''}`}
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
              ))
            ) : (
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
            )}
          </div>
        );
      })}
    </nav>
  );
}
