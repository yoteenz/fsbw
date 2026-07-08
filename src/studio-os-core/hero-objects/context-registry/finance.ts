import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const financeContext: OrbContextDefinition = {
  contextId: 'finance',
  contextLabel: 'Finance Command™',
  primaryHeroObjectIds: [
    'mission-control-console',
    'performance-wall-monolith',
    'daily-brief-lens',
    'knowledge-core-crystal',
    'production-board-slate',
  ],
  secondaryHeroObjectIds: ['world-atlas-globe', 'campaign-studio-beacon'],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
  ],
  pathPatterns: [
    '/admin/studio/finance',
    '/admin/headquarters/finance',
    '/admin/studio/business-model-engine',
    'finance-command',
  ],
  flagshipIds: ['studio-command-center', 'headquarters'],
};
