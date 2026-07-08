import { requireDepartmentPackage } from '../department-package';
import { resolveCompanyGenomeSnapshot } from '../studio-builder/genome-context';
import { resolveActiveProjectGenome } from '../project-genome';
import { isBlendCompositeLayer } from './reference-chain';
import { getSceneStackLayerRecord } from './store';
import { getSceneStackStation, requireSceneStackManifest } from './station-manifest';
import type { SceneStackLayerId, SceneStackHotspotBounds } from './types';
import { MASTER_SCENE_BLUEPRINT_VERSION } from './types';

export type BlueprintZone = {
  zoneId: string;
  label: string;
  bounds: SceneStackHotspotBounds;
  depthHint: 'rear' | 'mid' | 'fore';
  reservedFor?: string;
};

export type LayerDependencyRule = {
  layerId: SceneStackLayerId;
  requiresShell: boolean;
  requiresBlueprint: boolean;
  forbiddenReferenceLayers: SceneStackLayerId[];
  outputMode: 'full-shell' | 'isolated-object' | 'blend-overlay';
  zIndex: number;
};

export type MasterSceneBlueprint = {
  blueprintId: string;
  blueprintVersion: string;
  sceneId: string;
  workspaceId: string;
  departmentId: string;
  projectId: string;
  stationDisplayName: string;
  camera: {
    position: string;
    aspectRatio: string;
    perspectiveNotes: string;
  };
  floorPlan: {
    summary: string;
    zones: BlueprintZone[];
    reservedRegions: string[];
  };
  placement: {
    objectPlacementNotes: string;
    depthHints: string;
    signatureLandmarkId?: string;
  };
  lighting: {
    direction: string;
    materialLanguage: string;
  };
  visualDna: {
    feeling: string[];
    forbidden: string[];
    editorialDirection: string;
    companyName: string;
  };
  negativeRules: string[];
  shellReferenceUrl: string | null;
  layerDependencyRules: LayerDependencyRule[];
};

const LAYER_Z_INDEX: Record<SceneStackLayerId, number> = {
  'environment-shell': 1,
  'signature-landmark': 2,
  'furniture-objects': 3,
  'lighting-systems': 4,
  'atmospheric-systems': 5,
  'surface-materials': 6,
  'ambient-motion': 7,
  interaction: 8,
  'runtime-effects': 9,
  'founder-personalization': 10,
};

const FORBIDDEN_REFS: SceneStackLayerId[] = [
  'signature-landmark',
  'furniture-objects',
  'lighting-systems',
  'atmospheric-systems',
  'surface-materials',
  'ambient-motion',
  'founder-personalization',
];

function zoneDepthFromBounds(bounds: SceneStackHotspotBounds): 'rear' | 'mid' | 'fore' {
  const top = parseFloat(bounds.top);
  if (top < 30) return 'fore';
  if (top > 55) return 'rear';
  return 'mid';
}

function buildLayerDependencyRules(
  layerIds: SceneStackLayerId[]
): LayerDependencyRule[] {
  return layerIds.map((layerId) => ({
    layerId,
    requiresShell: layerId !== 'environment-shell',
    requiresBlueprint: true,
    forbiddenReferenceLayers:
      layerId === 'environment-shell' ? [...FORBIDDEN_REFS] : [...FORBIDDEN_REFS],
    outputMode:
      layerId === 'environment-shell'
        ? 'full-shell'
        : isBlendCompositeLayer(layerId)
          ? 'blend-overlay'
          : 'isolated-object',
    zIndex: LAYER_Z_INDEX[layerId],
  }));
}

/**
 * Master Scene Blueprint™ — shared spatial + creative contract for every layer pass.
 * All generations reference this blueprint, not flattened prior outputs.
 */
export function resolveMasterSceneBlueprint(input: {
  departmentId: string;
  projectId: string;
  stationId: string;
  workspaceId?: string;
}): MasterSceneBlueprint {
  const pkg = requireDepartmentPackage(input.departmentId);
  const manifest = requireSceneStackManifest(input.departmentId);
  const station = getSceneStackStation(input.departmentId, input.stationId);
  if (!station) throw new Error(`Scene Stack station not found: ${input.stationId}`);

  const company = resolveCompanyGenomeSnapshot(input.workspaceId);
  const shell = getSceneStackLayerRecord(
    input.departmentId,
    input.projectId,
    input.stationId,
    'environment-shell'
  );

  const layerIds = Object.keys(station.layerPrompts) as SceneStackLayerId[];
  const zones: BlueprintZone[] = Object.entries(station.hotspots).map(([zoneId, bounds]) => ({
    zoneId,
    label: zoneId.replace(/-/g, ' '),
    bounds,
    depthHint: zoneDepthFromBounds(bounds),
    reservedFor: zoneId,
  }));

  const blueprintId = `msb-${input.departmentId}-${input.stationId}-${input.projectId}`;

  return {
    blueprintId,
    blueprintVersion: MASTER_SCENE_BLUEPRINT_VERSION,
    sceneId: input.stationId,
    workspaceId: input.workspaceId ?? input.projectId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationDisplayName: station.displayName,
    camera: {
      position: 'Mobile portrait immersive entry — eye-level founder walk-in',
      aspectRatio: manifest.aspectRatio,
      perspectiveNotes:
        'Locked single-camera editorial atelier framing. No orbit. No wide-angle distortion. Consistent vanishing point across all layer passes.',
    },
    floorPlan: {
      summary: `${station.displayName} — ${station.shortLabel} zone within department immersive room.`,
      zones,
      reservedRegions: zones.map((z) => z.zoneId),
    },
    placement: {
      objectPlacementNotes: station.signatureLandmarkId
        ? `Signature landmark ${station.signatureLandmarkId} anchors mid-rear focal plane. Hotspots define interaction zones — objects align to hotspot bounds, never arbitrary placement.`
        : 'Place hero objects and furniture within declared hotspot zones. Respect depth planes rear → mid → fore.',
      depthHints: 'Rear: architecture shell. Mid: landmarks + furniture. Fore: atmospheric + lighting overlays.',
      signatureLandmarkId: station.signatureLandmarkId,
    },
    lighting: {
      direction: 'Warm key from upper-left coffer; subtle fill from rear; accent pools on hero objects.',
      materialLanguage: pkg.roomDna.defaultFeeling.join(', '),
    },
    visualDna: {
      feeling: [...pkg.roomDna.defaultFeeling],
      forbidden: [...pkg.roomDna.forbiddenFeeling],
      editorialDirection: company.editorialDirection,
      companyName: company.companyName,
    },
    negativeRules: [
      'Never flatten prior layers into a new generation',
      'Never send approved generative layers to FAL as reference',
      'Never output full-scene rerender unless environment-shell pass',
      'Never degrade text/signage through repeated compression',
      'No dashboard UI chrome in any layer',
      `Avoid: ${pkg.roomDna.forbiddenFeeling.join(', ')}`,
    ],
    shellReferenceUrl: shell?.publicUrl ?? null,
    layerDependencyRules: buildLayerDependencyRules(layerIds),
  };
}

/** Compact blueprint clause injected into every layer prompt. */
export function formatBlueprintPromptClause(blueprint: MasterSceneBlueprint, layerId: SceneStackLayerId): string {
  const rule = blueprint.layerDependencyRules.find((r) => r.layerId === layerId);
  const zones =
    blueprint.floorPlan.zones.length > 0
      ? blueprint.floorPlan.zones.map((z) => `${z.zoneId}(${z.depthHint})`).join(', ')
      : 'default-station-volume';

  return [
    `MASTER SCENE BLUEPRINT™ ${blueprint.blueprintId}.`,
    `CAMERA: ${blueprint.camera.position} · ${blueprint.camera.aspectRatio} · ${blueprint.camera.perspectiveNotes}`,
    `ZONES: ${zones}.`,
    `PLACEMENT: ${blueprint.placement.objectPlacementNotes}`,
    `DEPTH: ${blueprint.placement.depthHints}.`,
    `LIGHTING: ${blueprint.lighting.direction}.`,
    `MATERIALS: ${blueprint.lighting.materialLanguage}.`,
    `PROJECT ${resolveActiveProjectGenome(blueprint.departmentId).name}.`,
    rule ? `OUTPUT MODE: ${rule.outputMode}.` : '',
    `NEGATIVE RULES: ${blueprint.negativeRules.join(' · ')}.`,
  ]
    .filter(Boolean)
    .join(' ');
}
