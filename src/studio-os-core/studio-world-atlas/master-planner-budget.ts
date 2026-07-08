import type {
  AtlasCreativeBudgetEstimate,
  AtlasMasterPlanReservation,
  MasterPlanLandCategory,
} from './types';

const BASE_BY_CATEGORY: Record<MasterPlanLandCategory, AtlasCreativeBudgetEstimate> = {
  headquarters: {
    generationCost: '$$$',
    constructionCost: '$$$',
    budgetImpactPct: 18,
    reuseOpportunities: 'Scene Stack™ shells · Command Center wings',
    projectedEquity: '+14',
    marketplaceValue: 'High — flagship visibility',
  },
  district: {
    generationCost: '$$',
    constructionCost: '$$',
    budgetImpactPct: 12,
    reuseOpportunities: 'District portals · shared lighting rigs',
    projectedEquity: '+8',
    marketplaceValue: 'Medium',
  },
  campus: {
    generationCost: '$$',
    constructionCost: '$$',
    budgetImpactPct: 14,
    reuseOpportunities: 'Campus roads · genome accents',
    projectedEquity: '+10',
  },
  pavilion: {
    generationCost: '$',
    constructionCost: '$',
    budgetImpactPct: 6,
    reuseOpportunities: 'Archives assets · marketplace tiles',
    projectedEquity: '+5',
    marketplaceValue: 'Commerce uplift',
  },
  academy: {
    generationCost: '$$',
    constructionCost: '$',
    budgetImpactPct: 8,
    reuseOpportunities: 'Institute modules · training shells',
    projectedEquity: '+6',
  },
  'experience-center': {
    generationCost: '$$',
    constructionCost: '$$',
    budgetImpactPct: 10,
    reuseOpportunities: 'Experience Intelligence™ templates',
    projectedEquity: '+7',
  },
  innovation: {
    generationCost: '$$',
    constructionCost: '$$',
    budgetImpactPct: 11,
    reuseOpportunities: 'Innovation monuments · expedition assets',
    projectedEquity: '+9',
    marketplaceValue: 'Discovery premium',
  },
};

export function estimatePlanBudget(plan: AtlasMasterPlanReservation): AtlasCreativeBudgetEstimate {
  const base = BASE_BY_CATEGORY[plan.category ?? 'district'];
  const amenityBump = (plan.amenities?.length ?? 0) * 2;
  return {
    ...base,
    budgetImpactPct: Math.min(35, base.budgetImpactPct + amenityBump),
    projectedEquity: plan.isConcept
      ? '— (concept only)'
      : `+${parseInt(base.projectedEquity.replace(/\D/g, ''), 10) + amenityBump}`,
  };
}
