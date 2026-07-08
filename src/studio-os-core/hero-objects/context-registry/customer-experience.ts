import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const customerExperienceContext: OrbContextDefinition = {
  contextId: 'customer-experience',
  contextLabel: 'Customer Experience Studio™',
  primaryHeroObjectIds: [
    'brand-partnerships-handshake',
    'performance-wall-monolith',
    'social-media-lab-signal',
    'daily-brief-lens',
    'knowledge-core-crystal',
  ],
  secondaryHeroObjectIds: [
    'campaign-studio-beacon',
    'world-atlas-globe',
    'launch-theater-marquee',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.voice,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
  ],
  pathPatterns: [
    '/admin/studio/customer-experience',
    '/admin/studio/chief-experience-officer',
    '/admin/headquarters/customer-experience',
    '/admin/studio/concierge',
    '/admin/studio/arrival-experience',
  ],
  flagshipIds: ['headquarters', 'expedition-hub'],
};
