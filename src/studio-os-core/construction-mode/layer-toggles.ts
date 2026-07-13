import type { ConstructionLayerId } from './contract';

export const LAYER_TOGGLES_VERSION = 'layer-toggles.v1';

export type LayerToggleState = {
  layerId: ConstructionLayerId;
  label: string;
  visible: boolean;
  isolated: boolean;
};

export const DEFAULT_LAYER_TOGGLES: LayerToggleState[] = [
  { layerId: 'architecture', label: 'Architecture', visible: true, isolated: false },
  { layerId: 'hero-assets', label: 'Hero Assets', visible: true, isolated: false },
  { layerId: 'furniture', label: 'Furniture', visible: true, isolated: false },
  { layerId: 'decor', label: 'Decor', visible: true, isolated: false },
  { layerId: 'materials', label: 'Materials', visible: false, isolated: false },
  { layerId: 'lighting', label: 'Lighting', visible: true, isolated: false },
  { layerId: 'collision', label: 'Collision', visible: false, isolated: false },
  { layerId: 'navigation', label: 'Navigation', visible: true, isolated: false },
  { layerId: 'interaction', label: 'Interaction', visible: false, isolated: false },
  { layerId: 'camera-anchors', label: 'Camera Anchors', visible: false, isolated: false },
  { layerId: 'sockets', label: 'Sockets', visible: true, isolated: false },
  { layerId: 'health', label: 'Health', visible: false, isolated: false },
  { layerId: 'dependencies', label: 'Dependencies', visible: false, isolated: false },
  { layerId: 'generation-queue', label: 'Generation Queue', visible: false, isolated: false },
];

export function initLayerToggles(): LayerToggleState[] {
  return DEFAULT_LAYER_TOGGLES.map((l) => ({ ...l }));
}

export function toggleLayerVisibility(
  layers: LayerToggleState[],
  layerId: ConstructionLayerId,
  visible: boolean
): LayerToggleState[] {
  return layers.map((l) => (l.layerId === layerId ? { ...l, visible } : l));
}

export function isolateLayer(layers: LayerToggleState[], layerId: ConstructionLayerId): LayerToggleState[] {
  return layers.map((l) => ({
    ...l,
    visible: l.layerId === layerId,
    isolated: l.layerId === layerId,
  }));
}

export function resetLayerIsolation(layers: LayerToggleState[]): LayerToggleState[] {
  return layers.map((l) => ({ ...l, isolated: false, visible: true }));
}

export function getVisibleLayers(layers: LayerToggleState[]): ConstructionLayerId[] {
  return layers.filter((l) => l.visible).map((l) => l.layerId);
}
