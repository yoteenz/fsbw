export const XEE_SUBSYSTEM_NAME = 'Experience Engine™';
export const XEE_SUBSYSTEM_VERSION = '1.0.0';

/** Experience Engine™ wing destinations */
export const XEE_ROOM_PATHS = [
  'experience-engine',
  'brand-dna',
  'department-dna',
  'scene-dna',
  'component-dna',
  'motion-dna',
  'interaction-dna',
  'theme-playground',
] as const;

export type XeeRoomPath = (typeof XEE_ROOM_PATHS)[number];

export const XEE_ROOM_PATH_LABELS: Record<XeeRoomPath, string> = {
  'experience-engine': 'Experience Engine™ Arrival',
  'brand-dna': 'Brand Registry™',
  'department-dna': 'Department Registry™',
  'scene-dna': 'Scene Registry™',
  'component-dna': 'Component Registry™',
  'motion-dna': 'Motion Registry™',
  'interaction-dna': 'Interaction Registry™',
  'theme-playground': 'Experience Playground™',
};

export const XEE_DEMO_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XeeDemoBrandId = (typeof XEE_DEMO_BRAND_IDS)[number];

export const XEE_DEMO_BRAND_LABELS: Record<XeeDemoBrandId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  'ndx': 'NDX™',
};

export const XEE_SHARED_SCENE_ID = 'executive-headquarters';
export const XEE_LEGACY_SCENE_ID = 'hq-master-demonstration-v1';
