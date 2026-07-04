import type { ManualWhatsNewEntry } from './types';

/** Living changelog — new features auto-surface walkthrough prompts. */
export const STUDIO_MANUAL_WHATS_NEW: ManualWhatsNewEntry[] = [
  {
    id: 'whats-new-knowledge-graph',
    moduleId: 'knowledge-hub',
    version: '24.1',
    title: 'KNOWLEDGE GRAPH',
    summary: 'ⓘ now opens Knowledge Graph entry — connected modules, workflow maps, and written manual links.',
    highlightStepId: 'overview',
    releasedAt: '2026-07-04',
  },
  {
    id: 'whats-new-asset-factory',
    moduleId: 'asset-factory',
    version: '19.0',
    title: 'ASSET FACTORY',
    summary: 'Manufacturing department with factory floor, queue manager, and nine-department pipeline.',
    highlightStepId: 'generation-pipeline',
    releasedAt: '2026-06-01',
  },
  {
    id: 'whats-new-blueprint-manager',
    moduleId: 'blueprint-manager',
    version: '18.5',
    title: 'BLUEPRINT MANAGER',
    summary: 'Specification library with approval workflow before any factory run.',
    highlightStepId: 'overview',
    releasedAt: '2026-05-28',
  },
];

export function getWhatsNewForModule(moduleId: string): ManualWhatsNewEntry | undefined {
  return STUDIO_MANUAL_WHATS_NEW.find((e) => e.moduleId === moduleId);
}

export function getRecentWhatsNew(limit = 5): ManualWhatsNewEntry[] {
  return [...STUDIO_MANUAL_WHATS_NEW]
    .sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
    .slice(0, limit);
}
