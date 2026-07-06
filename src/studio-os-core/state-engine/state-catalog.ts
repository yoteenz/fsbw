import { LIFECYCLE_STATES } from './constants';
import type { LifecycleState, LifecycleStateEntry } from './types';

const STATE_META: Record<
  LifecycleState,
  { label: string; description: string; terminal: boolean }
> = {
  draft: { label: 'Draft', description: 'Initial creation — not yet submitted for review.', terminal: false },
  pending: { label: 'Pending', description: 'Awaiting next action or system processing.', terminal: false },
  scheduled: { label: 'Scheduled', description: 'Queued for future activation at defined time.', terminal: false },
  waiting: { label: 'Waiting', description: 'Blocked on external input, approval, or dependency.', terminal: false },
  review: { label: 'Review', description: 'Under human or executive review before decision.', terminal: false },
  approved: { label: 'Approved', description: 'Passed review — ready for publish or activation.', terminal: false },
  rejected: { label: 'Rejected', description: 'Failed review — requires revision or cancellation.', terminal: false },
  published: { label: 'Published', description: 'Live and visible to intended audience.', terminal: false },
  active: { label: 'Active', description: 'Currently running or in operational use.', terminal: false },
  paused: { label: 'Paused', description: 'Temporarily suspended — can resume to active.', terminal: false },
  completed: { label: 'Completed', description: 'Successfully finished — eligible for archive.', terminal: false },
  archived: { label: 'Archived', description: 'Preserved in Legacy Vault — read-only history.', terminal: true },
  deleted: { label: 'Deleted', description: 'Soft-deleted — recoverable within retention window.', terminal: true },
  failed: { label: 'Failed', description: 'Execution or process failure — requires intervention.', terminal: false },
  cancelled: { label: 'Cancelled', description: 'Intentionally stopped before completion.', terminal: true },
  expired: { label: 'Expired', description: 'Past validity window — no longer actionable.', terminal: true },
  hidden: { label: 'Hidden', description: 'Not visible in default views — internal only.', terminal: false },
  locked: { label: 'Locked', description: 'Immutable — no transitions until unlocked.', terminal: false },
  deprecated: { label: 'Deprecated', description: 'Superseded by newer version — read-only reference.', terminal: true },
};

export function buildLifecycleStateCatalog(): LifecycleStateEntry[] {
  return LIFECYCLE_STATES.map((state) => ({
    state,
    extensible: true as const,
    ...STATE_META[state],
  }));
}

export function getStateById(state: LifecycleState): LifecycleStateEntry | undefined {
  return buildLifecycleStateCatalog().find((s) => s.state === state);
}

export function countNonTerminalStates(): number {
  return buildLifecycleStateCatalog().filter((s) => !s.terminal).length;
}
