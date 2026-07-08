import { FORK_ACTION_LABELS } from './constants';
import type { ForkAction, ForkRecord } from './types';

function uid(): string {
  return `fork-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

export function recordForkAction(
  parentInnovationId: string,
  childInnovationId: string,
  action: ForkAction,
  actorName: string
): ForkRecord {
  return {
    id: uid(),
    parentInnovationId,
    childInnovationId,
    action,
    actionLabel: FORK_ACTION_LABELS[action],
    actorName,
    at: new Date().toISOString(),
    lineagePreserved: true,
  };
}

export function buildDemoForkRecords(): ForkRecord[] {
  return [
    recordForkAction('INNOV-HOSP-01', 'INNOV-RETL-02', 'fork', 'Founder A'),
    recordForkAction('INNOV-RETL-02', 'INNOV-HQ-04', 'merge', 'Founder'),
    recordForkAction('INNOV-AUTO-03', 'INNOV-HQ-04', 'merge', 'Marcus Chen'),
    recordForkAction('INNOV-HQ-04', 'INNOV-HQ-04-FORK', 'improve', 'Founder'),
    recordForkAction('INNOV-HQ-04-FORK', 'INNOV-HQ-04-V2', 'republish', 'Founder'),
  ];
}

export function summarizeForkLineage(records: ForkRecord[]): string {
  return `${records.length} fork actions — lineage preserved on every ${[...new Set(records.map((r) => r.actionLabel))].join(', ')}`;
}
