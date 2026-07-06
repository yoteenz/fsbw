import type { ManualWhatsNewEntry } from './types';

/** Living changelog — new features auto-surface walkthrough prompts. */
export const STUDIO_MANUAL_WHATS_NEW: ManualWhatsNewEntry[] = [
  {
    id: 'whats-new-doc-sync',
    moduleId: 'knowledge-hub',
    version: '125.0',
    title: 'DOCUMENTATION SYNCHRONIZATION™',
    summary: 'M125 — 30+ systems registry, semantic search clusters, FAQ sync, Getting Started progression, contextual help.',
    highlightStepId: 'overview',
    releasedAt: '2026-07-06',
  },
  {
    id: 'whats-new-foundation-models',
    moduleId: 'studio-foundation-models',
    version: '124.0',
    title: 'STUDIO FOUNDATION MODELS™',
    summary: 'Long-term Studio-owned intelligence roadmap — Profession Models, hybrid intelligence, enterprise deployment.',
    highlightStepId: 'overview',
    releasedAt: '2026-07-06',
  },
  {
    id: 'whats-new-model-orchestrator',
    moduleId: 'model-orchestrator',
    version: '123.0',
    title: 'MODEL ORCHESTRATOR™',
    summary: 'AI Swap Engine — interchangeable providers, multi-model routing, failover, benchmarking.',
    highlightStepId: 'overview',
    releasedAt: '2026-07-06',
  },
  {
    id: 'whats-new-intelligence-architecture',
    moduleId: 'studio-intelligence-architecture',
    version: '122.0',
    title: 'STUDIO INTELLIGENCE™ ARCHITECTURE',
    summary: 'Knowledge Fabric, Context Engine, model-agnostic intelligence layer — org owns knowledge.',
    highlightStepId: 'overview',
    releasedAt: '2026-07-06',
  },
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
