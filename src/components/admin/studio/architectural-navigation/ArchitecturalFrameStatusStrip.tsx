import type { DistrictThemeId } from '../../../../studio-os-core/architectural-navigation';
import { districtCssClass } from '../../../../studio-os-core/architectural-navigation';
import type { ArchitecturalFrameStatus } from '../../../../studio-os-core/architectural-navigation';

type Props = {
  status: ArchitecturalFrameStatus;
  districtThemeId: DistrictThemeId;
};

/** Frame status chips embedded in the architectural HUD — district-themed. */
export function ArchitecturalFrameStatusStrip({ status, districtThemeId }: Props) {
  const chips: string[] = [];
  if (status.department) chips.push(status.department);
  if (status.room) chips.push(status.room);
  if (status.scene) chips.push(status.scene);
  if (status.generationStatus && status.generationStatus !== 'Idle') {
    chips.push(`Gen · ${status.generationStatus}`);
  }
  if (status.worldGraphStatus) chips.push(status.worldGraphStatus);
  if (status.growthSummary) chips.push(status.growthSummary);

  if (chips.length === 0) return null;

  return (
    <div className={districtCssClass(districtThemeId)}>
      <div className="sw-frame-status-strip" aria-label="Architectural frame status">
        {chips.map((chip) => (
          <span key={chip} className="sw-frame-status-chip">
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
