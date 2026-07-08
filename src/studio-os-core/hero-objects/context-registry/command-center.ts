import type { OrbContextAction, OrbContextDefinition } from './types';

/** Universal founder surfaces — departments opt in via contextActions. */
export const UNIVERSAL_ORB_CONTEXT_ACTIONS = {
  pageGuide: {
    id: 'page-guide',
    label: 'Page Guide',
    surface: 'page-guide',
    relevanceRank: 8,
    heroObjectId: undefined,
  } satisfies OrbContextAction,
  voice: {
    id: 'voice',
    label: 'Voice Mode',
    surface: 'voice',
    relevanceRank: 9,
    heroObjectId: undefined,
  } satisfies OrbContextAction,
  commandDock: {
    id: 'command-dock',
    label: 'Command Dock',
    surface: 'command-dock',
    relevanceRank: 7,
    heroObjectId: undefined,
  } satisfies OrbContextAction,
  worldAtlas: {
    id: 'world-atlas',
    label: 'World Atlas',
    surface: 'world-atlas',
    relevanceRank: 6,
    heroObjectId: 'world-atlas-globe',
  } satisfies OrbContextAction,
} as const;

export const commandCenterContext: OrbContextDefinition = {
  contextId: 'command-center',
  contextLabel: 'Command Center™',
  primaryHeroObjectIds: [
    'world-atlas-globe',
    'mission-control-console',
    'daily-brief-lens',
    'knowledge-core-crystal',
    'production-board-slate',
  ],
  secondaryHeroObjectIds: ['hero-object-vault'],
  contextActions: [
    UNIVERSAL_ORB_CONTEXT_ACTIONS.commandDock,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.pageGuide,
    UNIVERSAL_ORB_CONTEXT_ACTIONS.voice,
  ],
  pathPatterns: [
    '/admin/studio/overview',
    '/admin/studio/chief-of-staff',
    '/admin/studio/executive',
    '/admin/studio/world-atlas',
    '/admin/studio/production-orchestrator',
    '/admin/studio/governance',
    '/admin/studio/analytics',
  ],
  flagshipIds: ['studio-command-center', 'expedition-hub'],
};
