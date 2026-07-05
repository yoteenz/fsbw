/** Demo metrics for THE STUDIO admin module (CMS-ready placeholders). */

export const ADMIN_STUDIO_DASHBOARD_METRIC = 14;

export const ADMIN_STUDIO_DASHBOARD_ITEMS = [
  { label: 'SHOWS', value: '8', color: 'text-red-500' as const },
  { label: 'DRAFTS', value: '18', color: 'text-gray-500' as const },
  { label: 'SCHEDULED', value: '6', color: 'text-gray-500' as const },
  { label: 'CONTENT PACKS', value: '42', color: 'text-gray-500' as const },
  { label: 'PROMPTS', value: '63', color: 'text-gray-500' as const },
  { label: 'AI GENERATIONS', value: '121', color: 'text-red-500' as const },
];

export const ADMIN_STUDIO_DASHBOARD_FOOTER = 'NEXT RELEASE — SLAY REPORT • FRIDAY • 7PM';

export const ADMIN_STUDIO_HUB_SUBTITLE = 'WHERE EVERY FRONTAL SLAYER STORY BEGINS.';

export type AdminStudioSectionId =
  | 'shows'
  | 'content-packs'
  | 'ai-studio'
  | 'prompt-library'
  | 'asset-library'
  | 'publishing-queue'
  | 'drafts'
  | 'scheduled'
  | 'analytics'
  | 'calendar'
  | 'recent-generations'
  | 'content-brain'
  | 'creative-director'
  | 'intelligence-engine'
  | 'ai-orchestrator'
  | 'show-bible'
  | 'studio-lot'
  | 'talent-agency'
  | 'casting'
  | 'production'
  | 'ai-production-engine'
  | 'distribution-network'
  | 'audience-brain'
  | 'growth-network'
  | 'labs'
  | 'ai-media-network'
  | 'ndxbook'
  | 'talent-network'
  | 'marketplace'
  | 'business-model-engine'
  | 'ecosystem'
  | 'governance'
  | 'studio-intelligence'
  | 'simulation-engine'
  | 'vision-engine'
  | 'executive-command-center'
  | 'mission-control'
  | 'legacy-system'
  | 'asset-director'
  | 'blueprint-manager'
  | 'asset-factory'
  | 'production-builder'
  | 'director-mode'
  | 'executive-ai-director'
  | 'campaign-orchestrator'
  | 'knowledge-hub'
  | 'memory-bible'
  | 'brand-assets';

export type AdminStudioHubCard = {
  id: AdminStudioSectionId;
  title: string;
  /** Handwritten metric (upper-right). */
  metric: string;
  description: string;
  route: string;
};

export const ADMIN_STUDIO_HUB_CARDS: AdminStudioHubCard[] = [
  {
    id: 'shows',
    title: 'SHOWS',
    metric: '8',
    description: 'SERIES, EPISODES & LOUNGE TV PROGRAMMING.',
    route: '/admin/studio/shows',
  },
  {
    id: 'content-packs',
    title: 'CONTENT PACKS',
    metric: '42',
    description: 'WEEKLY VIDEO + ARTICLE + CHECKLIST BUNDLES.',
    route: '/admin/studio/content-packs',
  },
  {
    id: 'ai-studio',
    title: 'AI STUDIO',
    metric: '121',
    description: 'GENERATE SCRIPTS, THUMBNAILS & CAMPAIGN ASSETS.',
    route: '/admin/studio/ai-studio',
  },
  {
    id: 'prompt-library',
    title: 'PROMPT LIBRARY',
    metric: '63',
    description: 'CURATED PROMPTS FOR PSA, LOUNGE & MARKETING.',
    route: '/admin/studio/prompt-library',
  },
  {
    id: 'asset-library',
    title: 'ASSET LIBRARY',
    metric: '214',
    description: 'THUMBNAILS, HEROES, B-ROLL & BRAND FILMS.',
    route: '/admin/studio/asset-library',
  },
  {
    id: 'publishing-queue',
    title: 'PUBLISHING QUEUE',
    metric: '6',
    description: 'READY TO SHIP — LOUNGE, EMAIL & SOCIAL.',
    route: '/admin/studio/publishing-queue',
  },
  {
    id: 'drafts',
    title: 'DRAFTS',
    metric: '18',
    description: 'WORK IN PROGRESS ACROSS ALL CHANNELS.',
    route: '/admin/studio/drafts',
  },
  {
    id: 'scheduled',
    title: 'SCHEDULED',
    metric: '6',
    description: 'LOCKED RELEASE DATES & PREMIERE SLOTS.',
    route: '/admin/studio/scheduled',
  },
  {
    id: 'analytics',
    title: 'ANALYTICS',
    metric: '—',
    description: 'VIEWS, COMPLETION & CONTENT PERFORMANCE.',
    route: '/admin/studio/analytics',
  },
  {
    id: 'calendar',
    title: 'CALENDAR',
    metric: '14',
    description: 'EDITORIAL CALENDAR & RELEASE RHYTHM.',
    route: '/admin/studio/calendar',
  },
  {
    id: 'recent-generations',
    title: 'RECENT GENERATIONS',
    metric: '12',
    description: 'LATEST AI OUTPUTS AWAITING REVIEW.',
    route: '/admin/studio/recent-generations',
  },
];

export function getAdminStudioSectionById(id: string): AdminStudioHubCard | undefined {
  return ADMIN_STUDIO_HUB_CARDS.find((card) => card.id === id);
}
