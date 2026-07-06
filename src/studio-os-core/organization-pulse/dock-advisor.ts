import {
  ensureOrganizationPulseProfile,
  getOrganizationPulseProfile,
} from './store';
import type { OrganizationPulseDockAdvice } from './types';

export function resolveOrganizationPulseAdvice(
  input: string,
  organizationId: string
): OrganizationPulseDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile = getOrganizationPulseProfile(organizationId) ?? ensureOrganizationPulseProfile(organizationId);

  if (
    /organization pulse|org pulse|how is our organization|how are we really|organizational pulse|pulse score|how does the organization feel/i.test(
      trimmed
    )
  ) {
    const alert = profile.proactiveAlerts.find((a) => a.severity !== 'info');
    return {
      response: alert
        ? `Pulse ${profile.overallPulseScore}% (${profile.pulseState.replace(/-/g, ' ')}). ${alert.title} — ${alert.recommendedAction.slice(0, 100)}`
        : `${profile.pulseFeeling.slice(0, 160)}`,
      concierge: 'Chief Concierge',
      pulseState: profile.pulseState,
      overallPulseScore: profile.overallPulseScore,
    };
  }

  if (/proactive alert|what changed|needs attention|before it becomes/i.test(trimmed)) {
    const alert = profile.proactiveAlerts[0];
    return {
      response: alert
        ? `${alert.title}: ${alert.message.slice(0, 100)}. Action: ${alert.recommendedAction.slice(0, 80)}`
        : 'No urgent pulse alerts — organization trending stable.',
      concierge: 'Chief Concierge',
      pulseState: profile.pulseState,
      overallPulseScore: profile.overallPulseScore,
    };
  }

  const indicator = profile.indicatorScores.find((i) =>
    trimmed.toLowerCase().includes(i.label.toLowerCase().split(' ')[0])
  );
  if (indicator && /pulse|momentum|score|how/i.test(trimmed)) {
    return {
      response: `${indicator.label}: ${indicator.scorePct}% (${indicator.state.replace(/-/g, ' ')}, ${indicator.trend}). ${indicator.signal.slice(0, 90)}`,
      concierge: 'Chief Concierge',
      pulseState: profile.pulseState,
      overallPulseScore: profile.overallPulseScore,
    };
  }

  return null;
}

export function listOrganizationPulseDockSuggestions(organizationId: string): string[] {
  ensureOrganizationPulseProfile(organizationId);
  const profile = getOrganizationPulseProfile(organizationId);
  if (!profile) {
    return ['How is our organization really doing?', 'Open Organization Pulse dashboard.'];
  }

  const suggestions = [
    'How is our organization really doing?',
    'What proactive pulse alerts need attention?',
    'Show marketing momentum and founder workload.',
  ];

  const urgent = profile.proactiveAlerts.find((a) => a.severity === 'urgent' || a.severity === 'critical');
  if (urgent) {
    suggestions.unshift(urgent.title);
  }

  return suggestions.slice(0, 4);
}

export function buildProactivePulseSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPulseProfile(organizationId);
  if (!profile) return null;

  const urgent = profile.proactiveAlerts.find((a) => a.severity === 'urgent' || a.severity === 'critical');
  if (urgent) {
    return `Organization Pulse: ${urgent.title} — ${urgent.recommendedAction.slice(0, 90)}`;
  }

  const info = profile.proactiveAlerts.find((a) => a.severity === 'info');
  if (info) {
    return `${info.title} — ${info.message.slice(0, 80)}`;
  }

  const founder = profile.indicatorScores.find((i) => i.id === 'founder-workload');
  const revenue = profile.indicatorScores.find((i) => i.id === 'revenue-momentum');
  if (revenue && founder && revenue.scorePct >= 70 && founder.scorePct < 55) {
    return `Revenue is healthy (${revenue.scorePct}%), but founder workload is increasing (${100 - founder.scorePct}% dependency signal).`;
  }

  const cx = profile.indicatorScores.find((i) => i.id === 'customer-satisfaction');
  if (cx && cx.trend === 'declining') {
    return `Our customer experience score has declined this week — pulse at ${cx.scorePct}%. Review Genome customer standards.`;
  }

  const marketing = profile.indicatorScores.find((i) => i.id === 'marketing-performance');
  if (marketing && marketing.trend === 'accelerating') {
    return `Marketing momentum is accelerating (${marketing.scorePct}%) — protect brand identity while scaling.`;
  }

  const knowledge = profile.indicatorScores.find((i) => i.id === 'knowledge-growth');
  if (knowledge && knowledge.trend === 'slowing') {
    return `Knowledge preservation has slowed (${knowledge.scorePct}%) — sync Profession Brain before launching new initiatives.`;
  }

  return `Organization pulse ${profile.overallPulseScore}% — ${profile.pulseState.replace(/-/g, ' ')}. How is our organization really doing? Organizationally.`;
}
