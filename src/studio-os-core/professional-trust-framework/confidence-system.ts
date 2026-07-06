import type { OrganizationProfessionBrain } from '../profession-brain/types';
import type { BrainConfidenceProfile, ConfidenceLevel, ProfessionalReviewStatus } from './types';
import { REGULATED_INDUSTRY_IDS } from './constants';

function resolveConfidenceLevel(maturityPct: number, entryCount: number): ConfidenceLevel {
  const score = maturityPct + Math.min(entryCount * 2, 20);
  if (score >= 85) return 'very-high';
  if (score >= 65) return 'high';
  if (score >= 40) return 'moderate';
  return 'low';
}

function resolveReviewStatus(
  brainDefinitionId: string,
  industryId: string,
  confidence: ConfidenceLevel
): ProfessionalReviewStatus {
  const regulatedBrain =
    brainDefinitionId === 'fuel-tax' ||
    brainDefinitionId === 'bookkeeping' ||
    brainDefinitionId === 'legal-intake';
  const regulatedIndustry = REGULATED_INDUSTRY_IDS.includes(
    industryId as (typeof REGULATED_INDUSTRY_IDS)[number]
  );

  if (brainDefinitionId === 'legal-intake' || (regulatedBrain && regulatedIndustry)) {
    return 'required-before-submission';
  }
  if (regulatedIndustry || brainDefinitionId === 'medical-scheduling') {
    return 'required-before-action';
  }
  if (confidence === 'moderate') return 'recommended';
  return 'none';
}

const PROFESSION_MAP: Partial<Record<string, BrainConfidenceProfile['regulatedProfession']>> = {
  'fuel-tax': 'taxes',
  bookkeeping: 'accounting',
  'legal-intake': 'law',
  'medical-scheduling': 'healthcare',
  permit: 'construction',
  hvac: 'engineering',
};

export function buildBrainConfidenceProfile(
  brain: OrganizationProfessionBrain,
  industryId: string
): BrainConfidenceProfile {
  const knowledgeCoveragePct = Math.min(
    100,
    Math.round(brain.maturityPct * 0.6 + brain.knowledgeEntries.length * 4)
  );
  const confidenceLevel = resolveConfidenceLevel(brain.maturityPct, brain.knowledgeEntries.length);

  return {
    brainId: brain.id,
    brainLabel: brain.label,
    knowledgeCoveragePct,
    confidenceLevel,
    professionalReviewStatus: resolveReviewStatus(brain.definitionId, industryId, confidenceLevel),
    conciergeId: brain.conciergeId,
    regulatedProfession: PROFESSION_MAP[brain.definitionId],
  };
}
