import type { RoadReadyItem, RoadReadyItemStatus } from '../road-ready/roadReadyTypes';
import type { JourneyStepStatus } from './journeyTypes';

const STATUS_PRIORITY: JourneyStepStatus[] = [
  'action_required',
  'waiting_partner',
  'waiting_aio',
  'in_progress',
  'ready',
  'not_started',
  'complete',
  'not_applicable',
];

/** Priority order for aggregating applicable (non-NA) statuses. */
const APPLICABLE_STATUS_PRIORITY = STATUS_PRIORITY.filter(
  (s): s is Exclude<JourneyStepStatus, 'not_applicable'> => s !== 'not_applicable',
);

export function mapRoadReadyStatus(status: RoadReadyItemStatus): JourneyStepStatus {
  switch (status) {
    case 'completed':
      return 'complete';
    case 'in_progress':
      return 'in_progress';
    case 'action_needed':
      return 'action_required';
    case 'needs_review':
      return 'waiting_aio';
    case 'not_applicable':
      return 'not_applicable';
    case 'not_started':
    default:
      return 'not_started';
  }
}

export function aggregateStatuses(statuses: JourneyStepStatus[]): JourneyStepStatus {
  if (statuses.length === 0) return 'not_started';
  if (statuses.every((s) => s === 'not_applicable')) return 'not_applicable';
  const applicable = statuses.filter((s) => s !== 'not_applicable');
  if (applicable.length === 0) return 'not_applicable';
  if (applicable.every((s) => s === 'complete')) return 'complete';
  for (const p of APPLICABLE_STATUS_PRIORITY) {
    if (applicable.includes(p)) return p;
  }
  return 'not_started';
}

export function statusForKeys(keys: string[], items: RoadReadyItem[]): JourneyStepStatus {
  const matched = items.filter((i) => keys.includes(i.requirementKey));
  if (matched.length === 0) return 'not_started';
  const applicable = matched.filter((i) => i.applicable !== false && i.status !== 'not_applicable');
  if (applicable.length === 0) return 'not_applicable';
  return aggregateStatuses(applicable.map((i) => mapRoadReadyStatus(i.status)));
}

export function ctaForStatus(status: JourneyStepStatus, route: string): { label: string; route: string } {
  switch (status) {
    case 'complete':
      return { label: 'View Details', route };
    case 'in_progress':
    case 'action_required':
    case 'waiting_aio':
    case 'waiting_partner':
      return { label: 'Continue', route };
    case 'not_applicable':
      return { label: 'Learn More', route };
    case 'ready':
    case 'not_started':
    default:
      return { label: 'Start', route };
  }
}

export function isStepComplete(status: JourneyStepStatus): boolean {
  return status === 'complete' || status === 'not_applicable';
}

export function stepCountsForProgress(
  statuses: { status: JourneyStepStatus; optional?: boolean; applicable: boolean }[],
): { completed: number; total: number; percent: number } {
  const counted = statuses.filter((s) => s.applicable && !s.optional);
  const total = counted.length;
  if (total === 0) return { completed: 0, total: 0, percent: 0 };
  const completed = counted.filter((s) => isStepComplete(s.status)).length;
  return { completed, total, percent: Math.round((completed / total) * 100) };
}
