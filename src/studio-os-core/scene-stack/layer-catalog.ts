import type { SceneStackLayerDefinition, SceneStackLayerId } from './types';

export const SCENE_STACK_LAYER_CATALOG: Record<SceneStackLayerId, SceneStackLayerDefinition> = {
  'environment-shell': {
    id: 'environment-shell',
    order: 1,
    displayName: 'Environment Shell™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--environment-shell',
  },
  'signature-landmark': {
    id: 'signature-landmark',
    order: 2,
    displayName: 'Signature Landmark™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--signature-landmark',
  },
  'furniture-objects': {
    id: 'furniture-objects',
    order: 3,
    displayName: 'Furniture & Physical Objects™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--furniture-objects',
  },
  'lighting-systems': {
    id: 'lighting-systems',
    order: 4,
    displayName: 'Lighting Systems™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--lighting-systems',
  },
  'atmospheric-systems': {
    id: 'atmospheric-systems',
    order: 5,
    displayName: 'Atmospheric Systems™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--atmospheric-systems',
  },
  'surface-materials': {
    id: 'surface-materials',
    order: 6,
    displayName: 'Surface Materials & Detail™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--surface-materials',
  },
  'ambient-motion': {
    id: 'ambient-motion',
    order: 7,
    displayName: 'Ambient Motion™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--ambient-motion',
  },
  interaction: {
    id: 'interaction',
    order: 8,
    displayName: 'Interaction Layer™',
    role: 'cursor-runtime',
    generatable: false,
    requiresApproval: false,
    composeClass: 'cds-stack__layer--interaction',
  },
  'runtime-effects': {
    id: 'runtime-effects',
    order: 9,
    displayName: 'Runtime Effects™',
    role: 'cursor-runtime',
    generatable: false,
    requiresApproval: false,
    composeClass: 'cds-stack__layer--runtime-effects',
  },
  'founder-personalization': {
    id: 'founder-personalization',
    order: 10,
    displayName: 'Founder Personalization™',
    role: 'fal-generated',
    generatable: true,
    requiresApproval: true,
    composeClass: 'cds-stack__layer--founder-personalization',
  },
};

export function getLayerDefinition(layerId: SceneStackLayerId): SceneStackLayerDefinition {
  return SCENE_STACK_LAYER_CATALOG[layerId];
}

export function listGeneratableLayers(): SceneStackLayerDefinition[] {
  return Object.values(SCENE_STACK_LAYER_CATALOG)
    .filter((l) => l.generatable)
    .sort((a, b) => a.order - b.order);
}

export function listComposeLayers(): SceneStackLayerDefinition[] {
  return Object.values(SCENE_STACK_LAYER_CATALOG)
    .filter((l) => l.role === 'fal-generated')
    .sort((a, b) => a.order - b.order);
}

/** HUD / pipeline strip abbreviations */
export const SCENE_STACK_LAYER_SHORT_LABELS: Record<SceneStackLayerId, string> = {
  'environment-shell': 'Shell',
  'signature-landmark': 'Landmark',
  'furniture-objects': 'Furniture',
  'lighting-systems': 'Lighting',
  'atmospheric-systems': 'Atmosphere',
  'surface-materials': 'Materials',
  'ambient-motion': 'Motion',
  interaction: 'Interaction',
  'runtime-effects': 'FX',
  'founder-personalization': 'Personal',
};
