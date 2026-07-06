import { STRAINED_THRESHOLD } from './constants';
import type { ProactivePulseAlert, PulseIndicatorScore } from './types';

const ALERT_TEMPLATES: {
  indicatorId: PulseIndicatorScore['id'];
  when: (i: PulseIndicatorScore) => boolean;
  title: string;
  message: (i: PulseIndicatorScore) => string;
  severity: ProactivePulseAlert['severity'];
  action: (i: PulseIndicatorScore) => string;
}[] = [
  {
    indicatorId: 'founder-workload',
    when: (i) => i.scorePct < 45 || i.trend === 'declining',
    title: 'Founder workload increasing',
    message: (i) => `${i.label} at ${i.scorePct}% — ${i.signal}`,
    severity: 'urgent',
    action: () => 'Open Succession Mode — preserve knowledge and delegate before capacity breaks.',
  },
  {
    indicatorId: 'customer-satisfaction',
    when: (i) => i.trend === 'declining' || i.scorePct < 55,
    title: 'Customer experience score declining',
    message: (i) => `Customer satisfaction pulse at ${i.scorePct}% with ${i.trend} trend.`,
    severity: 'watch',
    action: () => 'Review Genome customer standards and Concierge response quality this week.',
  },
  {
    indicatorId: 'marketing-performance',
    when: (i) => i.trend === 'slowing' || i.trend === 'declining',
    title: 'Marketing momentum slowing',
    message: (i) => `${i.label} trending ${i.trend} at ${i.scorePct}%.`,
    severity: 'watch',
    action: () => 'Archive recent campaign outcomes in Memory Engine before launching new initiatives.',
  },
  {
    indicatorId: 'knowledge-growth',
    when: (i) => i.trend === 'slowing' || i.scorePct < 50,
    title: 'Knowledge capture decreasing',
    message: (i) => `Knowledge growth at ${i.scorePct}% — institutional memory may stall.`,
    severity: 'watch',
    action: () => 'Sync Profession Brain updates and document one completed project lesson today.',
  },
  {
    indicatorId: 'learning-activity',
    when: (i) => i.scorePct < 50,
    title: 'Employee onboarding incomplete',
    message: (i) => `Learning activity at ${i.scorePct}% — team readiness may lag.`,
    severity: 'watch',
    action: () => 'Assign Studio Institute role paths from Profession Brain knowledge.',
  },
  {
    indicatorId: 'automation-adoption',
    when: (i) => i.trend === 'slowing' && i.scorePct < 65,
    title: 'Automation opportunities growing',
    message: (i) => `Automation adoption at ${i.scorePct}% — manual work may be compounding.`,
    severity: 'info',
    action: () => 'Document one repeatable workflow in Memory Engine and evaluate Digital Staff activation.',
  },
  {
    indicatorId: 'revenue-momentum',
    when: (i) => i.scorePct >= 75 && i.trend !== 'declining',
    title: 'Revenue momentum healthy',
    message: (i) => `${i.label} at ${i.scorePct}% — sustainable growth signals present.`,
    severity: 'info',
    action: () => 'Protect margin and customer experience while scaling — convene Executive Council if accelerating spend.',
  },
  {
    indicatorId: 'team-collaboration',
    when: (i) => i.scorePct >= 70 && i.trend === 'accelerating',
    title: 'Executive collaboration accelerating',
    message: (i) => `${i.label} at ${i.scorePct}% — council meetings compounding organizational wisdom.`,
    severity: 'info',
    action: () => 'Continue collaborative decision-making — review Decision History for pending founder approvals.',
  },
  {
    indicatorId: 'operational-efficiency',
    when: (i) => i.scorePct < STRAINED_THRESHOLD,
    title: 'Operational efficiency under pressure',
    message: (i) => `${i.label} at ${i.scorePct}% — capacity may constrain growth initiatives.`,
    severity: 'urgent',
    action: () => 'Identify bottlenecks in Operations Concierge briefing before approving new projects.',
  },
  {
    indicatorId: 'client-retention',
    when: (i) => i.trend === 'declining' || i.scorePct < 50,
    title: 'Client retention signals weakening',
    message: (i) => `${i.label} at ${i.scorePct}% with ${i.trend} trend.`,
    severity: 'critical',
    action: () => 'Escalate to Customer Experience Concierge — trust recovery before acquisition push.',
  },
];

export function detectProactivePulseAlerts(indicators: PulseIndicatorScore[]): ProactivePulseAlert[] {
  const now = new Date().toISOString();
  const alerts: ProactivePulseAlert[] = [];

  for (const template of ALERT_TEMPLATES) {
    const indicator = indicators.find((i) => i.id === template.indicatorId);
    if (!indicator || !template.when(indicator)) continue;
    alerts.push({
      id: `alert-${template.indicatorId}-${Date.now()}`,
      indicatorId: template.indicatorId,
      title: template.title,
      message: template.message(indicator),
      severity: template.severity,
      recommendedAction: template.action(indicator),
      detectedAt: now,
    });
  }

  const severityOrder: Record<ProactivePulseAlert['severity'], number> = {
    critical: 0,
    urgent: 1,
    watch: 2,
    info: 3,
  };

  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]).slice(0, 8);
}

export function buildRecommendedActions(alerts: ProactivePulseAlert[], indicators: PulseIndicatorScore[]): string[] {
  const actions: string[] = [];

  for (const alert of alerts.filter((a) => a.severity !== 'info').slice(0, 4)) {
    actions.push(`${alert.title}: ${alert.recommendedAction}`);
  }

  const slowest = indicators
    .filter((i) => i.trend === 'declining' || i.trend === 'slowing')
    .sort((a, b) => a.scorePct - b.scorePct)
    .slice(0, 2);

  for (const s of slowest) {
    if (actions.length >= 5) break;
    actions.push(`Monitor ${s.label} (${s.scorePct}%, ${s.trend}) — ${s.signal.slice(0, 80)}`);
  }

  if (actions.length === 0) {
    actions.push(
      'Organization pulse stable — maintain proactive reviews in Mission Control.',
      'Continue compounding Memory Engine lessons into Executive Council decisions.'
    );
  }

  return actions.slice(0, 6);
}
