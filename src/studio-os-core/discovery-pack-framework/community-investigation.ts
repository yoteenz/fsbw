/**
 * Community Investigation™ — founders uncover discoveries together.
 * Clues, Atlas breadcrumbs, collaborative challenges — scaffold only.
 */

import type { PublicInvestigationSnapshot } from './types';

export type InvestigationThreadStatus = 'dormant' | 'active' | 'advancing' | 'resolved';

export type InvestigationThreadDefinition = {
  id: string;
  publicTitle: string;
  publicDescription: string;
  status: InvestigationThreadStatus;
  clueTypes: ('atlas' | 'museum' | 'world-graph' | 'blueprint' | 'collaboration')[];
  /** Progress 0–100 — public only */
  communityProgressPct: number;
  publicHint: string;
};

export const INVESTIGATION_THREAD_CATALOG: InvestigationThreadDefinition[] = [
  {
    id: 'inv-atlas-anomaly',
    publicTitle: 'Atlas Anomaly',
    publicDescription: 'Cartographers report coordinates that resolve to empty space — founders are investigating.',
    status: 'active',
    clueTypes: ['atlas', 'world-graph'],
    communityProgressPct: 34,
    publicHint: 'Follow the Innovation District edge on the Atlas — three breadcrumbs align at dusk coordinates.',
  },
  {
    id: 'inv-lost-blueprints',
    publicTitle: 'Recovered Blueprint Fragments',
    publicDescription: 'Partial Blueprint lineage records suggest workflows older than the campus.',
    status: 'advancing',
    clueTypes: ['blueprint', 'museum'],
    communityProgressPct: 58,
    publicHint: 'Cross-reference Blueprint Archive™ forks with Museum exhibit timestamps from 2024.',
  },
  {
    id: 'inv-orb-whispers',
    publicTitle: 'Orb Whispers',
    publicDescription: 'Orb has spoken lines no founder prompted — the community is decoding them.',
    status: 'dormant',
    clueTypes: ['collaboration', 'world-graph'],
    communityProgressPct: 12,
    publicHint: 'Whispers intensify when collaboration capital exceeds 60 — record every Orb line.',
  },
  {
    id: 'inv-forgotten-innovation',
    publicTitle: 'Forgotten Innovation Trail',
    publicDescription: 'Historical breadcrumbs in the World Graph™ may lead to sealed Prototype Vault chambers.',
    status: 'active',
    clueTypes: ['world-graph', 'blueprint', 'atlas'],
    communityProgressPct: 41,
    publicHint: 'Trace innovation event nodes backward from the Living Civilization layer.',
  },
];

export type { PublicInvestigationSnapshot };

export function evaluateCommunityInvestigation(input: {
  collaborationCapital: number;
  knowledgeCapital: number;
  civilizationHealth: number;
}): PublicInvestigationSnapshot {
  const threads = INVESTIGATION_THREAD_CATALOG.map((thread) => {
    let effectiveStatus = thread.status;
    let progress = thread.communityProgressPct;

    if (thread.id === 'inv-orb-whispers' && input.collaborationCapital >= 45) {
      effectiveStatus = 'active';
      progress = Math.min(100, progress + Math.round(input.collaborationCapital * 0.4));
    }
    if (thread.id === 'inv-lost-blueprints' && input.knowledgeCapital >= 50) {
      progress = Math.min(100, progress + Math.round(input.knowledgeCapital * 0.3));
    }
    if (thread.id === 'inv-forgotten-innovation' && input.civilizationHealth >= 55) {
      effectiveStatus = 'advancing';
    }

    return { ...thread, status: effectiveStatus, communityProgressPct: progress };
  });

  const active = threads.filter((t) => t.status === 'active' || t.status === 'advancing');
  const advancing = threads.filter((t) => t.status === 'advancing');

  const primary =
    active.sort((a, b) => b.communityProgressPct - a.communityProgressPct)[0] ?? null;

  return {
    activeCount: active.length,
    advancingCount: advancing.length,
    primaryThread: primary
      ? {
          publicTitle: primary.publicTitle,
          publicDescription: primary.publicDescription,
          publicHint: primary.publicHint,
          communityProgressPct: primary.communityProgressPct,
        }
      : null,
    ambientLine:
      active.length > 0
        ? 'The community investigates together — discoveries may emerge from collaboration, not announcements.'
        : null,
  };
}
