export const XNI_SUBSYSTEM_NAME = 'Narrative Intelligence™';
export const XNI_SUBSYSTEM_VERSION = '1.0.0';

export const XNI_ROOM_PATHS = [
  'narrative-intelligence',
  'production-genome',
  'narrative-blueprints',
  'course-engine',
  'episode-engine',
  'campaign-engine',
  'launch-engine',
  'commercial-engine',
  'narrative-playground',
] as const;

export type XniRoomPath = (typeof XNI_ROOM_PATHS)[number];

export const XNI_ROOM_PATH_LABELS: Record<XniRoomPath, string> = {
  'narrative-intelligence': 'Narrative Intelligence Arrival',
  'production-genome': 'Production Genome Registry™',
  'narrative-blueprints': 'Narrative Blueprint Registry™',
  'course-engine': 'Course Generator™',
  'episode-engine': 'Episode Generator™',
  'campaign-engine': 'Campaign Generator™',
  'launch-engine': 'Launch Generator™',
  'commercial-engine': 'Commercial Generator™',
  'narrative-playground': 'Narrative Intelligence Playground™',
};

export const XNI_DEMO_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XniDemoBrandId = (typeof XNI_DEMO_BRAND_IDS)[number];

export const XNI_DEMO_BRAND_LABELS: Record<XniDemoBrandId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  ndx: 'NDX™',
};

export const XNI_NARRATIVE_TYPES = [
  'experience',
  'episode',
  'campaign',
  'course',
  'launch',
  'commercial',
  'headquarters-film',
] as const;

export type XniNarrativeType = (typeof XNI_NARRATIVE_TYPES)[number];

export const XNI_NARRATIVE_TYPE_LABELS: Record<XniNarrativeType, string> = {
  experience: 'Narrative Experience™',
  episode: 'Episode',
  campaign: 'Campaign',
  course: 'Course',
  launch: 'Launch',
  commercial: 'Commercial',
  'headquarters-film': 'Headquarters Film',
};

export const XNI_BLUEPRINT_STATUSES = ['draft', 'pending-approval', 'approved', 'rejected'] as const;
export type XniBlueprintStatus = (typeof XNI_BLUEPRINT_STATUSES)[number];

export const XNI_CONSUMER_SYSTEMS = [
  'creative-direction-studio',
  'content-engine',
  'experience-engine',
  'studio-foundry',
  'institute-of-knowledge',
  'orb',
  'campaign-engine',
  'course-engine',
  'experience-runtime',
  'studio-intelligence-layer',
] as const;

export type XniConsumerSystem = (typeof XNI_CONSUMER_SYSTEMS)[number];
