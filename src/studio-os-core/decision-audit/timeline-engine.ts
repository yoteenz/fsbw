import type {
  DecisionRecord,
  DecisionTimelineEntry,
  DecisionTimelineFilter,
  TimelineFilter,
} from './types';

export function buildDefaultTimelineFilter(): DecisionTimelineFilter {
  return { period: 'all', source: 'all', department: 'all' };
}

export function buildTimelineEntries(decisions: DecisionRecord[]): DecisionTimelineEntry[] {
  return decisions.map((d) => ({
    id: `timeline-${d.id}`,
    decisionId: d.id,
    timestamp: d.timestamp,
    label: d.decisionTypeLabel,
    decisionMaker: d.decisionMaker,
    approvalStatus: d.approvalStatus,
    auditSource: d.auditSource,
    summary: d.decision.slice(0, 80),
  }));
}

function withinPeriod(timestamp: string, period: TimelineFilter, now: string): boolean {
  if (period === 'all') return true;
  const ts = new Date(timestamp).getTime();
  const nowMs = new Date(now).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (period === 'today') return new Date(timestamp).toDateString() === new Date(now).toDateString();
  if (period === 'week') return nowMs - ts <= 7 * day;
  if (period === 'month') return nowMs - ts <= 30 * day;
  if (period === 'quarter') return nowMs - ts <= 90 * day;
  return true;
}

export function filterTimelineEntries(
  entries: DecisionTimelineEntry[],
  filter: DecisionTimelineFilter,
  decisions: DecisionRecord[],
  now: string
): DecisionTimelineEntry[] {
  const decisionMap = new Map(decisions.map((d) => [d.id, d]));
  return entries.filter((e) => {
    if (!withinPeriod(e.timestamp, filter.period, now)) return false;
    if (filter.source !== 'all' && e.auditSource !== filter.source) return false;
    const decision = decisionMap.get(e.decisionId);
    if (filter.department !== 'all' && decision?.department !== filter.department) return false;
    return true;
  });
}

export function explainDecision(decision: DecisionRecord): string {
  return `${decision.decision} Why: ${decision.whyItHappened} Approved by: ${decision.approvedBy ?? 'Pending'}. Confidence: ${decision.confidencePct}%.`;
}

export function summarizeDecisionAudit(profile: {
  accountabilityScore: number;
  totalDecisions: number;
  explainableDecisions: number;
  pendingApprovals: number;
  decisionsToday: number;
}): string {
  return `Decision Audit™ ${profile.accountabilityScore}% accountability · ${profile.totalDecisions} decisions recorded · ${profile.explainableDecisions} fully explainable · ${profile.pendingApprovals} pending approval · ${profile.decisionsToday} today. Never a black box.`;
}

export function buildDockDecisionAuditLine(profile: {
  accountabilityScore: number;
  totalDecisions: number;
  pendingApprovals: number;
  decisions: DecisionRecord[];
}): string {
  const latest = profile.decisions[0];
  const latestLine = latest ? ` Latest: "${latest.decisionTypeLabel}" (${latest.approvalStatus}).` : '';
  return `Decision Audit™ ${profile.accountabilityScore}% · ${profile.totalDecisions} permanent records · ${profile.pendingApprovals} pending.${latestLine}`;
}
