import type { EventHistoryEntry, EventInspectorMetric, EventInspectorFilter } from './types';
import { filterEventHistory } from './event-history';

export function buildInspectorMetrics(history: EventHistoryEntry[]): EventInspectorMetric[] {
  const delivered = history.filter((e) => e.status === 'delivered').length;
  const failed = history.filter((e) => e.status === 'failed').length;
  const partial = history.filter((e) => e.status === 'partial').length;
  const avgLatency =
    history.length === 0
      ? 0
      : Math.round(history.reduce((s, e) => s + e.latencyMs, 0) / history.length);
  const replayable = history.filter((e) => e.replayable).length;

  return [
    {
      id: 'events-total',
      label: 'Events Monitored',
      value: `${history.length}`,
      status: history.length >= 5 ? 'healthy' : 'warning',
    },
    {
      id: 'delivery-rate',
      label: 'Delivery Rate',
      value: history.length ? `${Math.round((delivered / history.length) * 100)}%` : '—',
      status: delivered >= history.length * 0.9 ? 'healthy' : 'warning',
    },
    {
      id: 'avg-latency',
      label: 'Avg Latency',
      value: `${avgLatency}ms`,
      status: avgLatency <= 40 ? 'healthy' : avgLatency <= 80 ? 'warning' : 'critical',
    },
    {
      id: 'failures',
      label: 'Failed Events',
      value: `${failed}`,
      status: failed === 0 ? 'healthy' : 'critical',
    },
    {
      id: 'partial',
      label: 'Partial Delivery',
      value: `${partial}`,
      status: partial <= 2 ? 'healthy' : 'warning',
    },
    {
      id: 'replayable',
      label: 'Replayable',
      value: `${replayable}`,
      status: 'healthy',
    },
  ];
}

export function inspectEvents(
  history: EventHistoryEntry[],
  filter: EventInspectorFilter
): EventHistoryEntry[] {
  return filterEventHistory(history, filter);
}

export function measureEventLatency(entry: EventHistoryEntry): number {
  return entry.latencyMs;
}

export function debugEventFailure(entry: EventHistoryEntry): string | null {
  if (entry.status !== 'failed' && entry.status !== 'partial') return null;
  return entry.status === 'failed'
    ? `Event ${entry.eventId} failed — ${entry.subscriberCount} subscribers attempted. Check payload: ${entry.payloadSummary}`
    : `Event ${entry.eventId} partial delivery — some subscribers did not acknowledge.`;
}

export function summarizeInspectorState(history: EventHistoryEntry[]): string {
  const metrics = buildInspectorMetrics(history);
  const latency = metrics.find((m) => m.id === 'avg-latency')?.value ?? '—';
  const rate = metrics.find((m) => m.id === 'delivery-rate')?.value ?? '—';
  return `Event Inspector — ${history.length} events · ${rate} delivered · ${latency} avg latency.`;
}
