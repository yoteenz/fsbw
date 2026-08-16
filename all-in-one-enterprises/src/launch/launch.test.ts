import { describe, expect, it } from 'vitest';
import {
  evaluateLaunchReadiness,
  canEnterLaunchPreparation,
  canExitPilot,
  getLaunchBlockers,
  getOpenP0Blockers,
  canCustomerStartService,
  getPublicServiceCta,
  SERVICE_LAUNCH_MATRIX,
  CURRENT_LAUNCH_MODE,
  runBrandAudit,
  CANONICAL_BRAND,
  getTrainingCompletionSummary,
} from './index';
import { isStandaloneExtractionComplete } from '../qa/extractionGate';

describe('launch readiness', () => {
  it('standalone extraction complete', () => {
    expect(isStandaloneExtractionComplete().complete).toBe(true);
  });

  it('evaluateLaunchReadiness returns blocked with open P0', () => {
    const result = evaluateLaunchReadiness();
    expect(result.status).not.toBe('READY');
    expect(getOpenP0Blockers().length).toBeGreaterThan(0);
  });

  it('public launch recommendation is not PUBLIC_LAUNCH_READY by default', () => {
    const result = evaluateLaunchReadiness();
    expect(result.recommendation).not.toBe('PUBLIC_LAUNCH_READY');
  });

  it('launch mode is INTERNAL', () => {
    expect(CURRENT_LAUNCH_MODE).toBe('INTERNAL');
  });

  it('canExitPilot blocked with P0 open', () => {
    const exit = canExitPilot();
    expect(exit.allowed).toBe(false);
  });

  it('launch blockers have required fields', () => {
    const blockers = getLaunchBlockers();
    expect(blockers.length).toBeGreaterThan(5);
    expect(blockers.every((b) => b.id && b.severity && b.requiredAction)).toBe(true);
  });
});

describe('service activation', () => {
  it('brokerage blocked for customers', () => {
    expect(canCustomerStartService('brokerage')).toBe(false);
    expect(getPublicServiceCta('brokerage').state).toBe('BLOCKED');
  });

  it('dispatch GO allows customer start', () => {
    expect(canCustomerStartService('dispatching')).toBe(true);
  });

  it('factoring CTA clarifies partner model', () => {
    const cta = getPublicServiceCta('factoring');
    expect(cta.label.toLowerCase()).toContain('partner');
    expect(cta.label.toLowerCase()).toContain('does not fund');
  });

  it('insurance does not promise binding', () => {
    const cta = getPublicServiceCta('insurance');
    expect(cta.label.toLowerCase()).toContain('referral');
  });

  it('every service has activation state', () => {
    expect(SERVICE_LAUNCH_MATRIX.length).toBeGreaterThanOrEqual(10);
  });
});

describe('staff training', () => {
  it('tracks training completion percent', () => {
    const s = getTrainingCompletionSummary();
    expect(s.percentComplete).toBeGreaterThan(0);
    expect(s.percentComplete).toBeLessThan(100);
  });
});

describe('brand audit', () => {
  it('canonical brand is All In One', () => {
    expect(CANONICAL_BRAND).toContain('All In One');
  });

  it('detects forbidden legacy strings', () => {
    const bad = runBrandAudit([{ label: 'test', content: 'Perfect Choice Permitting' }]);
    expect(bad.ok).toBe(false);
  });

  it('passes clean content', () => {
    const good = runBrandAudit([{ label: 'test', content: 'All In One Enterprises Inc.' }]);
    expect(good.ok).toBe(true);
  });
});

describe('launch preparation gate', () => {
  it('canEnterLaunchPreparation documents blockers when infra missing', () => {
    const prep = canEnterLaunchPreparation();
    expect(prep.blockers.length).toBeGreaterThan(0);
  });
});
