import { evaluateBrandIntelligence } from '../../brand-discovery-engine/engines/brand-intelligence-layer';
import { getNarrativeBlueprint } from '../../narrative-intelligence/engines/narrative-blueprint-generator';
import { getProductionGenomeForBrand } from '../../narrative-intelligence/engines/production-genome-registry';
import { evaluateExecutiveIntelligence } from '../../studio-intelligence-layer/engines/executive-intelligence-engine';
import { getAudienceDna } from '../../studio-intelligence-layer/registries/intelligence-registries';
import { scoreTasteFit } from '../../studio-intelligence-layer/engines/taste-learning-engine';
import { getProductionPackage } from '../../studio-production-system/engines/production-coordinator';
import {
  XCOS_EXECUTIVE_IDS,
  XCOS_EXECUTIVE_LABELS,
  type XcosDemoBrandId,
  type XcosExecutiveId,
} from '../constants';
import type { XcosExecutiveBrief } from '../types';

function executiveDomainEvidence(
  executiveId: XcosExecutiveId,
  brandId: XcosDemoBrandId,
  topic: string,
  goal: string
): string[] {
  const brandIntel = evaluateBrandIntelligence({
    brandId,
    artifactType: 'campaign-card',
    artifactSummary: `${topic} — ${goal}`,
  });
  const execIntel = evaluateExecutiveIntelligence({ companyId: brandId, mission: goal, artifactSummary: topic });
  const audience = getAudienceDna(brandId);
  const taste = scoreTasteFit(brandId, topic);
  const genome = getProductionGenomeForBrand(brandId);

  const evidenceByExecutive: Record<XcosExecutiveId, string[]> = {
    'chief-creative-officer': [`Taste fit ${taste}/100`, 'Creative Genome + founder preference review'],
    'executive-producer': ['Studio Production System capacity', 'Department timeline feasibility'],
    'creative-strategist': [execIntel.recommendedAction, 'Company Genome strategic alignment'],
    'narrative-director': [genome ? `Production Genome: ${genome.genomeId}` : 'Production Genome pending', 'Narrative continuity check'],
    'brand-director': [`Brand consistency ${brandIntel.consistency.overallScore}/100`, brandIntel.rationale[0] ?? 'Brand DNA evaluated'],
    'audience-director': [audience ? `Audience: ${audience.segmentName}` : 'Audience DNA', execIntel.audienceImpact],
    'experience-director': ['Experience Engine / Runtime environment fit', 'HQ scene compatibility'],
    'production-director': ['Production Package gates', 'Department orchestration readiness'],
    'performance-director': ['Predicted engagement and conversion', 'Historical performance patterns'],
    'knowledge-director': ['Creative Memory retrieval', 'Institute of Knowledge linkage'],
  };

  return evidenceByExecutive[executiveId];
}

/** Executive Creative Board™ — permanent domain owners with evidence-based briefs */
export function buildExecutiveBriefs(
  brandId: XcosDemoBrandId,
  topic: string,
  goal: string,
  audience: string,
  blueprintId?: string
): XcosExecutiveBrief[] {
  const blueprint = blueprintId ? getNarrativeBlueprint(blueprintId) : undefined;

  return XCOS_EXECUTIVE_IDS.map((executiveId) => {
    const evidence = executiveDomainEvidence(executiveId, brandId, topic, goal);
    const baseConfidence = executiveId === 'knowledge-director' ? 88 : 72 + (executiveId.length % 12);

    const recommendations: Record<XcosExecutiveId, string> = {
      'chief-creative-officer': `Preserve differentiated creative taste for "${topic}"`,
      'executive-producer': `Sequence production resources for ${goal}`,
      'creative-strategist': `Position initiative within ${brandId} strategic roadmap`,
      'narrative-director': blueprint
        ? `Advance ${blueprint.narrativeType} narrative with approved arc structure`
        : 'Generate Narrative Blueprint before production authorization',
      'brand-director': `Maintain brand signature while pursuing ${goal}`,
      'audience-director': `Address ${audience} readiness and objections`,
      'experience-director': `Route through branded HQ / runtime environment`,
      'production-director': `Assign departments and enforce gate discipline`,
      'performance-director': `Forecast outcomes and define success metrics`,
      'knowledge-director': `Archive decisions and link to Institute of Knowledge™`,
    };

    const risks: Record<XcosExecutiveId, string[]> = {
      'chief-creative-officer': ['Generic creative direction', 'Founder taste drift'],
      'executive-producer': ['Resource overload', 'Timeline compression'],
      'creative-strategist': ['Misaligned initiative priority'],
      'narrative-director': blueprint?.status !== 'approved' ? ['Blueprint not approved'] : [],
      'brand-director': ['Brand drift', 'Inconsistent visual language'],
      'audience-director': ['Audience not ready', 'Unclear value proposition'],
      'experience-director': ['Runtime environment mismatch'],
      'production-director': ['Gate bypass', 'Department blockers'],
      'performance-director': ['Overestimated reach', 'Weak CTA conversion'],
      'knowledge-director': ['Institutional memory loss'],
    };

    return {
      executiveId,
      label: XCOS_EXECUTIVE_LABELS[executiveId],
      recommendation: recommendations[executiveId],
      evidence,
      risks: risks[executiveId],
      opportunities: [`Advance ${goal} for ${audience}`],
      confidence: Math.min(95, baseConfidence + (blueprint?.status === 'approved' ? 8 : 0)),
    };
  });
}

export function listBoardExecutives(): { executiveId: XcosExecutiveId; label: string }[] {
  return XCOS_EXECUTIVE_IDS.map((id) => ({ executiveId: id, label: XCOS_EXECUTIVE_LABELS[id] }));
}

export function getExecutiveStatusForPackage(packageId: string): { executiveId: XcosExecutiveId; label: string; status: string }[] {
  const pkg = getProductionPackage(packageId);
  if (!pkg) {
    return listBoardExecutives().map((e) => ({ ...e, status: 'idle' }));
  }
  const blockers = pkg.blockingIssues.filter((i) => i.severity === 'blocker').length;
  return listBoardExecutives().map((e) => ({
    ...e,
    status: blockers > 0 && e.executiveId === 'production-director' ? 'blocked' : 'active',
  }));
}
