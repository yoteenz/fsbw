import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import { buildEventChains } from './chain-builder';
import { buildInspectorMetrics } from './inspector-engine';
import { buildSeedEventHistory } from './event-history';
import { computeEventCoveragePct, runEventBusGovernanceAudit } from './governance-engine';
import { getAllEventTypes } from './registration';
import { buildSubscriptionRegistry } from './subscription-registry';
import type { EventBusHealthMetric, OrganizationEventBusProfile } from './types';

export function buildDockBusLine(profile: OrganizationEventBusProfile): string {
  return `Event Bus™ ${profile.busScore}% — ${profile.totalEventTypes} event types · ${profile.totalSubscriptions} subscriptions · ${profile.avgLatencyMs}ms avg latency · loosely coupled nervous system.`;
}

function computeHealthMetrics(
  eventTypes: ReturnType<typeof getAllEventTypes>,
  subscriptions: ReturnType<typeof buildSubscriptionRegistry>,
  coverage: number,
  avgLatency: number,
  findings: ReturnType<typeof runEventBusGovernanceAudit>
): EventBusHealthMetric[] {
  const domains = new Set(eventTypes.map((e) => e.domain)).size;
  const warnings = findings.filter((f) => f.severity === 'warning').length;

  return [
    {
      id: 'catalog',
      label: 'Event Catalog',
      scorePct: Math.min(99, Math.round((eventTypes.length / 35) * 100)),
      detail: `${eventTypes.length} standardized event types`,
      status: eventTypes.length >= 30 ? 'healthy' : 'warning',
    },
    {
      id: 'subscriptions',
      label: 'Subscriptions',
      scorePct: Math.min(99, Math.round((subscriptions.length / 80) * 100)),
      detail: `${subscriptions.length} active subscriptions`,
      status: subscriptions.length >= 60 ? 'healthy' : 'warning',
    },
    {
      id: 'domains',
      label: 'Domain Coverage',
      scorePct: Math.min(99, Math.round((domains / 15) * 100)),
      detail: `${domains}/15 event domains populated`,
      status: domains >= 10 ? 'healthy' : 'warning',
    },
    {
      id: 'coverage',
      label: 'Subscriber Coverage',
      scorePct: coverage,
      detail: `${coverage}% event types have subscribers`,
      status: coverage >= 85 ? 'healthy' : 'warning',
    },
    {
      id: 'latency',
      label: 'Event Latency',
      scorePct: Math.max(0, 100 - Math.max(0, avgLatency - 20)),
      detail: `${avgLatency}ms average delivery latency`,
      status: avgLatency <= 35 ? 'healthy' : avgLatency <= 60 ? 'warning' : 'critical',
    },
    {
      id: 'history',
      label: 'Event History',
      scorePct: 92,
      detail: 'Permanent audit trail — replay, compliance, analytics',
      status: 'healthy',
    },
    {
      id: 'governance',
      label: 'Bus Governance',
      scorePct: Math.max(0, 100 - warnings * 8),
      detail: warnings === 0 ? 'No coupling violations' : `${warnings} governance findings`,
      status: warnings === 0 ? 'healthy' : 'warning',
    },
    {
      id: 'chains',
      label: 'Event Chains',
      scorePct: Math.min(99, buildEventChains().length * 25),
      detail: `${buildEventChains().length} documented reaction chains`,
      status: 'healthy',
    },
  ];
}

export function buildOrganizationEventBusProfile(organizationId: string): OrganizationEventBusProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const eventTypes = getAllEventTypes();
  const subscriptions = buildSubscriptionRegistry();
  const eventHistory = buildSeedEventHistory();
  const domainCounts: Record<string, number> = {};
  const governanceFindings = runEventBusGovernanceAudit();
  const coveragePct = computeEventCoveragePct();
  const avgLatencyMs =
    eventHistory.length === 0
      ? 0
      : Math.round(eventHistory.reduce((s, e) => s + e.latencyMs, 0) / eventHistory.length);

  for (const e of eventTypes) {
    domainCounts[e.domain] = (domainCounts[e.domain] ?? 0) + 1;
  }

  const healthMetrics = computeHealthMetrics(
    eventTypes,
    subscriptions,
    coveragePct,
    avgLatencyMs,
    governanceFindings
  );
  const busScore = Math.min(
    99,
    Math.round(healthMetrics.reduce((s, m) => s + m.scorePct, 0) / healthMetrics.length)
  );

  const profile: OrganizationEventBusProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    busScore,
    totalEventTypes: eventTypes.length,
    totalSubscriptions: subscriptions.length,
    domainCounts,
    eventTypes,
    subscriptions,
    eventHistory,
    eventChains: buildEventChains(),
    inspectorMetrics: buildInspectorMetrics(eventHistory),
    governanceFindings,
    healthMetrics,
    avgLatencyMs,
    dockBusLine: '',
    looselyCoupled: true,
    lastSyncedAt: now,
  };

  profile.dockBusLine = buildDockBusLine(profile);
  return profile;
}

export function summarizeEventBus(profile: OrganizationEventBusProfile): string {
  const top = Object.entries(profile.domainCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([k, v]) => `${k}:${v}`)
    .join(' · ');
  return `${profile.dockBusLine} Domains: ${top}.`;
}
