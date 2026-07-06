import { buildLegacySummary } from '../profession-brain/legacy-mode';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import type { LegacyContinuityAssessment, SuccessionDimensionScore } from './types';

export function assessLegacyContinuity(
  organizationId: string,
  dimensions: SuccessionDimensionScore[],
  overallReadiness: number
): LegacyContinuityAssessment {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);

  const delegation = dimensions.find((d) => d.id === 'leadership-delegation')?.scorePct ?? 0;
  const customer = dimensions.find((d) => d.id === 'customer-continuity')?.scorePct ?? 0;
  const process = dimensions.find((d) => d.id === 'critical-process-coverage')?.scorePct ?? 0;

  const continuityScorePct = Math.round((overallReadiness + delegation + customer + process) / 4);
  const canOperateWithoutFounder = continuityScorePct >= 65 && (brain?.brains.length ?? 0) >= 2;

  const philosophyPreserved = !!genome && genome.genomeCompletenessPct >= 50;
  const standardsPreserved = (brain?.overallMaturityPct ?? 0) >= 45;

  const summary = brain
    ? buildLegacySummary(brain)
    : 'Profession Brain not initialized — institutional knowledge at risk.';

  const legacyActions = [
    philosophyPreserved
      ? 'Organization Genome preserves founder philosophy and standards.'
      : 'Complete Organization Genome to preserve founder philosophy.',
    standardsPreserved
      ? 'Profession Brain captures operational standards beyond one person.'
      : 'Expand Profession Brain coverage for critical services.',
    canOperateWithoutFounder
      ? 'Organization trending toward independent operation with preserved legacy.'
      : 'Continue Succession Mode recommendations before founder unavailability.',
    'Protect the business from loss of irreplaceable knowledge — PRESERVE EXPERTISE. BUILD LEGACY.',
  ];

  return {
    canOperateWithoutFounder,
    continuityScorePct,
    philosophyPreserved,
    standardsPreserved,
    summary,
    legacyActions,
  };
}
