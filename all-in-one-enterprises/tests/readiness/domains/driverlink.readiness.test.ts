import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';

describe('DriverLink readiness', () => {
  it('includes driver profiles and opportunities in demo seed', () => {
    const store = createDemoSeed();
    expect((store.driverlinkProfiles ?? []).length).toBeGreaterThan(0);
    expect((store.driverlinkOpportunities ?? []).length).toBeGreaterThan(0);
  });

  it('stores credentials separately from profile ids', () => {
    const store = createDemoSeed();
    const creds = store.driverlinkCredentials ?? [];
    const profiles = store.driverlinkProfiles ?? [];
    expect(creds.every((c) => profiles.some((p) => p.id === c.driverProfileId))).toBe(true);
  });
});
