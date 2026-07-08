import { requireDepartmentPackage } from '../department-package';
import type { SceneGenesisManifest, SceneGenesisStationSpec } from './types';
import creativeDirectionSceneGenesis from '../department-package/bundles/creative-direction/scene-genesis-stations.json';

const MANIFESTS: Record<string, SceneGenesisManifest> = {
  'creative-direction': creativeDirectionSceneGenesis as unknown as SceneGenesisManifest,
};

export function loadSceneGenesisManifest(departmentId: string): SceneGenesisManifest | null {
  return MANIFESTS[departmentId] ?? null;
}

export function requireSceneGenesisManifest(departmentId: string): SceneGenesisManifest {
  const manifest = loadSceneGenesisManifest(departmentId);
  if (!manifest) throw new Error(`Scene Genesis manifest not registered: ${departmentId}`);
  return manifest;
}

export function listSceneGenesisStations(departmentId: string): SceneGenesisStationSpec[] {
  return requireSceneGenesisManifest(departmentId).stations;
}

export function getSceneGenesisStation(
  departmentId: string,
  stationId: string
): SceneGenesisStationSpec | null {
  return listSceneGenesisStations(departmentId).find((s) => s.stationId === stationId) ?? null;
}

export function sceneGenesisStationForCameraZone(
  departmentId: string,
  zoneId: string
): SceneGenesisStationSpec | null {
  return getSceneGenesisStation(departmentId, zoneId);
}

/** Map camera zone IDs to genesis station IDs (1:1 for CDS V2). */
export function isSceneGenesisDepartment(departmentId: string): boolean {
  return departmentId in MANIFESTS;
}

export function resolveSceneGenesisDefaults(departmentId: string) {
  const pkg = requireDepartmentPackage(departmentId);
  const manifest = requireSceneGenesisManifest(departmentId);
  return {
    packageId: pkg.packageId,
    aspectRatio: manifest.aspectRatio,
    outputFormat: manifest.outputFormat,
    milestone: manifest.milestone,
    signatureLandmarkId: manifest.signatureLandmarkId,
  };
}
