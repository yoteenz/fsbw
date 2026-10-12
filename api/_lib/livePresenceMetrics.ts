/** Safe, non-PII metrics for admin live-presence (server logs only). */

export type LivePresenceMetricEvent = {
  kind: 'live_presence';
  cacheHit: boolean;
  stale: boolean;
  queryDurationMs: number | null;
  rowCount: number | null;
  visitorCount: number;
  timeout: boolean;
  error: boolean;
  rateLimited: boolean;
  inFlightCoalesced: boolean;
};

export function logLivePresenceMetric(event: LivePresenceMetricEvent): void {
  try {
    console.info('[live-presence/metrics]', JSON.stringify(event));
  } catch {
    // ignore
  }
}
