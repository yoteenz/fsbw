import type { OrbContextDefinition } from './types';
import { UNIVERSAL_ORB_CONTEXT_ACTIONS } from './command-center';

export const creativeDirectionContext: OrbContextDefinition = {
  contextId: 'creative-direction',
  contextLabel: 'Creative Direction Studio™',
  primaryHeroObjectIds: [
    'story-table-relic',
    'mood-wall-prism',
    'studio-foundry-crucible',
    'asset-registry-vault',
    'golden-review-marquee',
  ],
  secondaryHeroObjectIds: [
    'world-atlas-globe',
    'production-board-slate',
    'knowledge-core-crystal',
  ],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.worldAtlas,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.voice,
  ],
  pathPatterns: [
    '/admin/studio/department/creative-direction',
    '/admin/studio/creative-director',
    '/admin/studio/director-mode',
    '/admin/studio/content-brain',
    '/admin/studio/design-dna-canon',
    '/admin/studio/screening-room',
  ],
  flagshipIds: ['creative-direction-studio'],
};
