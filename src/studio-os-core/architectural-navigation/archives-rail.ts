/**
 * Studio Archives™ / Warehouse Wing™ — contextual rail rooms.
 */

import { districtForWarehouseZone } from '../studio-warehouse/camera-zones';
import { ARCHIVES_CAMPUS_SECTIONS, WAREHOUSE_CAMPUS_DIRECTORY } from '../studio-warehouse/campus-nav';
import { INDUSTRIAL_CAMPUS_WINGS } from '../studio-warehouse/industrial-campus';
import type { WarehouseCameraZoneId } from '../studio-warehouse/camera-zones';
import type { ArchitecturalContextualWing, ArchitecturalFrameStatus, ArchitecturalLocationStack } from './types';
import type { LivingArchitectureSnapshot } from '../living-architecture/types';

function campusEntry(zoneId: WarehouseCameraZoneId) {
  return WAREHOUSE_CAMPUS_DIRECTORY.find((z) => z.id === zoneId);
}

/** Build contextual wings for Warehouse / Industrial Design Campus */
export function buildWarehouseContextualWings(arrivalComplete: boolean): ArchitecturalContextualWing[] {
  const warehouseSection = ARCHIVES_CAMPUS_SECTIONS.find((s) => s.sectionId === 'warehouse-wing');
  if (!warehouseSection) return [];

  const industrialWings: ArchitecturalContextualWing[] = INDUSTRIAL_CAMPUS_WINGS.map((wing) => ({
    id: wing.id,
    label: wing.label,
    rooms: wing.zoneIds
      .map((zoneId) => warehouseSection.zones.find((z) => z.id === zoneId))
      .filter(Boolean)
      .map((entry) => ({
        id: entry!.id,
        label: entry!.label,
        shortLabel: entry!.shortLabel,
        locked: entry!.id !== 'threshold' && !arrivalComplete,
      })),
  }));

  const campusWings: ArchitecturalContextualWing[] = ARCHIVES_CAMPUS_SECTIONS.filter(
    (s) => s.sectionId !== 'warehouse-wing' && s.sectionId !== 'entrance'
  ).map((section) => ({
    id: section.sectionId,
    label: section.sectionLabel,
    rooms: section.zones.map((z) => ({
      id: z.id,
      label: z.label,
      shortLabel: z.shortLabel,
      locked: z.id !== 'threshold' && !arrivalComplete,
    })),
  }));

  return [...industrialWings, ...campusWings];
}

export function resolveWarehouseLocationStack(
  activeZoneId: WarehouseCameraZoneId,
  arrivalComplete: boolean
): ArchitecturalLocationStack {
  const entry = campusEntry(activeZoneId);
  const industrialWing = INDUSTRIAL_CAMPUS_WINGS.find((w) => w.zoneIds.includes(activeZoneId));
  const section = ARCHIVES_CAMPUS_SECTIONS.find((s) => s.zones.some((z) => z.id === activeZoneId));
  const district = districtForWarehouseZone(activeZoneId);

  let wing = section?.sectionLabel ?? 'Orientation Atrium™';
  if (industrialWing) {
    wing = 'Warehouse Wing™';
  }

  const room = industrialWing?.label ?? entry?.label ?? 'Grand Entrance™';

  return {
    headquarters: 'Studio Archives™',
    wing,
    room: arrivalComplete || activeZoneId === 'threshold' ? room : undefined,
    scene: district ? entry?.label : undefined,
  };
}

export function buildWarehouseFrameStatus(input: {
  activeZoneId: WarehouseCameraZoneId;
  arrivalComplete: boolean;
  stackLabel?: string;
  pipelinePhase?: string;
  layersComplete?: number;
  layersTotal?: number;
  orbRole?: string;
  workspace?: string;
  livingArchitecture?: LivingArchitectureSnapshot | null;
}): ArchitecturalFrameStatus {
  const loc = resolveWarehouseLocationStack(input.activeZoneId, input.arrivalComplete);
  const entry = campusEntry(input.activeZoneId);

  let generationStatus = 'Idle';
  if (input.pipelinePhase && input.pipelinePhase !== 'idle') {
    generationStatus = input.pipelinePhase;
  } else if (input.layersTotal && input.layersComplete !== undefined) {
    generationStatus = `${input.layersComplete}/${input.layersTotal} layers`;
  }

  const living = input.livingArchitecture;
  let worldGraphStatus = 'Connected';
  if (living) {
    const expansionCount = living.expansionGraph.length;
    worldGraphStatus =
      expansionCount > 0
        ? `${expansionCount} architectural expansions recorded`
        : 'Campus foundational — milestones await';
  }

  return {
    headquarters: loc.headquarters,
    department: loc.wing,
    room: loc.room,
    scene: loc.scene ?? entry?.label,
    layer: input.stackLabel,
    generationStatus,
    worldGraphStatus,
    connectedOrb: input.orbRole ? `Studio Orb™ · ${input.orbRole}` : 'Studio Orb™',
    workspace: input.workspace,
    growthSummary: living?.skylineSummary,
  };
}
