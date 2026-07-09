export const XER_SUBSYSTEM_NAME = 'Experience Runtime™';
export const XER_SUBSYSTEM_VERSION = '1.0.0';

export const XER_ROOM_PATHS = [
  'experience-runtime',
  'runtime',
  'runtime-engine',
  'runtime-cache',
  'runtime-registry',
  'runtime-state',
  'runtime-preview',
  'runtime-playground',
] as const;

export type XerRoomPath = (typeof XER_ROOM_PATHS)[number];

export const XER_ROOM_PATH_LABELS: Record<XerRoomPath, string> = {
  'experience-runtime': 'Experience Runtime™ Arrival',
  runtime: 'Runtime Overview',
  'runtime-engine': 'Runtime Engine',
  'runtime-cache': 'Runtime Cache',
  'runtime-registry': 'Runtime Registry',
  'runtime-state': 'Runtime State',
  'runtime-preview': 'Runtime Preview',
  'runtime-playground': 'Runtime Playground',
};

export const XER_DEMO_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XerDemoBrandId = (typeof XER_DEMO_BRAND_IDS)[number];

export const XER_DEMO_BRAND_LABELS: Record<XerDemoBrandId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  ndx: 'NDX™',
};

export const XER_SHARED_SCENE_ID = 'executive-headquarters';
export const XER_LEGACY_SCENE_ID = 'hq-master-demonstration-v1';
export const XER_PLATFORM_DNA_ID = 'studio-os-platform-v1';

/** Stable runtime node IDs — never change when Brand DNA switches */
export const XER_SCENE_NODE_IDS = [
  'node-executive-header',
  'node-navigation-rail',
  'node-hero-environment',
  'node-primary-focal-object',
  'node-capability-panels',
  'node-orb-mount',
  'node-footer-ribbon',
] as const;

export type XerSceneNodeId = (typeof XER_SCENE_NODE_IDS)[number];
