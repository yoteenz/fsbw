import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';

export const WORLD_PREVIEW_VERSION = 'world-preview.v1';

/** Procedural clay model — NOT photorealistic, NOT AI generated */
export type ClayPlaceholderAsset = {
  assetId: string;
  placeholderType: 'gray-block' | 'white-shell';
  bounds: { left: string; top: string; width: string; height: string };
  socketId: string;
  label: string;
  installed: false;
};

export type ClaySocketMarker = {
  socketId: string;
  bounds: { left: string; top: string; width: string; height: string };
  color: 'blue';
  label: string;
};

export type ClayNavigationNode = {
  nodeId: string;
  label: string;
  bounds: { left: string; top: string; width: string; height: string };
  walkable: boolean;
};

export type ClayLightingVolume = {
  volumeId: string;
  profileId: string;
  bounds: { left: string; top: string; width: string; height: string };
  opacity: number;
};

export type ClayCameraMarker = {
  anchorId: string;
  label: string;
  purpose: string;
  position: string;
};

export type WorldPreviewModel = {
  previewVersion: typeof WORLD_PREVIEW_VERSION;
  planId: string;
  roomDisplayName: string;
  renderStyle: 'procedural-clay';
  architecture: {
    shellId: string;
    color: 'white';
    label: string;
  };
  placeholderAssets: ClayPlaceholderAsset[];
  sockets: ClaySocketMarker[];
  navigationNodes: ClayNavigationNode[];
  lightingVolumes: ClayLightingVolume[];
  cameraMarkers: ClayCameraMarker[];
  interactionZones: Array<{ zoneId: string; label: string; bounds: { left: string; top: string; width: string; height: string } }>;
  /** Founder sees entire room before manufacturing */
  generationOccurred: false;
};

export function buildWorldPreviewModel(input: {
  plan: ConstructionPlan;
  dnaRecords: AssetDnaRecord[];
}): WorldPreviewModel {
  const { plan } = input;

  const placeholderAssets: ClayPlaceholderAsset[] = [
    ...plan.heroAssets,
    ...plan.furnitureSet.assets,
    ...plan.decorSet.assets,
  ].map((asset) => {
    const socket = plan.assetSockets.find((s) => s.socketId === asset.socketId);
    return {
      assetId: asset.assetId,
      placeholderType: 'gray-block' as const,
      bounds: socket?.bounds ?? { left: '40%', top: '50%', width: '20%', height: '20%' },
      socketId: asset.socketId,
      label: asset.assetId,
      installed: false as const,
    };
  });

  return {
    previewVersion: WORLD_PREVIEW_VERSION,
    planId: plan.planId,
    roomDisplayName: plan.room.displayName,
    renderStyle: 'procedural-clay',
    architecture: {
      shellId: plan.architecture.architectureId,
      color: 'white',
      label: plan.architecture.architectureId,
    },
    placeholderAssets,
    sockets: plan.assetSockets.map((s) => ({
      socketId: s.socketId,
      bounds: s.bounds,
      color: 'blue' as const,
      label: s.label,
    })),
    navigationNodes: plan.navigationGraph.walkPaths.map((path, i) => ({
      nodeId: `nav-${i}`,
      label: path,
      bounds: { left: `${20 + i * 10}%`, top: '75%', width: '15%', height: '10%' },
      walkable: true,
    })),
    lightingVolumes: [
      {
        volumeId: 'lighting-main',
        profileId: plan.lightingProfile.profileId,
        bounds: { left: '30%', top: '45%', width: '40%', height: '35%' },
        opacity: 0.15,
      },
    ],
    cameraMarkers: plan.cameraAnchors.map((a) => ({
      anchorId: a.anchorId,
      label: a.label,
      purpose: a.purpose,
      position: a.position,
    })),
    interactionZones: plan.interactionProfile.zones.map((z, i) => ({
      zoneId: z,
      label: z,
      bounds: { left: `${25 + i * 5}%`, top: '80%', width: '20%', height: '12%' },
    })),
    generationOccurred: false,
  };
}
