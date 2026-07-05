import type { DockCapability } from './types';

/**
 * Command Dock API — universal interaction layer registry.
 * Future Studio OS modules register capabilities here for Dock orchestration.
 */
export const DOCK_CAPABILITY_REGISTRY: readonly DockCapability[] = [
  {
    id: 'executive-timeline',
    moduleId: 'executive-timeline',
    label: 'Executive Timeline',
    commandTypes: ['scheduling', 'meetings', 'travel', 'personal-life'],
    examplePhrases: ['Move tomorrow\'s meeting.', 'Block Friday morning for strategy.'],
  },
  {
    id: 'concierge-routing',
    moduleId: 'concierge-routing',
    label: 'Intelligent Routing',
    commandTypes: ['executive-requests', 'approvals'],
    examplePhrases: ['Clear my afternoon.', 'Delay anything needing my approval.'],
  },
  {
    id: 'production-studio',
    moduleId: 'production-studio',
    label: 'Production Studio',
    commandTypes: ['production', 'creative-requests'],
    examplePhrases: ['Prepare launch assets.', 'Schedule a photoshoot.'],
  },
  {
    id: 'publishing',
    moduleId: 'publishing-queue',
    label: 'Publishing',
    commandTypes: ['publishing'],
    examplePhrases: ['Generate tomorrow\'s publishing schedule.', 'Review today\'s content.'],
  },
  {
    id: 'campaign-engine',
    moduleId: 'campaign-engine',
    label: 'Campaign Engine',
    commandTypes: ['campaigns'],
    examplePhrases: ['Delay Noir by two weeks.', 'Prepare for Black Friday.'],
  },
  {
    id: 'knowledge-hub',
    moduleId: 'knowledge-hub',
    label: 'Knowledge',
    commandTypes: ['knowledge-search'],
    examplePhrases: ['Search institutional memory for launch playbook.'],
  },
  {
    id: 'revenue',
    moduleId: 'revenue',
    label: 'Revenue',
    commandTypes: ['revenue', 'analytics'],
    examplePhrases: ['Summarize revenue pacing this month.'],
  },
] as const;

export function listDockCapabilitiesForTypes(types: string[]): DockCapability[] {
  return DOCK_CAPABILITY_REGISTRY.filter((c) =>
    c.commandTypes.some((t) => types.includes(t))
  );
}

export function getDockCapability(moduleId: string): DockCapability | undefined {
  return DOCK_CAPABILITY_REGISTRY.find((c) => c.moduleId === moduleId);
}
