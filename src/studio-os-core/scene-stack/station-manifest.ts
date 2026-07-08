import type { SceneStackManifest, SceneStackStationSpec } from './types';
import {
  CDS_SCENE_STACK_HOTSPOTS,
  CDS_SCENE_STACK_STATION_META,
  getCdsSceneStackLayerPrompts,
} from './cds-station-prompts';
import {
  COMMAND_CENTER_SCENE_STACK_HOTSPOTS,
  COMMAND_CENTER_SCENE_STACK_STATION_META,
  getCommandCenterSceneStackLayerPrompts,
} from './command-center-station-prompts';
import {
  WAREHOUSE_SCENE_STACK_HOTSPOTS,
  WAREHOUSE_SCENE_STACK_STATION_META,
  getWarehouseSceneStackLayerPrompts,
} from './warehouse-station-prompts';

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

function buildWarehouseManifest(): SceneStackManifest {
  return {
    departmentId: 'studio-warehouse',
    packageId: 'pkg-studio-warehouse-golden-v1',
    milestone: 'Studio Archives™ Golden Build',
    signatureLandmarkId: 'central-atrium',
    aspectRatio: '9:16',
    outputFormat: 'webp',
    stations: WAREHOUSE_SCENE_STACK_STATION_META.map((meta) => ({
      stationId: meta.stationId,
      displayName: meta.displayName,
      shortLabel: meta.shortLabel,
      signatureLandmarkId: 'signatureLandmarkId' in meta ? meta.signatureLandmarkId : undefined,
      layerPrompts: getWarehouseSceneStackLayerPrompts(meta.stationId),
      hotspots: WAREHOUSE_SCENE_STACK_HOTSPOTS[meta.stationId] ?? {},
    })),
  };
}

function buildCommandCenterManifest(): SceneStackManifest {
  return {
    departmentId: 'studio-command-center',
    packageId: 'pkg-studio-command-center-golden-v1',
    milestone: 'Studio Command Center™ Golden Build',
    signatureLandmarkId: 'executive-atrium',
    aspectRatio: '9:16',
    outputFormat: 'webp',
    stations: COMMAND_CENTER_SCENE_STACK_STATION_META.map((meta) => ({
      stationId: meta.stationId,
      displayName: meta.displayName,
      shortLabel: meta.shortLabel,
      signatureLandmarkId: 'signatureLandmarkId' in meta ? meta.signatureLandmarkId : undefined,
      layerPrompts: getCommandCenterSceneStackLayerPrompts(meta.stationId),
      hotspots: COMMAND_CENTER_SCENE_STACK_HOTSPOTS[meta.stationId] ?? {},
    })),
  };
}

const MANIFESTS: Record<string, SceneStackManifest> = {
  'creative-direction': buildCdsManifest(),
  'studio-warehouse': buildWarehouseManifest(),
  'studio-command-center': buildCommandCenterManifest(),
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
