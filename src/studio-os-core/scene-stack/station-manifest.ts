import type { SceneStackManifest, SceneStackStationSpec } from './types';
import {
  CDS_SCENE_STACK_HOTSPOTS,
  CDS_SCENE_STACK_STATION_META,
  getCdsSceneStackLayerPrompts,
} from './cds-station-prompts';

function buildCdsManifest(): SceneStackManifest {
  return {
    departmentId: 'creative-direction',
    packageId: 'pkg-creative-direction-golden-v1',
    milestone: 'Golden Build™ Scene Stack™',
    signatureLandmarkId: 'story-table',
    aspectRatio: '9:16',
    outputFormat: 'webp',
    stations: CDS_SCENE_STACK_STATION_META.map((meta) => ({
      stationId: meta.stationId,
      displayName: meta.displayName,
      shortLabel: meta.shortLabel,
      signatureLandmarkId: 'signatureLandmarkId' in meta ? meta.signatureLandmarkId : undefined,
      layerPrompts: getCdsSceneStackLayerPrompts(meta.stationId),
      hotspots: CDS_SCENE_STACK_HOTSPOTS[meta.stationId] ?? {},
    })),
  };
}

const MANIFESTS: Record<string, SceneStackManifest> = {
  'creative-direction': buildCdsManifest(),
};

export function requireSceneStackManifest(departmentId: string): SceneStackManifest {
  const manifest = MANIFESTS[departmentId];
  if (!manifest) throw new Error(`Scene Stack manifest not registered: ${departmentId}`);
  return manifest;
}

export function listSceneStackStations(departmentId: string): SceneStackStationSpec[] {
  return requireSceneStackManifest(departmentId).stations;
}

export function getSceneStackStation(
  departmentId: string,
  stationId: string
): SceneStackStationSpec | null {
  return listSceneStackStations(departmentId).find((s) => s.stationId === stationId) ?? null;
}

export function isSceneStackDepartment(departmentId: string): boolean {
  return departmentId in MANIFESTS;
}
