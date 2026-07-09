export const XPS_SUBSYSTEM_NAME = 'Studio Production System™';
export const XPS_SUBSYSTEM_VERSION = '1.0.0';

export const XPS_ROOM_PATHS = [
  'studio-production',
  'creative-executive',
  'showrunner',
  'story-department',
  'casting',
  'production-design',
  'lighting',
  'camera',
  'audio',
  'music',
  'editorial',
  'post-production',
  'distribution',
  'quality-control',
  'production-control-room',
  'production-playground',
] as const;

export type XpsRoomPath = (typeof XPS_ROOM_PATHS)[number];

export const XPS_ROOM_PATH_LABELS: Record<XpsRoomPath, string> = {
  'studio-production': 'Studio Production Arrival',
  'creative-executive': 'Creative Executive™',
  showrunner: 'Showrunner™',
  'story-department': 'Story Department™',
  casting: 'Casting Department™',
  'production-design': 'Production Design™',
  lighting: 'Lighting Department™',
  camera: 'Camera Department™',
  audio: 'Sound Department™',
  music: 'Music Department™',
  editorial: 'Editorial™',
  'post-production': 'Post Production™',
  distribution: 'Distribution Intelligence™',
  'quality-control': 'Quality Control™',
  'production-control-room': 'Production Control Room™',
  'production-playground': 'Production Playground™',
};

export const XPS_DEMO_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XpsDemoBrandId = (typeof XPS_DEMO_BRAND_IDS)[number];

export const XPS_DEMO_BRAND_LABELS: Record<XpsDemoBrandId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  ndx: 'NDX™',
};

export const XPS_PLATFORMS = [
  'youtube',
  'tiktok',
  'instagram',
  'podcast',
  'newsletter',
  'blog',
  'course',
  'community',
  'email',
  'headquarters',
] as const;

export type XpsPlatform = (typeof XPS_PLATFORMS)[number];

export const XPS_PLATFORM_LABELS: Record<XpsPlatform, string> = {
  youtube: 'YouTube',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  podcast: 'Podcast',
  newsletter: 'Newsletter',
  blog: 'Blog',
  course: 'Course Module',
  community: 'Community Post',
  email: 'Email Campaign',
  headquarters: 'Headquarters',
};

export const XPS_DEPARTMENT_IDS = [
  'creative-executive',
  'executive-producer',
  'creative-director',
  'showrunner',
  'story-department',
  'casting',
  'production-design',
  'lighting',
  'camera',
  'audio',
  'music',
  'editorial',
  'post-production',
  'quality-control',
  'distribution',
  'performance-analytics',
] as const;

export type XpsDepartmentId = (typeof XPS_DEPARTMENT_IDS)[number];

export const XPS_DEPARTMENT_LABELS: Record<XpsDepartmentId, string> = {
  'creative-executive': 'Creative Executive™',
  'executive-producer': 'Executive Producer™',
  'creative-director': 'Creative Director™',
  showrunner: 'Showrunner™',
  'story-department': 'Story Department™',
  casting: 'Casting Department™',
  'production-design': 'Production Design™',
  lighting: 'Lighting Department™',
  camera: 'Camera Department™',
  audio: 'Sound Department™',
  music: 'Music Department™',
  editorial: 'Editorial™',
  'post-production': 'Post Production™',
  'quality-control': 'Quality Control™',
  distribution: 'Distribution Intelligence™',
  'performance-analytics': 'Performance Analytics™',
};

export const XPS_PRODUCTION_STAGES = [
  'intake',
  'team-assembly',
  'pre-production',
  'production-design',
  'asset-production',
  'editorial',
  'quality-control',
  'approval',
  'distribution-ready',
  'published',
  'performance-review',
] as const;

export type XpsProductionStage = (typeof XPS_PRODUCTION_STAGES)[number];

export const XPS_PRODUCTION_STAGE_LABELS: Record<XpsProductionStage, string> = {
  intake: 'Intake',
  'team-assembly': 'Team Assembly',
  'pre-production': 'Pre-Production',
  'production-design': 'Production Design',
  'asset-production': 'Asset Production',
  editorial: 'Editorial',
  'quality-control': 'Quality Control',
  approval: 'Approval',
  'distribution-ready': 'Distribution Ready',
  published: 'Published',
  'performance-review': 'Performance Review',
};

export const XPS_APPROVAL_GATE_IDS = [
  'narrative-blueprint',
  'strategic-fit',
  'production-package',
  'casting',
  'production-design',
  'camera-sound-post',
  'asset-generation',
  'editorial-lock',
  'qc-pass',
  'distribution',
  'publish',
] as const;

export type XpsApprovalGateId = (typeof XPS_APPROVAL_GATE_IDS)[number];

export const XPS_CONSUMER_SYSTEMS = [
  'narrative-intelligence',
  'brand-discovery-engine',
  'studio-intelligence-layer',
  'experience-engine',
  'studio-foundry',
  'content-engine',
  'orb',
  'distribution-network',
] as const;

export type XpsConsumerSystem = (typeof XPS_CONSUMER_SYSTEMS)[number];
