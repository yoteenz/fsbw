import type { AtlasConstructionJob, AtlasConstructionPhase, AtlasNode } from './types';

export const CONSTRUCTION_PHASE_ORDER: AtlasConstructionPhase[] = [
  'reserved',
  'fencing',
  'blueprint-hologram',
  'foundation',
  'steel-structure',
  'glass-install',
  'lighting-active',
  'opening-ceremony',
  'complete',
];

export function nextConstructionPhase(phase: AtlasConstructionPhase): AtlasConstructionPhase {
  const idx = CONSTRUCTION_PHASE_ORDER.indexOf(phase);
  if (idx < 0 || idx >= CONSTRUCTION_PHASE_ORDER.length - 1) return 'complete';
  return CONSTRUCTION_PHASE_ORDER[idx + 1]!;
}

export function constructionExtrusionScale(phase: AtlasConstructionPhase | null | undefined): number {
  if (!phase || phase === 'complete') return 1;
  const idx = CONSTRUCTION_PHASE_ORDER.indexOf(phase);
  return 0.15 + (idx / (CONSTRUCTION_PHASE_ORDER.length - 1)) * 0.85;
}

export function resolveConstructionPhaseForNode(
  node: AtlasNode,
  jobs: AtlasConstructionJob[]
): AtlasConstructionPhase | null {
  const job = jobs.find((j) => j.nodeId === node.id);
  if (job) return job.phase;
  if (node.id === 'future-districts' || node.migrationStatus === 'coming-soon') return 'reserved';
  return null;
}

export function isUnderConstruction(phase: AtlasConstructionPhase | null | undefined): boolean {
  return !!phase && phase !== 'complete';
}

export function defaultDemoConstructions(): AtlasConstructionJob[] {
  return [
    {
      nodeId: 'future-districts',
      displayName: 'Future Districts™',
      phase: 'blueprint-hologram',
      startedAt: new Date(Date.now() - 86_400_000 * 3).toISOString(),
      reason: 'Master plan reserved land for next headquarters expansion.',
      enabledByBlueprint: 'Marketing Headquarters Blueprint™',
      unlockedByExpedition: 'Brand Expansion Expedition™',
    },
  ];
}

export function advanceConstructionJob(job: AtlasConstructionJob): AtlasConstructionJob {
  const next = nextConstructionPhase(job.phase);
  return {
    ...job,
    phase: next,
  };
}
