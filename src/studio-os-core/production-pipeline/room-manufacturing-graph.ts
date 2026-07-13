import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export type ManufacturingGraphNodeKind =
  | 'structural'
  | 'hero'
  | 'furniture'
  | 'decor'
  | 'lighting'
  | 'atmosphere'
  | 'reflection';

export type ManufacturingGraphNode = {
  nodeId: string;
  label: string;
  kind: ManufacturingGraphNodeKind;
  socketId: string | null;
  assetId: string | null;
  assetClass: string | null;
  tier: 'hero' | 'furniture' | 'decor' | 'environment' | null;
  selectable: boolean;
  regeneratesIndependently: boolean;
};

export type RoomManufacturingGraph = {
  graphVersion: 'room-manufacturing-graph.v1';
  roomId: string;
  roomDisplayName: string;
  blueprintRevision: number;
  masterReferenceUrl: string | null;
  nodes: ManufacturingGraphNode[];
};

const STRUCTURAL_SHELL_NODES: Array<{ nodeId: string; label: string; kind: ManufacturingGraphNodeKind }> = [
  { nodeId: 'floor', label: 'Floor', kind: 'structural' },
  { nodeId: 'ceiling', label: 'Ceiling', kind: 'structural' },
  { nodeId: 'left-wall', label: 'Left Wall', kind: 'structural' },
  { nodeId: 'right-wall', label: 'Right Wall', kind: 'structural' },
  { nodeId: 'glass-panels', label: 'Glass Panels', kind: 'structural' },
  { nodeId: 'reflection-layer', label: 'Reflection Layer', kind: 'reflection' },
  { nodeId: 'atmosphere-layer', label: 'Atmosphere Layer', kind: 'atmosphere' },
  { nodeId: 'lighting', label: 'Lighting', kind: 'lighting' },
];

function socketLabel(plan: ConstructionPlan, socketId: string): string {
  return plan.assetSockets.find((s) => s.socketId === socketId)?.label ?? socketId;
}

export function buildRoomManufacturingGraph(input: {
  plan: ConstructionPlan;
  masterReferenceUrl?: string | null;
}): RoomManufacturingGraph {
  const { plan } = input;
  const nodes: ManufacturingGraphNode[] = STRUCTURAL_SHELL_NODES.map((shell) => ({
    nodeId: shell.nodeId,
    label: shell.label,
    kind: shell.kind,
    socketId: null,
    assetId: null,
    assetClass: null,
    tier: shell.kind === 'structural' ? 'environment' : null,
    selectable: shell.kind !== 'atmosphere',
    regeneratesIndependently: true,
  }));

  const pushAsset = (
    asset: { assetId: string; assetClass: string; socketId: string },
    tier: 'hero' | 'furniture' | 'decor',
    kind: ManufacturingGraphNodeKind
  ) => {
    nodes.push({
      nodeId: asset.assetId,
      label: socketLabel(plan, asset.socketId),
      kind,
      socketId: asset.socketId,
      assetId: asset.assetId,
      assetClass: asset.assetClass,
      tier,
      selectable: true,
      regeneratesIndependently: true,
    });
  };

  for (const asset of plan.heroAssets) pushAsset(asset, 'hero', 'hero');
  for (const asset of plan.furnitureSet.assets) pushAsset(asset, 'furniture', 'furniture');
  for (const asset of plan.decorSet.assets) pushAsset(asset, 'decor', 'decor');

  return {
    graphVersion: 'room-manufacturing-graph.v1',
    roomId: plan.room.roomId,
    roomDisplayName: plan.room.displayName,
    blueprintRevision: plan.metadata.revision,
    masterReferenceUrl: input.masterReferenceUrl ?? null,
    nodes,
  };
}
