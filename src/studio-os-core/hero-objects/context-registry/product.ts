import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const productContext: OrbContextDefinition = {
  contextId: 'product',
  contextLabel: 'Product Studio™',
  primaryHeroObjectIds: [
    'production-board-slate',
    'story-table-relic',
    'blueprint-archive-scroll',
    'knowledge-core-crystal',
    'generation-bay-engine',
  ],
  secondaryHeroObjectIds: [
    'studio-foundry-crucible',
    'asset-registry-vault',
    'world-atlas-globe',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
  ],
  pathPatterns: [
    '/admin/studio/product',
    '/admin/headquarters/product',
    '/admin/studio/production-builder',
  ],
  flagshipIds: ['creative-direction-studio', 'headquarters'],
};
