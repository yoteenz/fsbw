import { getOrganizationAccessibilityAuditorProfile } from '../accessibility-auditor/store';
import { getOrganizationInteractionEngineProfile } from '../interaction-engine/store';
import { getOrganizationExperienceQaProfile } from '../experience-qa/store';
import {
  BOTTLENECK_LABELS,
  MONITOR_METRIC_LABELS,
  MONITOR_METRICS,
} from './constants';
import type { MetricMonitorScore, MonitorMetric, PerformanceBottleneck } from './types';

export const MODULE_SEEDS = [
  { moduleId: 'mission-control', moduleLabel: 'Mission Control', route: '/admin/studio/mission-control' },
  { moduleId: 'qa-headquarters', moduleLabel: 'QA Headquarters', route: '/admin/studio/qa-headquarters' },
  { moduleId: 'performance-monitor', moduleLabel: 'Performance Monitor', route: '/admin/studio/performance-monitor' },
  { moduleId: 'accessibility-auditor', moduleLabel: 'Accessibility Auditor', route: '/admin/studio/accessibility-auditor' },
  { moduleId: 'visual-diff-engine', moduleLabel: 'Visual Diff Engine', route: '/admin/studio/visual-diff-engine' },
  { moduleId: 'design-compliance-engine', moduleLabel: 'Design Compliance Engine', route: '/admin/studio/design-compliance-engine' },
  { moduleId: 'confidence-engine', moduleLabel: 'Confidence Engine', route: '/admin/studio/confidence-engine' },
  { moduleId: 'organizational-guardian', moduleLabel: 'Organizational Guardian', route: '/admin/studio/organizational-guardian' },
];

const BOTTLENECK_SEEDS: Omit<
  PerformanceBottleneck,
  'id' | 'bottleneckLabel' | 'metricLabel' | 'moduleId' | 'moduleLabel'
>[] = [
  {
    bottleneckType: 'slow-page-load',
    metric: 'page-load-times',
    severity: 'warning',
    description: 'Mission Control initial load 2.8s — exceeds 2.0s performance budget.',
    measuredValue: '2.8s TTI',
    budgetLimit: '2.0s',
    estimatedUserImpact: 'Executives wait before daily briefing — premium feel degraded.',
    recommendedImprovement: 'Lazy-load Legacy Wing panels · code-split Mission Control routes.',
  },
  {
    bottleneckType: 'high-interaction-latency',
    metric: 'interaction-latency',
    severity: 'critical',
    description: 'Tab switch latency 420ms — Interaction Engine calm motion budget is 280ms.',
    measuredValue: '420ms',
    budgetLimit: '280ms',
    estimatedUserImpact: 'UI feels sluggish — responsiveness no longer premium.',
    recommendedImprovement: 'Memoize tab content · reduce re-render on tab switch.',
  },
  {
    bottleneckType: 'janky-animation',
    metric: 'animation-smoothness',
    severity: 'warning',
    description: 'Health ring animation drops below 55fps on mid-tier mobile.',
    measuredValue: '52fps avg',
    budgetLimit: '60fps',
    estimatedUserImpact: 'Animations feel janky — luxury motion standard broken.',
    recommendedImprovement: 'Use CSS transforms · reduce simultaneous animations.',
  },
  {
    bottleneckType: 'render-blocking',
    metric: 'rendering-performance',
    severity: 'warning',
    description: 'ExecutiveHeroCard blocks main thread 180ms during profile sync.',
    measuredValue: '180ms blocking',
    budgetLimit: '100ms',
    estimatedUserImpact: 'Perceived freeze during sync — trust in responsiveness erodes.',
    recommendedImprovement: 'Defer non-critical renders · use requestIdleCallback for secondary metrics.',
  },
  {
    bottleneckType: 'memory-leak',
    metric: 'memory-usage',
    severity: 'critical',
    description: 'Memory grows 12MB per navigation without release — suspected listener leak.',
    measuredValue: '+12MB/nav',
    budgetLimit: '+2MB/nav',
    estimatedUserImpact: 'Long sessions degrade — tabs become unresponsive.',
    recommendedImprovement: 'Audit event listeners · cleanup on unmount in workspace hooks.',
  },
  {
    bottleneckType: 'cpu-spike',
    metric: 'cpu-usage',
    severity: 'warning',
    description: 'Search debounce triggers full profile rebuild — CPU spike to 78%.',
    measuredValue: '78% peak',
    budgetLimit: '40% peak',
    estimatedUserImpact: 'Fan noise and lag on older hardware during search.',
    recommendedImprovement: 'Index search client-side · debounce sync to 300ms.',
  },
  {
    bottleneckType: 'excessive-network',
    metric: 'network-requests',
    severity: 'advisory',
    description: 'Boundary sync fires 14 parallel store imports on org switch.',
    measuredValue: '14 requests',
    budgetLimit: '8 requests',
    estimatedUserImpact: 'Slow org switching on low bandwidth connections.',
    recommendedImprovement: 'Batch cascade sync · prioritize visible module first.',
  },
  {
    bottleneckType: 'slow-api',
    metric: 'api-response-times',
    severity: 'warning',
    description: 'Profession Brain profile fetch p95 890ms.',
    measuredValue: '890ms p95',
    budgetLimit: '500ms p95',
    estimatedUserImpact: 'Hero cards show loading state too long on first visit.',
    recommendedImprovement: 'Cache profile in localStorage · stale-while-revalidate pattern.',
  },
  {
    bottleneckType: 'slow-database',
    metric: 'database-queries',
    severity: 'advisory',
    description: 'QA findings aggregation query 340ms on large org datasets.',
    measuredValue: '340ms',
    budgetLimit: '200ms',
    estimatedUserImpact: 'QA dashboards slow for enterprise-scale organizations.',
    recommendedImprovement: 'Pre-aggregate on sync · paginate findings display.',
  },
  {
    bottleneckType: 'slow-ai-response',
    metric: 'ai-response-times',
    severity: 'warning',
    description: 'Concierge routing chain averages 3.2s on complex queries.',
    measuredValue: '3.2s avg',
    budgetLimit: '2.0s avg',
    estimatedUserImpact: 'Command Dock feels unresponsive during AI-heavy workflows.',
    recommendedImprovement: 'Stream partial responses · cache frequent routing decisions.',
  },
  {
    bottleneckType: 'storage-bloat',
    metric: 'storage-utilization',
    severity: 'advisory',
    description: 'localStorage profiles total 4.2MB — approaching 5MB browser limit.',
    measuredValue: '4.2MB',
    budgetLimit: '3.5MB',
    estimatedUserImpact: 'Sync failures on storage-constrained devices.',
    recommendedImprovement: 'Prune stale profiles · compress version history.',
  },
  {
    bottleneckType: 'mobile-degradation',
    metric: 'mobile-performance',
    severity: 'critical',
    description: 'Mobile Lighthouse performance score 62 — below 80 budget.',
    measuredValue: 'Score 62',
    budgetLimit: 'Score 80',
    estimatedUserImpact: 'Mobile executives experience slow, non-premium Studio OS.',
    recommendedImprovement: 'Reduce initial bundle · optimize touch interaction paths.',
  },
  {
    bottleneckType: 'battery-drain',
    metric: 'battery-impact',
    severity: 'advisory',
    description: 'Continuous sync listeners prevent idle — elevated battery use on mobile.',
    measuredValue: 'High idle CPU',
    budgetLimit: 'Minimal idle',
    estimatedUserImpact: 'Battery drain during extended mobile sessions.',
    recommendedImprovement: 'Throttle background sync · pause when tab hidden.',
  },
];

export function buildMetricScores(organizationId: string): MetricMonitorScore[] {
  const interaction = getOrganizationInteractionEngineProfile(organizationId);
  const experience = getOrganizationExperienceQaProfile(organizationId);
  const accessibility = getOrganizationAccessibilityAuditorProfile(organizationId);

  const interactionScore = interaction?.engineScore ?? 82;
  const experienceScore = experience?.overallExperienceScore ?? 84;
  const a11yScore = accessibility?.overallAccessibilityScore ?? 86;

  const baseScores: Record<MonitorMetric, number> = {
    'page-load-times': Math.max(70, experienceScore - 8),
    'interaction-latency': interactionScore,
    'animation-smoothness': Math.max(72, interactionScore - 4),
    'rendering-performance': Math.max(74, experienceScore - 6),
    'memory-usage': 78,
    'cpu-usage': 76,
    'gpu-utilization': 80,
    'network-requests': 75,
    'api-response-times': 73,
    'database-queries': 79,
    'ai-response-times': 71,
    'storage-utilization': 77,
    'mobile-performance': Math.max(68, a11yScore - 10),
    'desktop-performance': Math.max(82, interactionScore + 2),
    'battery-impact': 74,
  };

  return MONITOR_METRICS.map((metric) => {
    const score = baseScores[metric];
    return {
      metric,
      label: MONITOR_METRIC_LABELS[metric],
      score,
      status: score >= 85 ? 'excellent' : score >= 72 ? 'watch' : 'degraded',
      summary: score >= 85 ? 'Within performance budget — fast and responsive.' : 'Optimization opportunity detected.',
    };
  });
}

export function buildPerformanceBottlenecks(organizationId: string): PerformanceBottleneck[] {
  void organizationId;
  const bottlenecks: PerformanceBottleneck[] = [];

  MODULE_SEEDS.forEach((mod, modIdx) => {
    const seeds = BOTTLENECK_SEEDS.filter((_, i) => (i + modIdx) % MODULE_SEEDS.length < 2 || modIdx === 0);
    seeds.slice(0, modIdx === 0 ? 3 : 1).forEach((seed, i) => {
      bottlenecks.push({
        ...seed,
        id: `perf-${mod.moduleId}-${seed.bottleneckType}-${i}`,
        bottleneckLabel: BOTTLENECK_LABELS[seed.bottleneckType],
        metricLabel: MONITOR_METRIC_LABELS[seed.metric],
        moduleId: mod.moduleId,
        moduleLabel: mod.moduleLabel,
      });
    });
  });

  return bottlenecks;
}

export function countBottlenecks(bottlenecks: PerformanceBottleneck[]): number {
  return bottlenecks.length;
}

export function countBudgetsExceeded(budgets: import('./types').PerformanceBudget[]): number {
  return budgets.filter((b) => b.status === 'exceeded').length;
}

export function computeOverallPerformanceScore(reports: import('./types').ModulePerformanceReport[]): number {
  if (reports.length === 0) return 82;
  return Math.round(reports.reduce((s, r) => s + r.performanceScore, 0) / reports.length);
}

export function deriveAverageSpeedTrend(reports: import('./types').ModulePerformanceReport[]): import('./types').SpeedTrend {
  const declining = reports.filter((r) => r.speedTrend === 'declining').length;
  const improving = reports.filter((r) => r.speedTrend === 'improving').length;
  if (declining > improving) return 'declining';
  if (improving > declining) return 'improving';
  return 'stable';
}
