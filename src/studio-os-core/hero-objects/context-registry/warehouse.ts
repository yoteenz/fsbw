import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const warehouseContext: OrbContextDefinition = {
  contextId: 'warehouse',
  contextLabel: 'Warehouse Wing™',
  primaryHeroObjectIds: [
    'generation-bay-engine',
    'materials-library-tower',
    'blueprint-archive-scroll',
    'marketplace-pavilion-arch',
    'hero-object-vault',
  ],
  secondaryHeroObjectIds: [
    'asset-registry-vault',
    'studio-foundry-crucible',
    'world-atlas-globe',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
  ],
  pathPatterns: [
    '/admin/studio/studio-warehouse',
    '/admin/studio/asset-registry',
    '/admin/studio/asset-factory',
    '/admin/studio/asset-library',
    '/admin/studio/blueprint-manager',
    '/admin/studio/studio-foundry',
  ],
  flagshipIds: ['studio-warehouse', 'studio-archives', 'marketplace'],
};
