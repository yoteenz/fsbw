import type { StudioWorldIconProceduralState } from './types';
import type { IconMaterialId } from './types';

export type MaterialLayer = {
  id: IconMaterialId;
  intensity: number;
  blend: 'normal' | 'screen' | 'overlay' | 'soft-light';
};

const BASE_MATERIALS: MaterialLayer[] = [
  { id: 'chrome', intensity: 1, blend: 'normal' },
  { id: 'glass', intensity: 0.16, blend: 'soft-light' },
  { id: 'glow', intensity: 0.12, blend: 'screen' },
  { id: 'reflection', intensity: 0.06, blend: 'overlay' },
  { id: 'bloom', intensity: 0.08, blend: 'screen' },
  { id: 'shadow', intensity: 0.04, blend: 'normal' },
  { id: 'edge', intensity: 0.04, blend: 'screen' },
];

const STATE_MATERIAL_OVERRIDES: Partial<
  Record<StudioWorldIconProceduralState, Partial<Record<IconMaterialId, number>>>
> = {
  hover: { glow: 0.2, edge: 0.12, bloom: 0.12, reflection: 0.1 },
  active: { edge: 0.18, bloom: 0.14, glow: 0.16, reflection: 0.12 },
  focused: { edge: 0.1, glow: 0.14 },
  pressed: { shadow: 0.08, chrome: 0.95 },
  selected: { glow: 0.18, edge: 0.14, bloom: 0.1 },
  disabled: { glass: 0.28, glow: 0.04, chrome: 0.7 },
  locked: { glass: 0.32, opacity: 0.72 },
  generating: { edge: 0.22, glow: 0.2 },
  loading: { glow: 0.14 },
  success: { edge: 0.16, glow: 0.14 },
  warning: { edge: 0.14, glow: 0.12 },
  error: { edge: 0.14, glow: 0.1 },
  premium: { edge: 0.2, bloom: 0.12, reflection: 0.14 },
  ai: { glow: 0.16, edge: 0.12 },
  live: { glow: 0.14 },
  syncing: { edge: 0.1, glow: 0.12 },
  offline: { glass: 0.24, glow: 0.04 },
  beta: { edge: 0.1 },
  experimental: { edge: 0.08, glow: 0.1 },
};

export function resolveIconMaterials(state: StudioWorldIconProceduralState): MaterialLayer[] {
  const overrides = STATE_MATERIAL_OVERRIDES[state] ?? {};
  return BASE_MATERIALS.map((layer) => ({
    ...layer,
    intensity: overrides[layer.id] ?? layer.intensity,
  }));
}

export function materialIdsForState(state: StudioWorldIconProceduralState): IconMaterialId[] {
  return resolveIconMaterials(state).map((m) => m.id);
}
