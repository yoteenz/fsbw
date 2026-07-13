import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';
import type { HealthOverlayColor } from './contract';

export const SOCKET_VISUALIZATION_VERSION = 'socket-visualization.v1';

export type SocketVisualizationNode = {
  socketId: string;
  purpose: string;
  acceptedAssetTypes: string[];
  occupied: boolean;
  occupiedByAssetId: string | null;
  health: HealthOverlayColor;
  dependencies: string[];
  bounds: { left: string; top: string; width: string; height: string };
  required: boolean;
};

export function buildSocketVisualization(input: {
  plan: ConstructionPlan;
  dnaRecords: AssetDnaRecord[];
}): SocketVisualizationNode[] {
  const allAssets = [...input.plan.heroAssets, ...input.plan.furnitureSet.assets, ...input.plan.decorSet.assets];

  return input.plan.assetSockets.map((socket) => {
    const occupant = allAssets.find((a) => a.socketId === socket.socketId);
    return {
      socketId: socket.socketId,
      purpose: socket.label,
      acceptedAssetTypes: socket.compatibleAssetClasses,
      occupied: Boolean(occupant),
      occupiedByAssetId: occupant?.assetId ?? null,
      health: occupant ? 'green' : socket.required ? 'gray' : 'purple',
      dependencies: socket.role === 'hero' ? [input.plan.architecture.architectureId] : [],
      bounds: socket.bounds,
      required: socket.required,
    };
  });
}
