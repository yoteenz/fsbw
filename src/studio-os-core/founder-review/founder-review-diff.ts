/**
 * Founder Review™ — live diff (changed regions only).
 */
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const FOUNDER_REVIEW_DIFF_VERSION = 'founder-review-diff.v1';

export type FounderReviewDiffRegion = {
  regionId: string;
  label: string;
  status: 'changed' | 'unchanged';
  category: 'architecture' | 'hero' | 'furniture' | 'lighting' | 'materials' | 'decor';
};

export type FounderReviewDiff = {
  diffVersion: typeof FOUNDER_REVIEW_DIFF_VERSION;
  planId: string;
  hasChanges: boolean;
  regions: FounderReviewDiffRegion[];
};

const REGION_CATALOG: Array<{ id: string; label: string; category: FounderReviewDiffRegion['category'] }> = [
  { id: 'reception-desk', label: 'Reception Desk', category: 'hero' },
  { id: 'crystal-sculpture', label: 'Crystal Sculpture', category: 'hero' },
  { id: 'lighting', label: 'Lighting', category: 'lighting' },
  { id: 'walls', label: 'Walls', category: 'architecture' },
  { id: 'materials', label: 'Materials', category: 'materials' },
  { id: 'seating', label: 'Seating', category: 'furniture' },
  { id: 'glass', label: 'Glass', category: 'decor' },
  { id: 'plants', label: 'Plants', category: 'decor' },
];

export function buildFounderReviewDiff(input: {
  plan: ConstructionPlan;
  changedRegionIds?: string[];
  variantChanged?: boolean;
}): FounderReviewDiff {
  const changed = new Set(input.changedRegionIds ?? []);
  if (input.variantChanged) {
    changed.add('lighting');
    changed.add('materials');
  }

  const regions = REGION_CATALOG.map((r) => ({
    regionId: r.id,
    label: r.label,
    category: r.category,
    status: changed.has(r.id) ? ('changed' as const) : ('unchanged' as const),
  }));

  return {
    diffVersion: FOUNDER_REVIEW_DIFF_VERSION,
    planId: input.plan.planId,
    hasChanges: regions.some((r) => r.status === 'changed'),
    regions,
  };
}
