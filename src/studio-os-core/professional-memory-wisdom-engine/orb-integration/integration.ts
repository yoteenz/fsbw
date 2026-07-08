import type { OrbRecommendation } from '../../orb-recommendations/types';
import { ensureProfessionalMemoryStore, upsertProfessionalMemoryStore } from '../professional-memory/store';
import { buildOrbMemoryRecalls, markOrbMemoriesSurfaced } from './generator';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Optional Orb recommendations from meaningful professional memories — never repetitive. */
export function buildProfessionalMemoryOrbRecommendations(
  organizationId: string,
  learnerId: string
): OrbRecommendation[] {
  const store = ensureProfessionalMemoryStore(organizationId, learnerId);
  const recalls = buildOrbMemoryRecalls(store);
  if (!recalls.length) return [];

  upsertProfessionalMemoryStore(
    markOrbMemoriesSurfaced(
      store,
      recalls.map((recall) => recall.memoryId)
    )
  );

  return recalls.map((recall) => ({
    id: uid('orb-wisdom-rec'),
    title: recall.line,
    reasoning: 'Optional professional memory — surfaced only when context adds value.',
    category: 'knowledge-refresh',
    priority: recall.priority === 'high' ? 'medium' : 'low',
    estimatedImpact: 'moderate',
    estimatedMinutes: 3,
    estimatedCost: '$0 — optional memory reflection',
    potentialSavings: null,
    departmentsAffected: ['Career Worlds', 'Studio Institute'],
    creativeEquityGained: '+10 Wisdom Equity',
    confidenceScore: 86,
    targetPath: '/admin/studio/career-worlds',
    actionable: false,
  }));
}

export function readTopProfessionalMemoryAmbientLine(
  organizationId: string,
  learnerId: string
): string | null {
  const store = ensureProfessionalMemoryStore(organizationId, learnerId);
  return buildOrbMemoryRecalls(store)[0]?.line ?? null;
}
