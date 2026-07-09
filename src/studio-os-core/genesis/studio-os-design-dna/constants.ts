export const DDNA_SUBSYSTEM_NAME = 'Studio OS Design DNA™';
export const DDNA_SUBSYSTEM_VERSION = '1.0.0';

/** Design DNA™ constitutional wing destinations */
export const DDNA_ROOM_PATHS = [
  'design-dna',
  'design-tokens',
  'department-themes',
  'scene-templates',
  'component-library',
  'color-system',
  'navigation-system',
  'motion-system',
  'icon-system',
  'lighting-system',
] as const;

export type DdnaRoomPath = (typeof DDNA_ROOM_PATHS)[number];

export const DDNA_ROOM_PATH_LABELS: Record<DdnaRoomPath, string> = {
  'design-dna': 'Design DNA™ Arrival',
  'design-tokens': 'Design Token Registry™',
  'department-themes': 'Department Theme Registry™',
  'scene-templates': 'Scene Template Engine™',
  'component-library': 'Component Library™',
  'color-system': 'Color System™',
  'navigation-system': 'Cognitive Navigation Engine™',
  'motion-system': 'Motion & Animation Engine™',
  'icon-system': 'Icon System™',
  'lighting-system': 'Lighting Engine™',
};

export const DDNA_TOKEN_CATEGORIES = [
  'spacing',
  'grid',
  'typography',
  'color',
  'glass',
  'blur',
  'elevation',
  'borders',
  'animation',
  'lighting',
  'particles',
  'icons',
  'cards',
  'buttons',
  'navigation',
  'panels',
] as const;

export type DdnaTokenCategory = (typeof DDNA_TOKEN_CATEGORIES)[number];

export const DDNA_SCENE_LAYERS = [
  'hero-environment',
  'primary-focal-object',
  'executive-header',
  'department-identity',
  'capability-panels',
  'navigation-layer',
  'orb-layer',
  'transition-layer',
  'footer',
  'animation-hooks',
] as const;

export type DdnaSceneLayerId = (typeof DDNA_SCENE_LAYERS)[number];

export const DDNA_SCENE_LAYER_LABELS: Record<DdnaSceneLayerId, string> = {
  'hero-environment': 'Hero Environment',
  'primary-focal-object': 'Primary Focal Object',
  'executive-header': 'Executive Header',
  'department-identity': 'Department Identity',
  'capability-panels': 'Capability Panels',
  'navigation-layer': 'Navigation Layer',
  'orb-layer': 'Orb Layer',
  'transition-layer': 'Transition Layer',
  footer: 'Footer',
  'animation-hooks': 'Animation Hooks',
};
