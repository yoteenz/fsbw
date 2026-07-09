import type { XerRenderNode } from '../types';
import type { XerResolvedDnaLayers } from './dna-resolver';

export function assembleComponentBindings(layers: XerResolvedDnaLayers): XerRenderNode[] {
  return layers.components.map((c) => ({
    nodeId: `node-component-${c.componentId}` as XerRenderNode['nodeId'],
    role: c.sceneLayer,
    componentId: c.componentId,
    variant: c.variant,
    cssBindings: Object.fromEntries(c.tokenBindings.map((t, i) => [`token-${i}`, t])),
    stateSlotIds: [],
  }));
}

export function getComponentVariantForRole(
  nodes: XerRenderNode[],
  role: string
): XerRenderNode | undefined {
  return nodes.find((n) => n.role === role);
}
