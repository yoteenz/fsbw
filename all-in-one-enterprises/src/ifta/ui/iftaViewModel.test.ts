import { describe, expect, it, vi } from 'vitest';
import { createDemoSeed } from '../../demo/demoSeed';
import { findCaseById } from '../iftaRouteHelpers';
import { staffBucket } from '../iftaDerive';
import { IFTA_ASSET_MANIFEST, IFTA_BRAND, IFTA_MEDIA } from './iftaAssetManifest';
import {
  LANE_ORDER,
  PUBLIC_SAMPLE_QUARTER,
  checklistRows,
  clientTasks,
  filingPhases,
  fuelShares,
  mileageShares,
  quarterMetrics,
  queueLanes,
  queueSummary,
  recentActivity,
  recentUploads,
  riskFlags,
  staffTasks,
} from './iftaViewModel';

const NOW = new Date('2026-10-06T15:00:00.000Z');

function seed() {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(NOW);
  const store = createDemoSeed();
  vi.useRealTimers();
  return store;
}

describe('IFTA view model — authority modules bind to the canonical case only', () => {
  const store = seed();
  const pioneer = findCaseById(store, 'ifta-client-c-2026-q3')!;

  it('metrics: miles / gallons / jurisdictions from records; tax stays PENDING without a staff return summary (D-TAX-FIGURES)', () => {
    const m = quarterMetrics(pioneer);
    expect(m.miles).toBeGreaterThan(0);
    expect(m.gallons).toBeGreaterThan(0);
    expect(m.jurisdictions).toBeGreaterThan(0);
    expect(pioneer.returnSummary).toBeUndefined();
    expect(m.tax.kind).toBe('PENDING');
  });

  it('shares always sum to 100 and fold the tail into OTHER', () => {
    for (const shares of [mileageShares(pioneer), fuelShares(pioneer), mileageShares(pioneer, 2)]) {
      expect(shares.reduce((s, x) => s + x.pct, 0)).toBe(100);
    }
    const two = mileageShares(pioneer, 2);
    expect(two.at(-1)!.code).toBe('OTHER');
  });

  it('four reference phases map over the contract states (D-PROGRESS-PHASES); NEEDS_CLIENT blocks data collection', () => {
    const phases = filingPhases(pioneer, NOW, 'CLIENT');
    expect(phases.map((p) => p.label)).toEqual(['Data collection', 'AIO preparation', 'Your review & approval', 'File & confirm']);
    expect(phases[0].status).toBe('blocked');
    expect(phases.slice(1).every((p) => p.status === 'upcoming')).toBe(true);
    expect(filingPhases(pioneer, NOW, 'STAFF')[0].statusLabel).toBe('Waiting on client');
  });

  it('six checklist rows map to the six client tabs (no NOTES)', () => {
    const rows = checklistRows(pioneer, NOW);
    expect(rows).toHaveLength(6);
    expect(new Set(rows.map((r) => r.tab))).not.toContain('NOTES');
  });

  it('client tasks are client-safe; staff tasks add discrepancies and correction requests', () => {
    const client = clientTasks(pioneer, NOW);
    expect(client.every((t) => t.owner === 'CLIENT')).toBe(true);
    const staff = staffTasks(pioneer, NOW);
    expect(staff.length).toBeGreaterThanOrEqual(client.length);
    expect(staff.some((t) => t.owner === 'AIO')).toBe(true);
  });

  it('uploads, activity and flags come from the record (newest first)', () => {
    const uploads = recentUploads(pioneer, 10);
    expect(uploads.length).toBeGreaterThan(0);
    expect([...uploads].sort((a, b) => b.at.localeCompare(a.at))).toEqual(uploads);
    const activity = recentActivity(pioneer, 10);
    expect(activity.map((a) => a.at)).toEqual([...activity.map((a) => a.at)].sort().reverse());
    expect(recentActivity(pioneer, 10, 'CLIENT').every((a) => a.actor === 'CLIENT')).toBe(true);
    expect(riskFlags(pioneer, NOW).length).toBeGreaterThan(0);
  });

  it('queue lanes keep every case exactly once, in lane priority order', () => {
    const cases = store.iftaQuarters ?? [];
    const lanes = queueLanes(cases, NOW);
    expect(lanes.flatMap((l) => l.cases)).toHaveLength(cases.length);
    expect(lanes.map((l) => l.bucket)).toEqual(LANE_ORDER.filter((b) => lanes.some((l) => l.bucket === b)));
    for (const l of lanes) for (const q of l.cases) expect(staffBucket(q, NOW)).toBe(l.bucket);
    const summary = queueSummary(cases, NOW);
    expect(Object.values(summary.counts).reduce((s, n) => s + n, 0)).toBe(cases.length);
  });

  it('public figures are a static labelled sample, never a client record (D-PUBLIC-SAMPLE-DATA)', () => {
    expect(PUBLIC_SAMPLE_QUARTER.miles).toBe(48320);
    expect(quarterMetrics(pioneer).miles).not.toBe(PUBLIC_SAMPLE_QUARTER.miles);
  });

  it('every runtime media / brand asset is in the manifest with its approved source', () => {
    const assets = new Set(IFTA_ASSET_MANIFEST.map((a) => a.asset));
    for (const path of [...Object.values(IFTA_BRAND), ...Object.values(IFTA_MEDIA)]) expect(assets.has(path), path).toBe(true);
    for (const a of IFTA_ASSET_MANIFEST) expect(a.source).toMatch(/approved|AUTHORITY|NAV_MARK/);
  });
});
