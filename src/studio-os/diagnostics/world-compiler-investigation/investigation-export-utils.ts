/**
 * Shared investigation export helpers (no browser APIs).
 */
import type { CompilerInvestigationEvent } from './types';

export const MILESTONE_ORDER = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7'] as const;

export function getLoadShellMilestonesFromEvents(events: readonly CompilerInvestigationEvent[]): CompilerInvestigationEvent[] {
  return events.filter((e) => e.type === 'LOAD_SHELL_MILESTONE');
}

export function buildMilestoneTimeline(events: readonly CompilerInvestigationEvent[]): Array<Record<string, unknown>> {
  const milestones = getLoadShellMilestonesFromEvents(events);
  const byId = new Map<string, CompilerInvestigationEvent>();
  for (const ev of milestones) {
    const id = String(ev.detail?.milestone ?? ev.stageName ?? '').replace('load-shell-', '');
    if (id) byId.set(id, ev);
  }
  return MILESTONE_ORDER.map((id) => {
    const ev = byId.get(id);
    if (!ev) {
      return { milestone: id, status: 'missing', timestamp: null, compileRunId: null };
    }
    return {
      milestone: id,
      status: ev.detail?.milestoneState ?? ev.status ?? 'unknown',
      timestamp: ev.isoTime,
      elapsedMs: ev.detail?.elapsedMs ?? null,
      compileRunId: ev.compileRunId,
      previewSessionId: ev.detail?.previewSessionId ?? null,
      detail: ev.detail,
    };
  });
}

export function deriveMilestoneSummary(timeline: Array<Record<string, unknown>>): {
  lastSuccessful: string | null;
  firstMissingOrFailed: string | null;
} {
  let lastSuccessful: string | null = null;
  let firstMissingOrFailed: string | null = null;
  for (const row of timeline) {
    const id = String(row.milestone);
    const status = String(row.status);
    if (status === 'success') lastSuccessful = id;
    if (!firstMissingOrFailed && (status === 'missing' || status === 'failure' || status === 'pending')) {
      firstMissingOrFailed = `${id} (${status})`;
    }
  }
  return { lastSuccessful, firstMissingOrFailed };
}
