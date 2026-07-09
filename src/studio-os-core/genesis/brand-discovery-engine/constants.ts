export const XBD_SUBSYSTEM_NAME = 'Brand Discovery Engine™';
export const XBD_SUBSYSTEM_VERSION = '1.0.0';

export const XBD_ROOM_PATHS = [
  'brand-discovery-engine',
  'brand-discovery',
  'brand-dna',
  'brand-intelligence',
  'brand-consistency',
  'brand-elevation',
  'audience-discovery',
  'packaging-intelligence',
  'content-intelligence',
  'brand-applications',
  'brand-playground',
] as const;

export type XbdRoomPath = (typeof XBD_ROOM_PATHS)[number];

export const XBD_ROOM_PATH_LABELS: Record<XbdRoomPath, string> = {
  'brand-discovery-engine': 'Brand Discovery Arrival',
  'brand-discovery': 'Brand Discovery Flow',
  'brand-dna': 'Brand DNA Registry™',
  'brand-intelligence': 'Brand Intelligence Layer™',
  'brand-consistency': 'Brand Consistency Checker™',
  'brand-elevation': 'Brand Elevation Engine™',
  'audience-discovery': 'Audience Discovery Engine™',
  'packaging-intelligence': 'Packaging Strategy Engine™',
  'content-intelligence': 'Content Direction Engine™',
  'brand-applications': 'Brand Application Engine™',
  'brand-playground': 'Brand DNA Playground',
};

export const XBD_DEMO_BRAND_IDS = ['studio-os', 'frontal-slayer', 'ndx'] as const;
export type XbdDemoBrandId = (typeof XBD_DEMO_BRAND_IDS)[number];

export const XBD_DEMO_BRAND_LABELS: Record<XbdDemoBrandId, string> = {
  'studio-os': 'Studio OS™',
  'frontal-slayer': 'Frontal Slayer™',
  ndx: 'NDX™',
};

export const XBD_PLAYGROUND_ASSET_TYPES = [
  'packaging',
  'campaign-card',
  'website-hero',
  'headquarters-room',
  'orb-message',
  'social-post',
  'product-page',
] as const;

export type XbdPlaygroundAssetType = (typeof XBD_PLAYGROUND_ASSET_TYPES)[number];

export const XBD_PLAYGROUND_ASSET_LABELS: Record<XbdPlaygroundAssetType, string> = {
  packaging: 'Packaging',
  'campaign-card': 'Campaign Card',
  'website-hero': 'Website Hero',
  'headquarters-room': 'Headquarters Room',
  'orb-message': 'Orb Message',
  'social-post': 'Social Post',
  'product-page': 'Product Page',
};

export const XBD_CONSUMER_SYSTEMS = [
  'experience-runtime',
  'studio-foundry',
  'content-engine',
  'packaging-engine',
  'audience-engine',
  'orb',
  'headquarters',
  'institute-of-knowledge',
  'company-genome',
  'scene-generator',
  'marketing-engine',
] as const;

export type XbdConsumerSystem = (typeof XBD_CONSUMER_SYSTEMS)[number];
