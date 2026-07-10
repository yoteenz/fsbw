import type { FlightRecorderEvent, SessionForensicReport } from './types';
import { buildEventTimeline, formatTimelineVertical } from './event-timeline/timeline';
import { buildOwnershipReport } from './state-monitor/ownership-registry';
import { getSubscriptionGraph, detectSubscriptionLoops } from './subscription-graph/graph';
import { getTimerInventory } from './timer-inventory/timer-hook';
import { captureEnvironmentSnapshot } from './environment-diff/capture';

function rootCauseCandidates(report: SessionForensicReport, events: FlightRecorderEvent[]): string[] {
  const candidates: string[] = [];
  if (report.timeline.firstMissingEvent) {
    candidates.push(`Missing expected event: ${report.timeline.firstMissingEvent}`);
  }
  if (report.firstAbnormalEvent) {
    candidates.push(
      `First abnormal: ${report.firstAbnormalEvent.type} at ${report.firstAbnormalEvent.isoTime} (${report.firstAbnormalEvent.source})`
    );
  }
  if (report.subscriptionLoops.length > 0) {
    candidates.push(`Subscription loops detected (${report.subscriptionLoops.length})`);
  }
  const threeSec = report.timerInventory.filter(
    (t) => t.intervalMs != null && t.intervalMs >= 2500 && t.intervalMs <= 3500
  );
  if (threeSec.length > 0) {
    candidates.push(`~3s timers registered: ${threeSec.length}`);
  }
  const compilerResets = events.filter((e) => e.type === 'COMPILER_RESET');
  if (compilerResets.length > 0) {
    candidates.push(`Compiler resets: ${compilerResets.length}`);
  }
  const hbStop = events.find((e) => e.type === 'HEARTBEAT_STOPPED' || e.type === 'HEARTBEAT_TIMEOUT');
  if (hbStop) {
    candidates.push(`Heartbeat stopped at ${hbStop.isoTime}`);
  }
  if (candidates.length === 0) {
    candidates.push('No dominant root cause candidate — review full timeline.');
  }
  return candidates;
}

/** ChatGPT-ready Markdown forensic report. */
export async function buildMarkdownFlightReport(
  events: FlightRecorderEvent[],
  report?: SessionForensicReport | null
): Promise<string> {
  const env = await captureEnvironmentSnapshot('report-export');
  const timeline = buildEventTimeline(events);
  const ownership = buildOwnershipReport();
  const subs = getSubscriptionGraph();
  const loops = detectSubscriptionLoops();
  const timers = getTimerInventory();
  const errors = events.filter((e) =>
    ['ERROR', 'RUNTIME_ERROR', 'UNCAUGHT_EXCEPTION', 'UNHANDLED_REJECTION', 'ERROR_BOUNDARY'].includes(e.type)
  );
  const compilerEvents = events.filter((e) =>
    e.type.includes('COMPILER') || e.type.includes('WORLD_COMPILER') || e.type === 'LANDMARK_GENERATED'
  );
  const heartbeatEvents = events.filter((e) => e.type.startsWith('HEARTBEAT'));
  const candidates = rootCauseCandidates(
    report ?? {
      sessionId: events[0]?.sessionId ?? 'unknown',
      generatedAt: new Date().toISOString(),
      bootCompleted: events.some((e) => e.type === 'BOOT_COMPLETED'),
      heartbeatDurationMs: null,
      compilerDurationMs: null,
      registryUpdateCount: 0,
      sceneStackUpdateCount: 0,
      reactRemountCount: 0,
      errorCount: errors.length,
      warningCount: 0,
      finalSuccessfulEvent: timeline.finalSuccessfulEvent,
      firstAbnormalEvent: timeline.firstAbnormalEvent,
      firstIrreversibleFailure: timeline.firstAbnormalEvent,
      failureClassification: null,
      timeline,
      environmentDiff: null,
      ownershipConflicts: ownership,
      timerInventory: timers,
      subscriptionGraph: subs,
      subscriptionLoops: loops,
      evidenceOnly: true,
    },
    events
  );

  const lines: string[] = [
    '# Studio OS Black Box Flight Report',
    '',
    '## Environment',
    `- Browser: ${env.userAgent}`,
    `- Device platform: ${env.navigator.platform ?? 'unknown'}`,
    `- URL: ${env.url}`,
    `- Session ID: ${events[0]?.sessionId ?? 'unknown'}`,
    `- Bundle: ${events[0]?.bundleVersion ?? env.bundleVersion ?? 'unknown'}`,
    `- Report generated: ${new Date().toISOString()}`,
    '',
    '## Timeline',
    '```',
    formatTimelineVertical(events, 120),
    '```',
    '',
    timeline.gapDescription ? `**Gap:** ${timeline.gapDescription}` : '',
    '',
    '## Errors',
    errors.length
      ? errors.map((e) => `- ${e.isoTime} **${e.type}** ← ${e.source}: ${JSON.stringify(e.detail ?? {})}`).join('\n')
      : '- (none recorded)',
    '',
    '## Heartbeat history',
    heartbeatEvents.length
      ? heartbeatEvents.map((e) => `- ${e.isoTime} ${e.type}`).join('\n')
      : '- (none recorded)',
    '',
    '## Compiler state',
    compilerEvents.length
      ? compilerEvents.map((e) => `- ${e.isoTime} ${e.type} ← ${e.source}`).join('\n')
      : '- (none recorded)',
    '',
    '## State ownership',
    '```json',
    JSON.stringify(ownership, null, 2),
    '```',
    '',
    '## Subscriptions',
    '```json',
    JSON.stringify(subs, null, 2),
    '```',
    '',
    '## Subscription loops',
    loops.length ? JSON.stringify(loops, null, 2) : '[]',
    '',
    '## Timers',
    '```json',
    JSON.stringify(timers.slice(-40), null, 2),
    '```',
    '',
    '## Root cause candidates',
    candidates.map((c) => `- ${c}`).join('\n'),
    '',
    '---',
    '_Evidence only — Studio OS Black Box Flight Recorder™_',
  ];

  return lines.filter(Boolean).join('\n');
}
