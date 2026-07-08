import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const marketingContext: OrbContextDefinition = {
  contextId: 'marketing',
  contextLabel: 'Marketing HQ™',
  primaryHeroObjectIds: [
    'campaign-studio-beacon',
    'launch-theater-marquee',
    'social-media-lab-signal',
    'brand-partnerships-handshake',
    'performance-wall-monolith',
  ],
  secondaryHeroObjectIds: [
    'daily-brief-lens',
    'world-atlas-globe',
    'knowledge-core-crystal',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
    {
      id: 'daily-brief',
      label: 'Daily Brief',
      surface: 'daily-brief',
      relevanceRank: 5,
      heroObjectId: 'daily-brief-lens',
    },
    UNIVERSAL_ORB_CONTEXT_ACTIONS.voice,
  ],
  pathPatterns: [
    '/admin/headquarters/marketing',
    '/admin/studio/campaign-engine',
    '/admin/studio/brand-architect',
    '/admin/studio/shows',
    '/admin/studio/content-packs',
    '/admin/studio/social-accounts',
  ],
  flagshipIds: ['headquarters'],
};
