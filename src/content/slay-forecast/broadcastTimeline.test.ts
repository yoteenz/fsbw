import { describe, expect, it } from 'vitest';
import { SLAY_FORECAST_EDITIONS } from './editions';
import {
  buildBroadcastTimeline,
  getVisibleBeats,
  resolveBroadcastPhase,
  resolveExperienceMode,
} from './broadcastTimeline';

describe('broadcastTimeline', () => {
  const edition = SLAY_FORECAST_EDITIONS.find((e) => e.id === 'forecast-2026-08-10')!;

  it('builds beats from primary + observations', () => {
    const timeline = buildBroadcastTimeline(edition);
    expect(timeline.beats.length).toBeGreaterThan(1);
    expect(timeline.beats[0]?.kind).toBe('primary');
    expect(timeline.clearStart).toBeLessThan(timeline.closingStart);
  });

  it('keeps graphics out of opening and closing', () => {
    const timeline = buildBroadcastTimeline(edition);
    expect(getVisibleBeats(2, 'opening', timeline)).toHaveLength(0);
    expect(getVisibleBeats(timeline.closingStart + 0.1, 'closing', timeline)).toHaveLength(0);
  });

  it('reveals beats sequentially during hold', () => {
    const timeline = buildBroadcastTimeline(edition);
    const earlyHold = timeline.openingEnd + 0.05;
    const lateHold = timeline.clearStart - 0.2;
    const earlyCount = getVisibleBeats(earlyHold, 'hold', timeline).length;
    const lateCount = getVisibleBeats(lateHold, 'hold', timeline).length;
    expect(lateCount).toBeGreaterThanOrEqual(earlyCount);
  });

  it('maps experience modes', () => {
    expect(resolveExperienceMode(false, 'idle')).toBe('poster');
    expect(resolveExperienceMode(true, 'opening')).toBe('playing');
    expect(resolveExperienceMode(true, 'end')).toBe('ended');
  });

  it('resolves phases from time', () => {
    const timeline = buildBroadcastTimeline(edition);
    expect(resolveBroadcastPhase(1, timeline)).toBe('opening');
    expect(resolveBroadcastPhase(timeline.openingEnd + 0.5, timeline)).toBe('hold');
    expect(resolveBroadcastPhase(timeline.closingStart + 0.1, timeline)).toBe('closing');
    expect(resolveBroadcastPhase(timeline.closingEnd, timeline)).toBe('end');
  });
});
