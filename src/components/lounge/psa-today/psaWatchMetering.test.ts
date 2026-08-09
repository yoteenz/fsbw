import { describe, expect, it } from 'vitest';
import {
  createWatchMeterState,
  shouldConsumeWatch,
  tickWatchMeter,
  totalQualifyingSeconds,
  type WatchMeterState,
  type WatchMeterTickInput,
} from './psaWatchMetering';

const THRESHOLD = 200; // ~33% of 600s lesson

const PLAYING: Omit<WatchMeterTickInput, 'currentTimeSec'> = {
  playing: true,
  seeking: false,
  buffering: false,
  tabVisible: true,
};

/** Simulate incremental playback samples (1s steps) — matches real player polling. */
function simulatePlayback(fromSec: number, toSec: number, initial?: WatchMeterState): WatchMeterState {
  let s = initial ?? createWatchMeterState();
  const start = Math.floor(fromSec);
  const end = Math.floor(toSec);
  for (let t = start; t <= end; t += 1) {
    s = tickWatchMeter(s, { currentTimeSec: t, ...PLAYING }, THRESHOLD);
  }
  return s;
}

describe('psaWatchMetering', () => {
  it('does not accumulate when paused (CASE 1)', () => {
    let s = simulatePlayback(0, 5);
    s = tickWatchMeter(s, { currentTimeSec: 5, playing: false, seeking: false, buffering: false, tabVisible: true }, THRESHOLD);
    expect(s.accumulatedSec).toBeLessThan(10);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, s.qualified)).toBe(false);
  });

  it('does not consume at 20% (CASE 2)', () => {
    const s = simulatePlayback(0, 120);
    expect(s.accumulatedSec).toBeGreaterThanOrEqual(119);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, false)).toBe(false);
  });

  it('consumes at 34% actual playback (CASE 3)', () => {
    const s = simulatePlayback(0, 204);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, false)).toBe(true);
    expect(s.qualified).toBe(true);
  });

  it('consumes at 50% (CASE 4)', () => {
    const s = simulatePlayback(0, 300);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, false)).toBe(true);
    expect(s.qualified).toBe(true);
  });

  it('consumes at 100% (CASE 5)', () => {
    const s = simulatePlayback(0, 600);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, false)).toBe(true);
    expect(s.qualified).toBe(true);
  });

  it('still only one watch after pause resume finish (CASE 6)', () => {
    let s = simulatePlayback(0, 204);
    expect(s.qualified).toBe(true);
    s = tickWatchMeter(s, { currentTimeSec: 204, playing: false, seeking: false, buffering: false, tabVisible: true }, THRESHOLD);
    s = simulatePlayback(204, 600, s);
    expect(s.qualified).toBe(true);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, true)).toBe(false);
  });

  it('seek then 5s does not qualify (CASE 7)', () => {
    let s = createWatchMeterState();
    s = tickWatchMeter(s, { currentTimeSec: 300, playing: true, seeking: true, buffering: false, tabVisible: true }, THRESHOLD);
    s = simulatePlayback(300, 305, s);
    expect(s.accumulatedSec).toBeLessThan(10);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, false)).toBe(false);
  });

  it('accumulates pending across resume (CASE 8)', () => {
    const pending = 108; // ~18% of 600
    const s = simulatePlayback(0, 102);
    const sessionPart = s.accumulatedSec;
    expect(totalQualifyingSeconds(pending, sessionPart)).toBeGreaterThanOrEqual(THRESHOLD);
    expect(shouldConsumeWatch(pending, sessionPart, THRESHOLD, false)).toBe(true);
  });

  it('ignores large forward jumps (CASE 16)', () => {
    let s = createWatchMeterState();
    s = tickWatchMeter(s, { currentTimeSec: 0, ...PLAYING }, THRESHOLD);
    s = tickWatchMeter(s, { currentTimeSec: 400, ...PLAYING }, THRESHOLD);
    expect(s.accumulatedSec).toBeLessThan(5);
  });

  it('threshold only fires once (CASE 17/18)', () => {
    let s = simulatePlayback(0, 210);
    expect(s.qualified).toBe(true);
    s = simulatePlayback(210, 400, s);
    expect(s.qualified).toBe(true);
    expect(shouldConsumeWatch(0, s.accumulatedSec, THRESHOLD, true)).toBe(false);
  });
});
