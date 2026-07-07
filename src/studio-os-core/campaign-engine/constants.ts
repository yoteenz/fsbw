import type { CampaignHierarchyLevel, CampaignTypeId, CampaignWorkspaceTab } from './types';

export const CAMPAIGN_ENGINE_STORAGE_KEY = 'studioOsCampaignEngine_v2';
export const CAMPAIGN_ENGINE_VERSION = '1.1.0';
/** Bump when seed deliverables change — forces merge into existing browser stores. */
export const CAMPAIGN_ENGINE_DATA_REVISION = 2;

export const CAMPAIGN_WORKSPACE_TABS: { id: CampaignWorkspaceTab; label: string }[] = [
  { id: 'overview', label: 'OVERVIEW' },
  { id: 'deliverables', label: 'DELIVERABLES' },
  { id: 'calendar', label: 'CALENDAR' },
  { id: 'research', label: 'RESEARCH' },
  { id: 'analytics', label: 'ANALYTICS' },
];
export const CAMPAIGN_ENGINE_ID = 'campaign-engine';

export const CAMPAIGN_PLATFORM_CHAIN = [
  { level: 'studio-os', label: 'STUDIO OS', description: 'Platform · strategy defines direction · campaigns organize execution' },
  { level: 'campaign-engine', label: 'CAMPAIGN ENGINE', description: 'Primary execution framework · strategy → coordinated deliverables' },
  { level: 'newsroom', label: 'NEWSROOM · DISTRIBUTION', description: 'Produces assets · delivers · learns · preserves wisdom' },
] as const;

export const CAMPAIGN_HIERARCHY_CHAIN: { level: CampaignHierarchyLevel; label: string; description: string }[] = [
  { level: 'vision', label: 'VISION', description: 'Long-term direction' },
  { level: 'mission', label: 'MISSION', description: 'Why the company exists' },
  { level: 'strategy', label: 'STRATEGY', description: 'How we win' },
  { level: 'initiative', label: 'INITIATIVE', description: 'Major program bridging strategy and campaigns' },
  { level: 'campaign', label: 'CAMPAIGN', description: 'Coordinated execution unit' },
  { level: 'deliverables', label: 'DELIVERABLES', description: 'Pages · videos · emails · products · assets' },
  { level: 'distribution', label: 'DISTRIBUTION', description: 'Channels · platforms · publish schedule' },
  { level: 'analytics', label: 'ANALYTICS', description: 'Reach · engagement · conversion · ROI' },
  { level: 'institutional-learning', label: 'INSTITUTIONAL LEARNING', description: 'Retrospectives · playbooks · knowledge graph' },
];

export const CAMPAIGN_TYPES: { id: CampaignTypeId; label: string }[] = [
  { id: 'product-launch', label: 'PRODUCT LAUNCH' },
  { id: 'content-series', label: 'CONTENT SERIES' },
  { id: 'brand-awareness', label: 'BRAND AWARENESS' },
  { id: 'social-media', label: 'SOCIAL MEDIA' },
  { id: 'email-marketing', label: 'EMAIL MARKETING' },
  { id: 'partnerships', label: 'PARTNERSHIPS' },
  { id: 'affiliate', label: 'AFFILIATE CAMPAIGNS' },
  { id: 'creator-collaboration', label: 'CREATOR COLLABORATIONS' },
  { id: 'events', label: 'EVENTS' },
  { id: 'community', label: 'COMMUNITY CAMPAIGNS' },
  { id: 'promotions', label: 'PROMOTIONS' },
  { id: 'seasonal', label: 'SEASONAL CAMPAIGNS' },
  { id: 'internal', label: 'INTERNAL INITIATIVES' },
  { id: 'research', label: 'RESEARCH CAMPAIGNS' },
  { id: 'marketplace', label: 'MARKETPLACE CAMPAIGNS' },
];

export const CAMPAIGN_BUILDER_STEPS = [
  'Campaign name',
  'Campaign objective',
  'Supporting strategy',
  'Initiative',
  'Target audience',
  'Success metrics',
  'Timeline',
  'Budget',
  'Channels',
  'Deliverables',
  'Approval',
  'Launch',
] as const;

export const CAMPAIGN_CONNECTED_SYSTEMS = [
  'Strategy Engine',
  'Newsroom',
  'Studio Intelligence',
  'Chief of Staff',
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Leadership DNA',
  'Operational DNA',
  'Knowledge Graph',
  'Studio OS Labs',
  'Simulation Engine',
  'Creator Marketplace',
  'Growth Network',
] as const;

export const CAMPAIGN_DEPARTMENTS = [
  'Marketing',
  'Creative',
  'Content',
  'Operations',
  'Finance',
  'Legal',
  'Analytics',
  'Technology',
  'Talent',
] as const;
