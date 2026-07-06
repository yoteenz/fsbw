import { synthesizeExecutiveBriefing } from '../executive-council/briefing-engine';
import { generateExecutiveContributions } from '../executive-council/collaborative-meeting';
import { ensureOrganizationExecutiveCouncilProfile } from '../executive-council/org-store';
import type { SimulationCouncilReview } from './types';

export function buildCouncilReviewForSimulation(
  organizationId: string,
  query: string,
  _confidenceScore: number
): SimulationCouncilReview {
  const councilProfile = ensureOrganizationExecutiveCouncilProfile(organizationId);
  const contributions = generateExecutiveContributions(
    organizationId,
    `[Business Simulation Lab] ${query}`,
    councilProfile.digitalExecutives
  );
  const briefing = synthesizeExecutiveBriefing(query, contributions);
  const avgConfidence =
    briefing.confidenceLevels.length > 0
      ? Math.round(
          briefing.confidenceLevels.reduce((s, c) => s + c.confidencePct, 0) /
            briefing.confidenceLevels.length
        )
      : 75;

  return {
    reviewedAt: new Date().toISOString(),
    participants: contributions.map((c) => c.executiveName),
    summary: briefing.summary.slice(0, 280),
    recommendations: briefing.recommendations.slice(0, 4),
    risks: briefing.risks.slice(0, 4),
    confidencePct: avgConfidence,
    briefing,
  };
}
