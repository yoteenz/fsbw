import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const intelligenceContext: OrbContextDefinition = {
  contextId: 'intelligence',
  contextLabel: 'Intelligence Headquarters™',
  primaryHeroObjectIds: [
    'knowledge-core-crystal',
    'performance-wall-monolith',
    'daily-brief-lens',
    'mission-control-console',
    'blueprint-archive-scroll',
  ],
  secondaryHeroObjectIds: [
    'world-atlas-globe',
    'materials-library-tower',
    'campaign-studio-beacon',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.voice,
  ],
  pathPatterns: [
    '/admin/headquarters/intelligence',
    '/admin/studio/intelligence-engine',
    '/admin/studio/audience-brain',
    '/admin/studio/knowledge-hub',
    '/admin/studio/knowledge-core',
    '/admin/studio/memory-engine',
    '/admin/studio/profession-brain',
  ],
  flagshipIds: ['headquarters', 'studio-archives'],
};
