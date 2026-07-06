import { buildAutomationCatalog } from './automation-catalog';
import { EXECUTION_HISTORY_MAX } from './constants';
import type { AutomationExecutionRecord } from './types';

/** Seed execution history for dashboard and auditing. */
export function buildSeedExecutionHistory(): AutomationExecutionRecord[] {
  const catalog = buildAutomationCatalog();
  const now = Date.now();
  const seeds: Omit<AutomationExecutionRecord, 'executionId'>[] = [
    { automationId: 'command-dock.routing', automationName: 'Command Dock Intent Routing', executedAt: new Date(now - 3600000).toISOString(), status: 'succeeded', durationMs: 180, triggerSummary: 'Query: Show Event Bus status' },
    { automationId: 'organization-pulse.indicator-scan', automationName: 'Pulse Indicator Scan', executedAt: new Date(now - 7200000).toISOString(), status: 'succeeded', durationMs: 890, triggerSummary: 'Scheduled interval' },
    { automationId: 'workflow.event-bus-reaction', automationName: 'Event Bus Workflow Trigger', executedAt: new Date(now - 10800000).toISOString(), status: 'succeeded', durationMs: 45, triggerSummary: 'customer.created published' },
    { automationId: 'notification.rule-engine', automationName: 'Notification Rule Engine', executedAt: new Date(now - 14400000).toISOString(), status: 'succeeded', durationMs: 120, triggerSummary: 'pulse.alert event' },
    { automationId: 'documentation.registry-sync', automationName: 'Documentation Registry Sync', executedAt: new Date(now - 18000000).toISOString(), status: 'succeeded', durationMs: 650, triggerSummary: 'event-bus module registered' },
    { automationId: 'workflow.failed-recovery', automationName: 'Failed Automation Recovery', executedAt: new Date(now - 21600000).toISOString(), status: 'failed', durationMs: 1200, triggerSummary: 'Retry exhausted' },
    { automationId: 'workflow.autonomous-preparation', automationName: 'Autonomous Preparation Queue', executedAt: new Date(now - 25200000).toISOString(), status: 'partial', durationMs: 2100, triggerSummary: 'Executive briefing prep — awaiting approval', approvedBy: 'founder' },
    { automationId: 'command-dock.proactive-briefing', automationName: 'Headquarters Proactive Briefing', executedAt: new Date(now - 28800000).toISOString(), status: 'succeeded', durationMs: 320, triggerSummary: 'Mission Control entry' },
    { automationId: 'legacy-vault.auto-archive', automationName: 'Legacy Vault Auto-Archive', executedAt: new Date(now - 32400000).toISOString(), status: 'succeeded', durationMs: 540, triggerSummary: 'M130 milestone preserved' },
    { automationId: 'customer.followup-sequence', automationName: 'Customer Follow-up Sequence', executedAt: new Date(now - 36000000).toISOString(), status: 'succeeded', durationMs: 780, triggerSummary: 'Post-consult follow-up' },
  ];

  return seeds.map((s, i) => ({
    ...s,
    executionId: `exec-seed-${i + 1}`,
    automationName: catalog.find((a) => a.automationId === s.automationId)?.name ?? s.automationName,
  }));
}

export function filterExecutionsToday(history: AutomationExecutionRecord[]): AutomationExecutionRecord[] {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  return history.filter((e) => new Date(e.executedAt) >= startOfDay);
}

export function filterFailedToday(history: AutomationExecutionRecord[]): AutomationExecutionRecord[] {
  return filterExecutionsToday(history).filter((e) => e.status === 'failed');
}

export function appendExecutionHistory(
  history: AutomationExecutionRecord[],
  record: AutomationExecutionRecord
): AutomationExecutionRecord[] {
  return [record, ...history].slice(0, EXECUTION_HISTORY_MAX);
}
