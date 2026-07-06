import { getOrganizationAiRedTeamProfile } from '../ai-red-team/store';
import { getOrganizationConfidenceEngineProfile } from '../confidence-engine/store';
import { getOrganizationDecisionAuditProfile } from '../decision-audit/store';
import { getOrganizationExecutiveTrustDashboardProfile } from '../executive-trust-dashboard/store';
import { getOrganizationKnowledgeConfidenceProfile } from '../knowledge-confidence/store';
import { getOrganizationPredictiveQaProfile } from '../predictive-qa/store';
import { getOrganizationQaHeadquartersProfile } from '../qa-headquarters/store';
import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import { getOrganizationSelfHealingEngineProfile } from '../self-healing-engine/store';
import { GUARDIAN_MONITOR_DOMAINS, GUARDIAN_MONITOR_LABELS } from './constants';
import type { GuardianAlert, GuardianDomainStatus, GuardianMonitorDomain } from './types';

function trendFromScore(score: number, baseline: number): GuardianDomainStatus['trend'] {
  if (score >= baseline + 3) return 'rising';
  if (score <= baseline - 3) return 'declining';
  return 'stable';
}

function statusFromScore(score: number): GuardianDomainStatus['status'] {
  if (score >= 80) return 'healthy';
  if (score >= 65) return 'watch';
  return 'at-risk';
}

export function buildGuardianDomainStatuses(organizationId: string): GuardianDomainStatus[] {
  const trust = getOrganizationExecutiveTrustDashboardProfile(organizationId);
  const qaHq = getOrganizationQaHeadquartersProfile(organizationId);
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const redTeam = getOrganizationAiRedTeamProfile(organizationId);
  const predictive = getOrganizationPredictiveQaProfile(organizationId);
  const healing = getOrganizationSelfHealingEngineProfile(organizationId);
  const confidence = getOrganizationConfidenceEngineProfile(organizationId);
  const knowledge = getOrganizationKnowledgeConfidenceProfile(organizationId);
  const audit = getOrganizationDecisionAuditProfile(organizationId);

  const trustScore = trust?.overallTrustScore ?? 74;
  const healthScore = trust?.overallHealthScore ?? 76;
  const qaScore = qaHq?.overallTrustScore ?? 78;
  const inspectorScore = inspector ? Math.max(40, 100 - inspector.openFindings * 4) : 82;
  const redTeamScore = redTeam?.redTeamScore ?? 75;
  const predictiveScore = predictive?.predictiveQaScore ?? 70;
  const healingScore = healing?.resilienceScore ?? 72;
  const confidenceScore = confidence?.overallConfidenceScore ?? 73;
  const knowledgeScore = knowledge?.overallConfidenceScore ?? 74;
  const auditScore = audit?.accountabilityScore ?? 80;

  const domainScores: Record<GuardianMonitorDomain, { score: number; summary: string }> = {
    quality: { score: Math.round((qaScore + inspectorScore) / 2), summary: 'QA Headquarters and Inspector continuous validation' },
    trust: { score: trustScore, summary: 'Executive Trust Dashboard aggregate trust metrics' },
    security: { score: Math.round((redTeamScore + (100 - (inspector?.criticalFindings ?? 0) * 8)) / 2), summary: 'AI Red Team adversarial testing and permission audits' },
    compliance: { score: Math.max(55, auditScore - (inspector?.criticalFindings ?? 0) * 3), summary: 'Decision Audit and policy compliance signals' },
    performance: { score: healthScore, summary: 'System performance and workflow execution health' },
    'knowledge-integrity': { score: knowledgeScore, summary: 'Knowledge Confidence and graph coverage integrity' },
    'profession-brains': { score: Math.round((knowledgeScore + confidenceScore) / 2), summary: 'Profession Brain consistency and boundary harmonization' },
    marketplace: { score: Math.round((trustScore + predictiveScore) / 2), summary: 'Marketplace demand, expert availability, and listing quality' },
    experts: { score: predictive ? Math.max(60, 100 - predictive.highRiskPredictions * 5) : 78, summary: 'Expert capacity and marketplace SLA health' },
    'customer-experience': { score: Math.round((confidenceScore + healingScore) / 2), summary: 'Customer journey, onboarding, and satisfaction signals' },
    'ai-systems': { score: Math.round((confidenceScore + redTeamScore) / 2), summary: 'Studio Intelligence and AI recommendation confidence' },
    infrastructure: { score: healingScore, summary: 'Integration health, dependencies, and infrastructure resilience' },
    documentation: { score: Math.max(58, inspectorScore - 5), summary: 'Documentation freshness and link validation' },
    'automation-health': { score: healing ? Math.max(65, 100 - healing.pendingApprovals * 3) : 80, summary: 'Automation triggers, inactive workflows, and self-healing status' },
    'organization-growth': { score: Math.round((predictiveScore + trustScore) / 2), summary: 'Scaling readiness and capacity forecasting' },
  };

  return GUARDIAN_MONITOR_DOMAINS.map((domain) => {
    const { score, summary } = domainScores[domain];
    return {
      domain,
      label: GUARDIAN_MONITOR_LABELS[domain],
      score,
      trend: trendFromScore(score, 75),
      status: statusFromScore(score),
      summary,
    };
  }).sort((a, b) => a.score - b.score);
}

const ALERT_SEEDS: Omit<GuardianAlert, 'id' | 'domainLabel' | 'detectedAt'>[] = [
  {
    title: 'Profession Brain™ Inconsistency',
    message: 'This Profession Brain™ has become inconsistent after recent edits.',
    domain: 'profession-brains',
    severity: 'urgent',
    status: 'active',
    recommendation: 'Run Brain harmonization review · sync Knowledge Graph boundaries · coordinate with Self-Healing Recovery Plan.',
    coordinatedSystems: ['QA Inspector', 'Self-Healing Engine', 'Confidence Engine', 'Decision Audit'],
    explainBeforeActing: true,
  },
  {
    title: 'Workflow Capacity Warning',
    message: 'This department is approaching workflow capacity.',
    domain: 'organization-growth',
    severity: 'attention',
    status: 'active',
    recommendation: 'Review Predictive QA staffing forecast · enable parallel approval paths · schedule capacity planning session.',
    coordinatedSystems: ['Predictive QA', 'QA Simulation Engine', 'Studio Intelligence'],
    explainBeforeActing: true,
  },
  {
    title: 'Documentation Quality Declining',
    message: 'Documentation quality is declining across 14 referenced pages.',
    domain: 'documentation',
    severity: 'attention',
    status: 'active',
    recommendation: 'Enable documentation sync alerts · coordinate Self-Healing auto-repair for broken links · assign doc owners.',
    coordinatedSystems: ['QA Inspector', 'Self-Healing Engine', 'Knowledge Confidence'],
    explainBeforeActing: true,
  },
  {
    title: 'Onboarding Completion Drop',
    message: 'Customer onboarding completion has dropped 19% week-over-week.',
    domain: 'customer-experience',
    severity: 'urgent',
    status: 'escalated',
    recommendation: 'Run Customer Simulation gate · review Confidence Engine low-confidence recommendations · coordinate workflow approval.',
    coordinatedSystems: ['QA Simulation Engine', 'Confidence Engine', 'Predictive QA'],
    explainBeforeActing: true,
  },
  {
    title: 'Knowledge Graph Confidence Weakening',
    message: 'Knowledge Graph confidence is weakening on high-traffic workflow topics.',
    domain: 'knowledge-integrity',
    severity: 'attention',
    status: 'active',
    recommendation: 'Audit top 5 workflows for graph coverage · publish missing knowledge assets · boost Knowledge Confidence scores.',
    coordinatedSystems: ['Knowledge Confidence', 'Confidence Engine', 'Self-Healing Engine'],
    explainBeforeActing: true,
  },
  {
    title: 'Permission Conflict Detected',
    message: 'Editor role permission drift creates unauthorized access risk.',
    domain: 'security',
    severity: 'critical',
    status: 'escalated',
    recommendation: 'Escalate to Security immediately · execute Self-Healing Recovery Plan · coordinate Red Team validation.',
    coordinatedSystems: ['AI Red Team', 'Self-Healing Engine', 'Decision Audit', 'QA Inspector'],
    explainBeforeActing: true,
  },
  {
    title: 'Trust Score Trend Declining',
    message: 'Executive Trust Dashboard shows declining trust across 3 systems.',
    domain: 'trust',
    severity: 'urgent',
    status: 'active',
    recommendation: 'Weekly trust review with Guardian Dashboard · prioritize at-risk systems · coordinate QA Headquarters validation.',
    coordinatedSystems: ['Executive Trust Dashboard', 'QA Headquarters', 'Decision Audit'],
    explainBeforeActing: true,
  },
  {
    title: 'Automation Health Degradation',
    message: '3 automations inactive for 21+ days · trigger conditions may be stale.',
    domain: 'automation-health',
    severity: 'advisory',
    status: 'active',
    recommendation: 'Self-Healing Engine can auto-repair low-risk inactive automations · review automation registry.',
    coordinatedSystems: ['Self-Healing Engine', 'QA Inspector', 'Predictive QA'],
    explainBeforeActing: true,
  },
];

export function buildGuardianAlerts(organizationId: string, now: string): GuardianAlert[] {
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const predictive = getOrganizationPredictiveQaProfile(organizationId);

  return ALERT_SEEDS.map((seed, i) => {
    let severity = seed.severity;
    if (inspector && inspector.criticalFindings > 0 && seed.domain === 'security') severity = 'critical';
    if (predictive && predictive.highRiskPredictions >= 3 && seed.domain === 'organization-growth') severity = 'urgent';

    return {
      ...seed,
      id: `alert-${seed.domain}-${i}`,
      domainLabel: GUARDIAN_MONITOR_LABELS[seed.domain],
      severity,
      detectedAt: now,
    };
  }).sort((a, b) => {
    const order = { critical: 0, urgent: 1, attention: 2, advisory: 3 };
    return order[a.severity] - order[b.severity];
  });
}

export function computeGuardianScore(domains: GuardianDomainStatus[], alerts: GuardianAlert[]): number {
  const avgDomain = domains.reduce((s, d) => s + d.score, 0) / Math.max(domains.length, 1);
  const alertPenalty = alerts.filter((a) => a.status === 'active' || a.status === 'escalated').reduce((s, a) => {
    const w = a.severity === 'critical' ? 4 : a.severity === 'urgent' ? 3 : a.severity === 'attention' ? 2 : 1;
    return s + w;
  }, 0);
  return Math.max(0, Math.min(99, Math.round(avgDomain - alertPenalty * 0.8)));
}

export function countActiveAlerts(alerts: GuardianAlert[]): number {
  return alerts.filter((a) => a.status === 'active' || a.status === 'escalated').length;
}

export function countUrgentAlerts(alerts: GuardianAlert[]): number {
  return alerts.filter(
    (a) => (a.status === 'active' || a.status === 'escalated') && (a.severity === 'urgent' || a.severity === 'critical')
  ).length;
}
