import { evaluateBrandIntelligence } from '../../brand-discovery-engine/engines/brand-intelligence-layer';
import { getAudienceDna } from '../../studio-intelligence-layer/registries/intelligence-registries';
import type { XniNarrativeBlueprint } from '../../narrative-intelligence/types';
import type { XpsBlockingIssue } from '../types';
import type { XpsDemoBrandId } from '../constants';

/** Creative Executive™ — strategic production mandate */
export function evaluateCreativeExecutiveFit(
  blueprint: XniNarrativeBlueprint,
  goal: string
): {
  approved: boolean;
  mandate: string;
  risks: string[];
  blockingIssues: XpsBlockingIssue[];
} {
  const brandIntel = evaluateBrandIntelligence({
    brandId: blueprint.brandId,
    artifactType: 'campaign-card',
    artifactSummary: `${blueprint.topic} — ${goal}`,
  });
  const audience = getAudienceDna(blueprint.companyId as XpsDemoBrandId);
  const brandScore = brandIntel.consistency.overallScore;

  const risks: string[] = [];
  const blockingIssues: XpsBlockingIssue[] = [];

  if (blueprint.status !== 'approved') {
    risks.push('Narrative Blueprint not yet approved');
    blockingIssues.push({
      issueId: 'ce-blueprint',
      departmentId: 'creative-executive',
      severity: 'blocker',
      summary: 'Narrative Blueprint™ must be approved before production.',
      recommendation: 'Submit and approve blueprint in Narrative Intelligence™.',
    });
  }

  if (brandScore < 70) {
    risks.push('Brand alignment below executive threshold');
  }

  return {
    approved: blueprint.status === 'approved' && brandScore >= 70,
    mandate: `Executive mandate: ${goal} for ${audience?.segmentName ?? blueprint.audience} — ${brandIntel.rationale[0] ?? 'Strategic fit evaluated.'}`,
    risks,
    blockingIssues,
  };
}
