import type { WarehouseCameraZoneId } from '../../../../studio-os-core/studio-warehouse';
import {
  ARCHITECTURAL_RAIL_ITEMS,
  resolveArchitecturalDestination,
} from '../../../../studio-os-core/studio-warehouse/campus-nav';
import { ArchitecturalRail } from '../navigation/ArchitecturalRail';

type Props = {
  activeZoneId: WarehouseCameraZoneId;
  arrivalComplete: boolean;
  onSelectZone: (zoneId: WarehouseCameraZoneId) => void;
};

/**
 * Studio Archives™ left rail — ArchitecturalRail™ wrapper (departments/wings only).
 * Scene/workspace tabs live in SceneTray™ at the bottom.
 */
export function WarehouseArchitecturalDirectory({ activeZoneId, arrivalComplete, onSelectZone }: Props) {
  const activeDestinationId = resolveArchitecturalDestination(activeZoneId);

  return (
    <ArchitecturalRail
      items={ARCHITECTURAL_RAIL_ITEMS}
      activeDestinationId={activeDestinationId}
      arrivalComplete={arrivalComplete}
      onSelectDestination={(destinationId) => onSelectZone(destinationId as WarehouseCameraZoneId)}
    />
  );
}
