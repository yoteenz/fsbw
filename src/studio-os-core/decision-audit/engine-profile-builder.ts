import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildDecisionRecords,
  computeAccountabilityScore,
  countDecisionsToday,
  countPendingApprovals,
} from './decision-engine';
import {
  buildDefaultTimelineFilter,
  buildDockDecisionAuditLine,
  buildTimelineEntries,
} from './timeline-engine';
import type { OrganizationDecisionAuditProfile } from './types';

export function buildOrganizationDecisionAuditProfile(organizationId: string): OrganizationDecisionAuditProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const decisions = buildDecisionRecords(organizationId, now);
  const timeline = buildTimelineEntries(decisions);
  const explainableDecisions = decisions.filter(
    (d) => d.supportingEvidence.length >= 2 && d.whyItHappened.length > 20
  ).length;

  const profile: OrganizationDecisionAuditProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    accountabilityScore: computeAccountabilityScore(decisions),
    totalDecisions: decisions.length,
    explainableDecisions,
    pendingApprovals: countPendingApprovals(decisions),
    decisionsToday: countDecisionsToday(decisions, now),
    decisions,
    timeline,
    activeFilter: buildDefaultTimelineFilter(),
    selectedDecisionId: decisions[0]?.id ?? null,
    dockDecisionAuditLine: '',
    neverBlackBox: true,
    lastSyncedAt: now,
  };

  profile.dockDecisionAuditLine = buildDockDecisionAuditLine(profile);
  return profile;
}
