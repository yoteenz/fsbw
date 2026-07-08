import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const legalContext: OrbContextDefinition = {
  contextId: 'legal',
  contextLabel: 'Legal & Governance™',
  primaryHeroObjectIds: [
    'knowledge-core-crystal',
    'blueprint-archive-scroll',
    'mission-control-console',
    'asset-registry-vault',
    'daily-brief-lens',
  ],
  secondaryHeroObjectIds: ['world-atlas-globe', 'production-board-slate'],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
  ],
  pathPatterns: [
    '/admin/studio/legal',
    '/admin/studio/professional-trust-framework',
    '/admin/studio/constitution-hall',
    '/admin/studio/permission-engine',
    '/admin/studio/policy-engine',
  ],
  flagshipIds: ['studio-command-center'],
};
