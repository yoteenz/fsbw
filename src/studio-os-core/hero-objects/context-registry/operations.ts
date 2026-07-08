import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const operationsContext: OrbContextDefinition = {
  contextId: 'operations',
  contextLabel: 'Operations Headquarters™',
  primaryHeroObjectIds: [
    'production-board-slate',
    'mission-control-console',
    'generation-bay-engine',
    'materials-library-tower',
    'knowledge-core-crystal',
  ],
  secondaryHeroObjectIds: [
    'daily-brief-lens',
    'world-atlas-globe',
    'blueprint-archive-scroll',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.voice,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
  ],
  pathPatterns: [
    '/admin/headquarters/operations',
    '/admin/studio/production',
    '/admin/studio/work-orchestration',
    '/admin/studio/ai-production-engine',
    '/admin/studio/talent-agency',
    '/admin/studio/casting',
  ],
  flagshipIds: ['headquarters', 'studio-command-center'],
};
