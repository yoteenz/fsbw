import type { MasterSceneBlueprint } from './master-scene-blueprint';
import type { SceneStackLayerId } from './types';

export type SceneStackPlacementMetadata = {
  anchorX: number;
  anchorY: number;
  scale: number;
  rotation: number;
  perspectiveAngle: string;
  horizonLine: string;
  cameraElevation: string;
  intendedDepth: 'rear' | 'mid' | 'fore';
  facingDirection: string;
  safeBounds: string;
  expectedObjectAspectRatio: string;
};

export function buildPlacementMetadata(
  blueprint: MasterSceneBlueprint,
  layerId: SceneStackLayerId
): SceneStackPlacementMetadata {
  const landmarkZone = blueprint.placement.signatureLandmarkId
    ? blueprint.floorPlan.zones.find((z) => z.zoneId === blueprint.placement.signatureLandmarkId)
    : blueprint.floorPlan.zones.find((z) => z.depthHint === 'mid');

  const depth =
    layerId === 'signature-landmark'
      ? 'mid'
      : layerId === 'furniture-objects'
        ? 'mid'
        : (landmarkZone?.depthHint ?? 'mid');

  return {
    anchorX: 0.5,
    anchorY: layerId === 'signature-landmark' ? 0.42 : 0.55,
    scale: layerId === 'signature-landmark' ? 0.65 : 0.75,
    rotation: 0,
    perspectiveAngle: blueprint.camera.perspectiveNotes,
    horizonLine: 'upper-third editorial horizon',
    cameraElevation: 'eye-level founder walk-in',
    intendedDepth: depth,
    facingDirection: 'toward camera with slight three-quarter angle',
    safeBounds: landmarkZone
      ? `${landmarkZone.zoneId} hotspot bounds — mount by Scene Stack, do not bake into image`
      : 'station mid-plane — mount by Scene Stack',
    expectedObjectAspectRatio: blueprint.camera.aspectRatio,
  };
}

export function formatPlacementMetadataClause(
  metadata: SceneStackPlacementMetadata
): string {
  return [
    'PLACEMENT METADATA ONLY — Scene Stack owns mount position.',
    `anchorX=${metadata.anchorX} anchorY=${metadata.anchorY} scale=${metadata.scale} rotation=${metadata.rotation}.`,
    `perspective=${metadata.perspectiveAngle}.`,
    `horizon=${metadata.horizonLine} elevation=${metadata.cameraElevation}.`,
    `depth=${metadata.intendedDepth} facing=${metadata.facingDirection}.`,
    `safeBounds=${metadata.safeBounds}.`,
    `aspect=${metadata.expectedObjectAspectRatio}.`,
    'Do NOT bake object into room position — deliver isolated object plate only.',
  ].join(' ');
}
