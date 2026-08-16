import type {
  IntegrationConnection,
  IntegrationHealthState,
  IntegrationOperation,
  IntegrationWebhookEvent,
} from './integrationTypes';

const HEALTH_SUCCESS_WINDOW_MS = 24 * 60 * 60 * 1000;
const HEALTH_DEGRADED_FAILURE_THRESHOLD = 2;
const HEALTH_OFFLINE_FAILURE_THRESHOLD = 5;

export function evaluateConnectionHealth(
  connection: IntegrationConnection,
  operations: IntegrationOperation[],
  webhooks: IntegrationWebhookEvent[],
): IntegrationHealthState {
  if (connection.status === 'DISABLED') return 'OFFLINE';
  if (connection.status === 'NOT_CONFIGURED' || connection.status === 'CONFIGURING') return 'UNKNOWN';
  if (connection.status === 'AUTHORIZATION_REQUIRED' || connection.status === 'REAUTHORIZATION_REQUIRED') {
    return 'ACTION_REQUIRED';
  }

  const since = Date.now() - HEALTH_SUCCESS_WINDOW_MS;
  const recentOps = operations.filter(
    (o) => o.connectionId === connection.id && new Date(o.startedAt).getTime() >= since,
  );
  const recentWebhooks = webhooks.filter(
    (w) => w.connectionId === connection.id && new Date(w.receivedAt).getTime() >= since,
  );

  const successes = recentOps.filter((o) => o.status === 'SUCCEEDED').length
    + recentWebhooks.filter((w) => w.status === 'PROCESSED').length;
  const failures = recentOps.filter((o) => o.status === 'FAILED').length
    + recentWebhooks.filter((w) => w.status === 'REJECTED').length;

  if (connection.lastVerifiedAt && successes === 0 && failures === 0) {
    const verifiedAge = Date.now() - new Date(connection.lastVerifiedAt).getTime();
    if (verifiedAge < HEALTH_SUCCESS_WINDOW_MS) return 'HEALTHY';
  }

  if (failures >= HEALTH_OFFLINE_FAILURE_THRESHOLD) return 'OFFLINE';
  if (failures >= HEALTH_DEGRADED_FAILURE_THRESHOLD) return 'DEGRADED';
  if (successes > 0) return 'HEALTHY';
  if (connection.status === 'ERROR') return 'ACTION_REQUIRED';
  if (connection.status === 'CONNECTED') return connection.lastSuccessfulOperationAt ? 'HEALTHY' : 'UNKNOWN';
  return 'UNKNOWN';
}

export interface IntegrationHealthSummary {
  healthy: number;
  degraded: number;
  actionRequired: number;
  offline: number;
  unknown: number;
}

export function summarizeIntegrationHealth(states: IntegrationHealthState[]): IntegrationHealthSummary {
  const summary: IntegrationHealthSummary = {
    healthy: 0,
    degraded: 0,
    actionRequired: 0,
    offline: 0,
    unknown: 0,
  };
  for (const s of states) {
    if (s === 'HEALTHY') summary.healthy++;
    else if (s === 'DEGRADED') summary.degraded++;
    else if (s === 'ACTION_REQUIRED') summary.actionRequired++;
    else if (s === 'OFFLINE') summary.offline++;
    else summary.unknown++;
  }
  return summary;
}

export function computeDataFreshness(fetchedAt: string, staleAfterMs = 30 * 24 * 60 * 60 * 1000): 'CURRENT' | 'STALE' | 'UNKNOWN' {
  const parsed = new Date(fetchedAt);
  if (Number.isNaN(parsed.getTime())) return 'UNKNOWN';
  return Date.now() - parsed.getTime() > staleAfterMs ? 'STALE' : 'CURRENT';
}
