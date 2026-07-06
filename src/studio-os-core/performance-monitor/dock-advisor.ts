import { explainBottleneckById, queryPerformanceMonitor } from './discovery-engine';
import { explainPerformanceBottleneck, summarizePerformanceMonitor } from './report-engine';
import {
  ensureOrganizationPerformanceMonitorProfile,
  getOrganizationPerformanceMonitorProfile,
  selectPerformanceModule,
} from './store';
import type { PerformanceMonitorDockAdvice } from './types';

export function resolvePerformanceMonitorAdvice(
  input: string,
  organizationId: string
): PerformanceMonitorDockAdvice | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  const profile =
    getOrganizationPerformanceMonitorProfile(organizationId) ??
    ensureOrganizationPerformanceMonitorProfile(organizationId);

  if (/performance|latency|slow|bottleneck|speed|performance budget/i.test(trimmed)) {
    return {
      response: summarizePerformanceMonitor(profile),
      concierge: 'Chief Concierge',
      overallPerformanceScore: profile.overallPerformanceScore,
      bottlenecksOpen: profile.bottlenecksOpen,
    };
  }

  if (/memory|cpu|network|api|ai response|battery|mobile performance/i.test(trimmed)) {
    const match = profile.bottlenecks.find((b) => trimmed.toLowerCase().includes(b.metric.replace(/-/g, ' ').split(' ')[0]));
    if (match) {
      return { response: explainPerformanceBottleneck(match), concierge: 'Chief Concierge', bottlenecksOpen: profile.bottlenecksOpen };
    }
  }

  if (/budget exceeded|production flag|studio intelligence flag/i.test(trimmed)) {
    const budget = profile.performanceBudgets.find((b) => b.flaggedBeforeProduction);
    if (budget) {
      return { response: budget.studioIntelligenceNote, concierge: 'Chief Concierge' };
    }
  }

  if (/never become slower|performance is a feature|responsive experience/i.test(trimmed)) {
    const report = profile.moduleReports.find((r) => !r.withinPerformanceBudget) ?? profile.moduleReports[0];
    if (report) {
      selectPerformanceModule(organizationId, report.moduleId);
      return { response: report.performanceVerdict, concierge: 'Chief Concierge' };
    }
  }

  const hits = queryPerformanceMonitor(trimmed, profile, 3);
  if (hits.length > 0 && /find|search|show|list|monitor|performance/i.test(trimmed)) {
    return {
      response: hits.map((h) => `${h.label} (${h.matchReason})`).join(' · '),
      concierge: 'Chief Concierge',
      overallPerformanceScore: profile.overallPerformanceScore,
    };
  }

  const explainMatch = trimmed.match(/explain (?:bottleneck|issue) (.+)/i);
  if (explainMatch) {
    const found = queryPerformanceMonitor(explainMatch[1], profile, 1);
    if (found[0]?.type === 'bottleneck') {
      return { response: explainBottleneckById(found[0].id, profile) ?? found[0].label, concierge: 'Chief Concierge' };
    }
  }

  return null;
}

export function buildProactivePerformanceSuggestion(organizationId: string): string | null {
  const profile = getOrganizationPerformanceMonitorProfile(organizationId);
  if (!profile) return null;
  return summarizePerformanceMonitor(profile);
}

export function buildPerformanceMonitorOpeningLine(organizationId: string): string {
  const profile = ensureOrganizationPerformanceMonitorProfile(organizationId);
  return profile.dockPerformanceLine;
}
