export type GeometryModuleFamily =
  | 'FOUNDATIONS'
  | 'WALLS'
  | 'GLASS'
  | 'FRAMES'
  | 'ROOFS'
  | 'FLOORS'
  | 'DOORS'
  | 'STAIRS'
  | 'PORTALS'
  | 'LANDMARKS'
  | 'ENVIRONMENT_PROPS'
  | 'INTERACTION_ANCHORS'
  | 'COLLISION_MESHES'
  | 'NAVIGATION_SURFACES';

export type SceneAssemblyInstance = {
  instanceId: string;
  assetId: string;
  zoneId: string;
  transform: { position: [number, number, number]; rotation: [number, number, number]; scale: [number, number, number] };
  parentInstanceId?: string;
  materialOverride?: string;
  collisionRef?: string;
  navigationRef?: string;
  interactionAnchorId?: string;
  lightingGroup?: string;
  visibilityState: 'VISIBLE' | 'HIDDEN' | 'STREAMED';
};

export type InteractionAnchorKind =
  | 'ENTER'
  | 'EXIT'
  | 'INSPECT'
  | 'OPEN'
  | 'CLOSE'
  | 'SELECT'
  | 'NAVIGATE'
  | 'TELEPORT'
  | 'INTERACT_WITH_RESIDENT'
  | 'INTERACT_WITH_READER'
  | 'ENTER_SESSION'
  | 'VIEW_PRODUCT'
  | 'CUSTOM';

export type InteractionAnchor = {
  anchorId: string;
  zoneId: string;
  kind: InteractionAnchorKind;
  transform: { position: [number, number, number]; rotation: [number, number, number] };
  applicationBindingRef?: string;
  notes?: string;
};

export type SpatialGraphNode = {
  nodeId: string;
  zoneId: string;
  connectedNodeIds: string[];
  entryAnchors: string[];
  exitAnchors: string[];
};

export function validateSpatialContinuity(nodes: SpatialGraphNode[]): string[] {
  const errors: string[] = [];
  for (const node of nodes) {
    for (const target of node.connectedNodeIds) {
      const reverse = nodes.find((n) => n.nodeId === target);
      if (!reverse?.connectedNodeIds.includes(node.nodeId)) {
        errors.push(`Asymmetric zone connection: ${node.nodeId} → ${target}`);
      }
    }
  }
  return errors;
}
