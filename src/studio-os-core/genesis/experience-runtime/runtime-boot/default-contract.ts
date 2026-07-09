/** Canonical default Experience Runtime test contract — always safe to assemble. */
export const XER_DEFAULT_RUNTIME_CONTRACT = {
  brandId: 'studio-os',
  departmentId: 'executive',
  sceneId: 'executive-headquarters',
  templateId: 'hq-master-scene-v1',
  designDnaVersion: 'v1',
  stateDnaVersion: 'v1',
  platformDnaVersion: '1.0.0',
  motionDnaId: 'motion-studio-os',
  componentId: 'executive-header',
} as const;

export const XER_CANONICAL_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;

export const XER_CANONICAL_DEPARTMENT_IDS = [
  'executive',
  'knowledge',
  'creative',
  'command',
  'ai',
] as const;

export const XER_CANONICAL_SCENE_IDS = [
  'executive-headquarters',
  'institute-of-knowledge',
  'command-center',
  'content-engine',
  'orb-room',
] as const;
