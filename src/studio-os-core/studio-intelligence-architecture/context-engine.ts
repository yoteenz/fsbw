import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationMemoryProfile } from '../memory-engine/store';
import { getOrganizationGenomeProfile } from '../organization-genome/store';
import { getOrganizationOperatingManualProfile } from '../organization-operating-manual/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { getOrganizationTrustFrameworkProfile } from '../professional-trust-framework/store';
import { getOrganizationExecutiveHistoryProfile } from '../executive-timeline/history-store';
import { getOrganizationRelationshipMemoryProfile } from '../relationship-memory/store';
import { CONTEXT_ENGINE_SOURCE_LABELS } from './constants';
import type { ContextBundleItem, ContextEngineSource } from './types';

function bundleItem(
  source: ContextEngineSource,
  summary: string,
  relevancePct: number,
  trustPct: number,
  included = true
): ContextBundleItem {
  return {
    source,
    sourceLabel: CONTEXT_ENGINE_SOURCE_LABELS[source],
    summary,
    relevancePct,
    trustPct,
    included,
  };
}

/** Assemble trusted context before any AI response — organization knowledge first */
export function assembleTrustedContext(
  organizationId: string,
  companyName: string
): ContextBundleItem[] {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const genome = getOrganizationGenomeProfile(organizationId);
  const memory = getOrganizationMemoryProfile(organizationId);
  const manual = getOrganizationOperatingManualProfile(organizationId);
  const confidence = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const trust = getOrganizationTrustFrameworkProfile(organizationId);
  const timeline = getOrganizationExecutiveHistoryProfile(organizationId);
  const relationships = getOrganizationRelationshipMemoryProfile(organizationId);

  const brainSummary = brain
    ? `${brain.brains?.length ?? 0} Profession Brains™ · ${brain.overallMaturityPct ?? 85}% maturity`
    : 'Profession Brain™ expertise surfaces loading';
  const genomeSummary = genome
    ? `Mission: ${(genome.identityCore.mission ?? 'Organizational identity').slice(0, 80)}`
    : 'Organization Genome™ identity layer';
  const memorySummary = memory
    ? `${memory.records?.length ?? 0} organizational memories · proven outcomes preserved`
    : 'Memory Engine™ recall available';
  const policySummary = manual
    ? `${manual.documents?.length ?? 0} operating manual sections · approvals · SOPs`
    : 'Operating Manual™ policies indexed';
  const customerSummary = relationships
    ? `${relationships.organizationalRelationships?.length ?? 0} relationship patterns · communication preferences`
    : 'Customer history from Relationship Memory™';
  const timelineSummary = timeline
    ? `${timeline.events?.length ?? 0} timeline events · current organizational chapter`
    : 'Executive Timeline™ current context';
  const confidenceSummary = confidence
    ? `Overall knowledge confidence ${confidence.overallConfidenceScore ?? 82}% · transparent trust`
    : 'Knowledge Confidence™ quality gates active';
  const trustSummary = trust
    ? `Professional scope declared · review thresholds enforced`
    : 'Professional Trust Framework™ scope applied';

  return [
    bundleItem('active-organization', `${companyName} — active org boundary · all modules scoped`, 100, 98),
    bundleItem('profession-brain', brainSummary, 96, brain?.overallMaturityPct ?? 85),
    bundleItem('organization-genome', genomeSummary, 94, 93),
    bundleItem('relevant-memories', memorySummary, 88, 87),
    bundleItem('relevant-documents', `${manual?.searchableQa?.length ?? 8} searchable topics indexed`, 85, 90),
    bundleItem('relevant-policies', policySummary, 90, 91),
    bundleItem('customer-history', customerSummary, 78, 84),
    bundleItem('current-timeline', timelineSummary, 82, 88),
    bundleItem('knowledge-confidence', confidenceSummary, 92, confidence?.overallConfidenceScore ?? 82),
    bundleItem('professional-trust-framework', trustSummary, 95, 94),
  ];
}

export function summarizeContextEngine(bundle: ContextBundleItem[]): string {
  const included = bundle.filter((b) => b.included);
  const avgRelevance = Math.round(
    included.reduce((s, b) => s + b.relevancePct, 0) / Math.max(1, included.length)
  );
  return `Context Engine — ${included.length}/${bundle.length} trusted sources assembled (${avgRelevance}% avg relevance). What does this organization know? — before what does the model think?`;
}

export function countReadyContextSources(bundle: ContextBundleItem[]): number {
  return bundle.filter((b) => b.included && b.trustPct >= 80).length;
}
