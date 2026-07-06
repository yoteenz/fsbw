import { HEALTH_METRIC_IDS } from './constants';
import type { RuntimeHealthMetric } from './types';

/** Runtime health dashboard — performance, memory, automation, AI, storage, knowledge, errors, security. */
export function buildRuntimeHealthMetrics(): RuntimeHealthMetric[] {
  const metrics: Omit<RuntimeHealthMetric, 'metricId'>[] = [
    { label: 'Performance', scorePct: 94, detail: 'Headquarters response · module sync latency', status: 'healthy', trend: 'stable' },
    { label: 'Memory Usage', scorePct: 82, detail: 'Memory Engine · Knowledge Fabric node count', status: 'healthy', trend: 'up' },
    { label: 'Automation Load', scorePct: 76, detail: '12 active automations · 3 paused', status: 'warning', trend: 'up' },
    { label: 'AI Requests', scorePct: 88, detail: 'Model Orchestrator · 420 requests today', status: 'healthy', trend: 'stable' },
    { label: 'Storage', scorePct: 91, detail: 'Assets · Legacy Vault · localStorage scoped', status: 'healthy', trend: 'stable' },
    { label: 'Knowledge Growth', scorePct: 86, detail: 'Knowledge Fabric +15 nodes this week', status: 'healthy', trend: 'up' },
    { label: 'Errors', scorePct: 97, detail: '2 non-critical errors · 0 critical', status: 'healthy', trend: 'down' },
    { label: 'Security Events', scorePct: 95, detail: 'Permission Engine · 0 cross-org attempts', status: 'healthy', trend: 'stable' },
    { label: 'Integration Health', scorePct: 93, detail: 'Event Bus · sync chain M136 healthy', status: 'healthy', trend: 'stable' },
  ];

  return HEALTH_METRIC_IDS.map((id, i) => ({
    metricId: id,
    ...metrics[i],
  }));
}

export function computeHealthDashboardScore(metrics: RuntimeHealthMetric[]): number {
  if (metrics.length === 0) return 0;
  return Math.min(99, Math.round(metrics.reduce((s, m) => s + m.scorePct, 0) / metrics.length));
}

export function detectIncreasedActivity(metrics: RuntimeHealthMetric[]): boolean {
  return metrics.some((m) => m.trend === 'up' && (m.metricId === 'automation-load' || m.metricId === 'ai-requests'));
}
