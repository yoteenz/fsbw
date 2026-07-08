/**
 * Studio Archives™ / Warehouse Wing™ — architectural rail destinations (wings only).
 * Scene/workspace tabs belong in SceneTray™ at the bottom — never in contextualWings rooms.
 */

import { ARCHITECTURAL_RAIL_ITEMS } from '../studio-warehouse/campus-nav';
import { WAREHOUSE_CAMPUS_DIRECTORY } from '../studio-warehouse/campus-nav';
import type { WarehouseCameraZoneId } from '../studio-warehouse/camera-zones';
import type { ArchitecturalContextualWing, ArchitecturalFrameStatus, ArchitecturalLocationStack } from './types';
import type { LivingArchitectureSnapshot } from '../living-architecture/types';
import type { LivingDistrictEcologySnapshot } from '../living-district-ecology/types';
import type { LivingCivilizationSnapshot } from '../living-civilization/types';
import type { CivilizationEventsSnapshot } from '../civilization-events/types';
import { resolveArchitecturalDestination } from '../studio-warehouse/campus-nav';

function campusEntry(zoneId: WarehouseCameraZoneId) {
  return WAREHOUSE_CAMPUS_DIRECTORY.find((z) => z.id === zoneId);
}

/** Wing / district destinations for the left Architectural Navigation Rail™ — no gallery scenes. */
export function buildWarehouseContextualWings(arrivalComplete: boolean): ArchitecturalContextualWing[] {
  const destinations = ARCHITECTURAL_RAIL_ITEMS.filter((item) => item.kind === 'zone').map((item) => ({
    id: item.zoneId,
    label: item.label,
    shortLabel: item.shortLabel,
    locked: !arrivalComplete,
  }));

  return [
    {
      id: 'studio-archives-campus',
      label: 'Campus Destinations™',
      rooms: destinations,
    },
  ];
}

export function resolveWarehouseLocationStack(
  activeZoneId: WarehouseCameraZoneId,
  arrivalComplete: boolean
): ArchitecturalLocationStack {
  const entry = campusEntry(activeZoneId);
  const destinationId = resolveArchitecturalDestination(activeZoneId);
  const destinationEntry = campusEntry(destinationId);
  const district = entry?.id ? campusEntry(activeZoneId) : undefined;

  return {
    headquarters: 'Studio Archives™',
    wing: destinationEntry?.label ?? 'Orientation Atrium™',
    room: arrivalComplete || activeZoneId === 'threshold' ? entry?.label : undefined,
    scene: district && activeZoneId !== destinationId ? entry?.label : undefined,
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
  livingEcology?: LivingDistrictEcologySnapshot | null;
  livingCivilization?: LivingCivilizationSnapshot | null;
  civilizationEvents?: CivilizationEventsSnapshot | null;
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
  const ecology = input.livingEcology;
  const civilization = input.livingCivilization;
  const events = input.civilizationEvents;
  let worldGraphStatus = 'Connected';
  if (living) {
    const expansionCount = living.expansionGraph.length;
    worldGraphStatus =
      expansionCount > 0
        ? `${expansionCount} architectural expansions recorded`
        : 'Campus foundational — milestones await';
  }
  if (ecology && ecology.chainReactions.length > 0) {
    worldGraphStatus += ` · ${ecology.chainReactions.length} chain reaction${ecology.chainReactions.length > 1 ? 's' : ''}`;
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
    ecosystemSummary: ecology?.ecosystemSummary,
    civilizationSummary: civilization?.civilizationSummary,
    eventsSummary: events?.eventsSummary,
  };
}
