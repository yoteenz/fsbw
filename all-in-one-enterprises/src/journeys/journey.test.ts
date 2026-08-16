import { describe, expect, it } from 'vitest';
import {
  aggregateStatuses,
  isStepComplete,
  mapRoadReadyStatus,
  stepCountsForProgress,
} from './journeyStatusMap';

describe('journeyStatusMap', () => {
  it('maps road ready statuses to journey statuses', () => {
    expect(mapRoadReadyStatus('completed')).toBe('complete');
    expect(mapRoadReadyStatus('action_needed')).toBe('action_required');
    expect(mapRoadReadyStatus('not_applicable')).toBe('not_applicable');
  });

  it('aggregates with action_required priority', () => {
    expect(aggregateStatuses(['complete', 'in_progress', 'action_required'])).toBe('action_required');
  });

  it('calculates progress from applicable required steps', () => {
    const result = stepCountsForProgress([
      { status: 'complete', optional: false, applicable: true },
      { status: 'in_progress', optional: false, applicable: true },
      { status: 'not_started', optional: true, applicable: true },
      { status: 'not_applicable', optional: false, applicable: false },
    ]);
    expect(result.total).toBe(2);
    expect(result.completed).toBe(1);
    expect(result.percent).toBe(50);
  });

  it('treats not_applicable as complete for progress', () => {
    expect(isStepComplete('not_applicable')).toBe(true);
  });
});
