import { MONITOR_METRIC_LABELS } from './constants';
import { MODULE_SEEDS } from './monitor-engine';
import type { PerformanceBudget } from './types';

export function buildPerformanceBudgets(bottlenecks: import('./types').PerformanceBottleneck[]): PerformanceBudget[] {
  const budgets: PerformanceBudget[] = [];

  const features = [
    { featureId: 'mission-control-load', featureLabel: 'Mission Control Load', metric: 'page-load-times' as const, limit: '2.0s', current: '2.8s', util: 140 },
    { featureId: 'tab-switch', featureLabel: 'Tab Switch Interaction', metric: 'interaction-latency' as const, limit: '280ms', current: '420ms', util: 150 },
    { featureId: 'health-ring-animation', featureLabel: 'Health Ring Animation', metric: 'animation-smoothness' as const, limit: '60fps', current: '52fps', util: 115 },
    { featureId: 'hero-render', featureLabel: 'Hero Card Render', metric: 'rendering-performance' as const, limit: '100ms', current: '180ms', util: 180 },
    { featureId: 'navigation-memory', featureLabel: 'Navigation Memory', metric: 'memory-usage' as const, limit: '+2MB/nav', current: '+12MB/nav', util: 600 },
    { featureId: 'concierge-ai', featureLabel: 'Concierge AI Routing', metric: 'ai-response-times' as const, limit: '2.0s', current: '3.2s', util: 160 },
    { featureId: 'mobile-lighthouse', featureLabel: 'Mobile Lighthouse', metric: 'mobile-performance' as const, limit: 'Score 80', current: 'Score 62', util: 128 },
    { featureId: 'org-sync', featureLabel: 'Organization Sync', metric: 'network-requests' as const, limit: '8 requests', current: '14 requests', util: 175 },
    { featureId: 'profile-api', featureLabel: 'Profile API', metric: 'api-response-times' as const, limit: '500ms p95', current: '890ms p95', util: 178 },
    { featureId: 'localStorage', featureLabel: 'Local Storage', metric: 'storage-utilization' as const, limit: '3.5MB', current: '4.2MB', util: 120 },
  ];

  for (const f of features) {
    const exceeded = f.util > 100;
    const approaching = f.util > 85 && !exceeded;
    budgets.push({
      id: `budget-${f.featureId}`,
      featureId: f.featureId,
      featureLabel: f.featureLabel,
      metric: f.metric,
      metricLabel: MONITOR_METRIC_LABELS[f.metric],
      budgetLimit: f.limit,
      currentValue: f.current,
      utilizationPct: f.util,
      status: exceeded ? 'exceeded' : approaching ? 'approaching-limit' : 'within-budget',
      flaggedBeforeProduction: exceeded,
      studioIntelligenceNote: exceeded
        ? `Studio Intelligence™ flags ${f.featureLabel} — exceeds Performance Budget™ before production.`
        : approaching
          ? `${f.featureLabel} approaching limit — monitor before next release.`
          : `${f.featureLabel} within Performance Budget™.`,
    });
  }

  void bottlenecks;
  void MODULE_SEEDS;
  return budgets;
}

export function getExceededBudgets(budgets: PerformanceBudget[]): PerformanceBudget[] {
  return budgets.filter((b) => b.status === 'exceeded');
}

export function getFlaggedBeforeProduction(budgets: PerformanceBudget[]): PerformanceBudget[] {
  return budgets.filter((b) => b.flaggedBeforeProduction);
}
