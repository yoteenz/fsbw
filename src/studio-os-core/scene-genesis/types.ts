/**
 * Golden Build™ Scene Genesis™ — types
 * FAL generates environments · Cursor places interaction layer only.
 */

export type SceneGenesisHotspotBounds = {
  left: string;
  top: string;
  width: string;
  height: string;
};

export type SceneGenesisStationPrompt = {
  primary: string;
  negative: string;
};

export type SceneGenesisStationSpec = {
  stationId: string;
  displayName: string;
  shortLabel: string;
  productionGroupId: string;
  heroAssetId: string;
  landmarkVisible: string;
  signatureLandmark?: boolean;
  prompt: SceneGenesisStationPrompt;
  hotspots: Record<string, SceneGenesisHotspotBounds>;
};

export type SceneGenesisManifest = {
  departmentId: string;
  packageId: string;
  milestone: string;
  signatureLandmarkId: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  stations: SceneGenesisStationSpec[];
};

export type SceneGenesisSceneStatus = 'idle' | 'generating' | 'ready' | 'failed';

export type SceneGenesisSceneRecord = {
  id: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  productionGroupId: string;
  heroAssetId: string;
  publicUrl: string;
  storagePath?: string;
  model?: string;
  generatedAt: string;
  promptVersion: string;
};

export type CompiledSceneGenesisPrompt = {
  prompt: string;
  negativePrompt: string;
  aspectRatio: string;
  outputFormat: 'png' | 'webp';
  productionGroupId: string;
  heroAssetId: string;
  stationId: string;
  promptVersion: string;
};

export const SCENE_GENESIS_PROMPT_VERSION = 'scene-genesis.v1';
