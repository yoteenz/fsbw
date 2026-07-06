import { TRUST_SCORE_SYSTEMS } from './constants';
import type { OrganizationQaHeadquartersProfile, TrustScoreEntry, TrustScoreSystemId } from './types';

const TRUST_META: Record<
  TrustScoreSystemId,
  { label: string; baseScore: number; trend: TrustScoreEntry['trend']; summary: string }
> = {
  'profession-brain': {
    label: 'Profession Brain™',
    baseScore: 91,
    trend: 'stable',
    summary: 'Brain instructions aligned · no contradicting rules detected.',
  },
  documentation: {
    label: 'Documentation',
    baseScore: 84,
    trend: 'rising',
    summary: '3 pages outdated · 12 revisions pending sync.',
  },
  'knowledge-library': {
    label: 'Knowledge Library',
    baseScore: 88,
    trend: 'stable',
    summary: 'Knowledge graph integrity strong · 2 orphaned nodes.',
  },
  marketplace: {
    label: 'Marketplace',
    baseScore: 86,
    trend: 'stable',
    summary: 'Listing quality within threshold · 1 submission under review.',
  },
  automations: {
    label: 'Automations',
    baseScore: 79,
    trend: 'declining',
    summary: '2 conflicting automations detected · requires inspector review.',
  },
  'expert-marketplace': {
    label: 'Expert Marketplace',
    baseScore: 92,
    trend: 'rising',
    summary: 'Expert response quality high · trust compliance active.',
  },
  'organization-health': {
    label: 'Organization Health',
    baseScore: 87,
    trend: 'stable',
    summary: 'Pulse signals healthy · onboarding completeness 94%.',
  },
  'studio-intelligence': {
    label: 'Studio Intelligence™',
    baseScore: 83,
    trend: 'stable',
    summary: 'Recommendations grounded · 1 low-confidence advisory flagged.',
  },
  workflows: {
    label: 'Workflows',
    baseScore: 90,
    trend: 'rising',
    summary: 'Process templates validated · simulation gate active.',
  },
  integrations: {
    label: 'Integrations',
    baseScore: 76,
    trend: 'declining',
    summary: '1 dead integration · OAuth token expiring in 14 days.',
  },
  security: {
    label: 'Security',
    baseScore: 94,
    trend: 'stable',
    summary: 'Permission conflicts: 0 critical · policy engine enforced.',
  },
  performance: {
    label: 'Performance',
    baseScore: 81,
    trend: 'stable',
    summary: '3 screens exceed 2s load threshold · optimization queued.',
  },
  'user-experience': {
    label: 'User Experience',
    baseScore: 85,
    trend: 'rising',
    summary: 'Journey completeness strong · 2 missing onboarding steps flagged.',
  },
};

function resolveStatus(scorePct: number): TrustScoreEntry['status'] {
  if (scorePct >= 90) return 'trusted';
  if (scorePct >= 75) return 'monitoring';
  return 'at-risk';
}

export function buildTrustScoreEntries(now: string): TrustScoreEntry[] {
  return TRUST_SCORE_SYSTEMS.map((systemId) => {
    const meta = TRUST_META[systemId];
    return {
      systemId,
      label: meta.label,
      scorePct: meta.baseScore,
      trend: meta.trend,
      lastValidatedAt: now,
      status: resolveStatus(meta.baseScore),
      summary: meta.summary,
    };
  });
}

export function computeOverallTrustScore(entries: TrustScoreEntry[]): number {
  const avg = entries.reduce((sum, e) => sum + e.scorePct, 0) / entries.length;
  return Math.round(avg);
}

export function computeTrustTrend(entries: TrustScoreEntry[]): OrganizationQaHeadquartersProfile['trustTrend'] {
  const declining = entries.filter((e) => e.trend === 'declining').length;
  const rising = entries.filter((e) => e.trend === 'rising').length;
  if (declining >= 3) return 'declining';
  if (rising >= 4) return 'rising';
  return 'stable';
}
