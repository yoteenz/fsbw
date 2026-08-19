import { describe, expect, it } from 'vitest';
import { buildRoadReadyItems, createEmptyProfile } from '../../../src/road-ready/roadReadyRules';
import type { PowerUnit } from '../../../src/road-ready/roadReadyTypes';

describe('Road Ready readiness', () => {
  it('NEW OWNER-OPERATOR scenario generates applicable requirements', () => {
    const profile = createEmptyProfile('qa-org-new-oo', 'AIO QA New Operator');
    profile.operating.operationType = 'owner_operator';
    profile.operating.scope = 'interstate';
    profile.operating.currentlyOperating = 'preparing';
    profile.authority.usdot = 'no';
    profile.authority.mc = 'no';

    const items = buildRoadReadyItems(profile, []);
    expect(items.length).toBeGreaterThan(5);
    expect(items.some((i) => i.status === 'action_needed' || i.status === 'not_started')).toBe(true);
  });

  it('EXISTING MOTOR CARRIER marks authority items completed when reported yes', () => {
    const profile = createEmptyProfile('qa-org-mc', 'AIO QA Carrier LLC');
    profile.operating.operationType = 'motor_carrier';
    profile.operating.scope = 'interstate';
    profile.authority.usdot = 'yes';
    profile.authority.mc = 'yes';
    profile.authority.boc3 = 'yes';

    const units: PowerUnit[] = [];
    const items = buildRoadReadyItems(profile, units);
    const authorityCompleted = items.filter(
      (i) => i.category === 'authority' && i.status === 'completed',
    );
    expect(authorityCompleted.length).toBeGreaterThan(0);
  });
});
