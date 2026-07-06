import { DASHBOARD_METRICS, DASHBOARD_METRIC_LABELS } from './constants';
import type { GuardianCoordination, GuardianDashboardMetric, GuardianDomainStatus, GuardianMonitorDomain } from './types';

export function buildGuardianDashboardMetrics(
  domains: GuardianDomainStatus[],
  guardianScore: number
): GuardianDashboardMetric[] {
  const byDomain = new Map(domains.map((d) => [d.domain, d]));

  const mappings: Record<(typeof DASHBOARD_METRICS)[number], GuardianMonitorDomain[]> = {
    'organizational-confidence': ['trust', 'quality', 'ai-systems'],
    trust: ['trust'],
    health: ['performance', 'infrastructure'],
    security: ['security', 'compliance'],
    quality: ['quality', 'documentation'],
    'operational-risk': ['automation-health', 'performance'],
    readiness: ['organization-growth', 'experts'],
    growth: ['organization-growth', 'marketplace'],
  };

  return DASHBOARD_METRICS.map((metric) => {
    const related = mappings[metric];
    const scores = related.map((d) => byDomain.get(d)?.score ?? 70);
    const score = metric === 'organizational-confidence'
      ? guardianScore
      : Math.round(scores.reduce((s, v) => s + v, 0) / scores.length);
    const trend = score >= 80 ? 'rising' as const : score >= 65 ? 'stable' as const : 'declining' as const;

    const summaries: Record<(typeof DASHBOARD_METRICS)[number], string> = {
      'organizational-confidence': 'Composite Guardian score across all monitored domains',
      trust: 'Executive trust metrics and organizational confidence signals',
      health: 'System health, performance, and infrastructure resilience',
      security: 'Security posture, Red Team findings, and compliance status',
      quality: 'QA validation, inspector findings, and documentation quality',
      'operational-risk': 'Automation health, workflow failures, and scaling risks',
      readiness: 'Expert capacity, growth forecasting, and operational preparedness',
      growth: 'Marketplace trends, organization scaling, and demand signals',
    };

    return {
      metric,
      label: DASHBOARD_METRIC_LABELS[metric],
      score,
      trend,
      summary: summaries[metric],
    };
  });
}

export function buildGuardianCoordinations(now: string): GuardianCoordination[] {
  return [
    { system: 'QA Headquarters™', status: 'active', lastSync: now, summary: 'Trust scores and continuous validation coordinated' },
    { system: 'QA Inspector™', status: 'active', lastSync: now, summary: 'Audit findings feeding Guardian alerts' },
    { system: 'QA Simulation Engine™', status: 'monitoring', lastSync: now, summary: 'Production gate and persona simulation signals' },
    { system: 'AI Red Team™', status: 'active', lastSync: now, summary: 'Adversarial stress testing and security exposure' },
    { system: 'Executive Trust Dashboard™', status: 'active', lastSync: now, summary: 'Trust, health, and confidence aggregation' },
    { system: 'Predictive QA™', status: 'active', lastSync: now, summary: 'Future risk predictions and capacity forecasts' },
    { system: 'Self-Healing™ Engine', status: 'monitoring', lastSync: now, summary: 'Low-risk auto-repair and Recovery Plans' },
    { system: 'Decision Audit™', status: 'active', lastSync: now, summary: 'Permanent decision accountability records' },
    { system: 'Confidence Engine™', status: 'active', lastSync: now, summary: 'Visible intelligence confidence on recommendations' },
    { system: 'Studio Intelligence™', status: 'active', lastSync: now, summary: 'Executive advisory and recommendation coordination' },
  ];
}

export function summarizeGuardian(profile: {
  guardianScore: number;
  activeAlerts: number;
  urgentAlerts: number;
  domainsMonitored: number;
}): string {
  return `Organizational Guardian™ ${profile.guardianScore}% protection · ${profile.domainsMonitored} domains monitored · ${profile.activeAlerts} active alerts · ${profile.urgentAlerts} urgent · trusted executive advisor, not monitoring software.`;
}

export function buildDockGuardianLine(profile: {
  guardianScore: number;
  activeAlerts: number;
  urgentAlerts: number;
  alerts: import('./types').GuardianAlert[];
}): string {
  const top = profile.alerts.find((a) => a.status === 'active' || a.status === 'escalated');
  const topLine = top ? ` Priority: "${top.title}".` : '';
  return `Guardian™ ${profile.guardianScore}% · ${profile.activeAlerts} alerts · ${profile.urgentAlerts} urgent.${topLine} Protect before reacting.`;
}

export function explainGuardianAlert(alert: import('./types').GuardianAlert): string {
  return `${alert.message} Recommendation: ${alert.recommendation} Coordinated: ${alert.coordinatedSystems.join(', ')}.`;
}
