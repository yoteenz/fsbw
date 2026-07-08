/**
 * Architect Debug View™ — optional toggles for generation debugging.
 */

export type ArchitectDebugLayer =
  | 'architecture'
  | 'furniture'
  | 'lighting'
  | 'materials'
  | 'atmosphere'
  | 'occlusion'
  | 'depth'
  | 'reflection'
  | 'shadow'
  | 'anchor-network'
  | 'object-bounds'
  | 'scene-graph';

export type ArchitectDebugViewState = {
  enabled: boolean;
  visibleLayers: Set<ArchitectDebugLayer>;
  soloLayer: ArchitectDebugLayer | null;
};

export const DEFAULT_DEBUG_VIEW: ArchitectDebugViewState = {
  enabled: false,
  visibleLayers: new Set<ArchitectDebugLayer>([
    'architecture',
    'furniture',
    'lighting',
    'materials',
    'atmosphere',
  ]),
  soloLayer: null,
};

export const ARCHITECT_DEBUG_LAYER_LABELS: Record<ArchitectDebugLayer, string> = {
  architecture: 'Architecture',
  furniture: 'Furniture',
  lighting: 'Lighting',
  materials: 'Materials',
  atmosphere: 'Atmosphere',
  occlusion: 'Occlusion',
  depth: 'Depth',
  reflection: 'Reflection',
  shadow: 'Shadow',
  'anchor-network': 'Anchor Network',
  'object-bounds': 'Object Bounds',
  'scene-graph': 'Scene Graph',
};

export function createDebugViewState(
  partial?: Partial<ArchitectDebugViewState>
): ArchitectDebugViewState {
  return {
    enabled: partial?.enabled ?? false,
    visibleLayers: partial?.visibleLayers ?? new Set(DEFAULT_DEBUG_VIEW.visibleLayers),
    soloLayer: partial?.soloLayer ?? null,
  };
}

export function toggleDebugLayer(
  state: ArchitectDebugViewState,
  layer: ArchitectDebugLayer
): ArchitectDebugViewState {
  const next = new Set(state.visibleLayers);
  if (next.has(layer)) next.delete(layer);
  else next.add(layer);
  return { ...state, visibleLayers: next };
}

export function isDebugLayerVisible(
  state: ArchitectDebugViewState,
  layer: ArchitectDebugLayer
): boolean {
  if (!state.enabled) return false;
  if (state.soloLayer) return state.soloLayer === layer;
  return state.visibleLayers.has(layer);
}

/** Map scene stack layer IDs to debug categories */
export function debugCategoryForLayerId(layerId: string): ArchitectDebugLayer | null {
  const map: Record<string, ArchitectDebugLayer> = {
    'environment-shell': 'architecture',
    'signature-landmark': 'architecture',
    'furniture-objects': 'furniture',
    'lighting-systems': 'lighting',
    'surface-materials': 'materials',
    'atmospheric-systems': 'atmosphere',
  };
  return map[layerId] ?? null;
}
