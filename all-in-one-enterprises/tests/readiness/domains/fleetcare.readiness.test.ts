import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';

describe('FleetCare & Mechanic Network readiness', () => {
  it('includes fleetcare tickets in demo seed', () => {
    const store = createDemoSeed();
    expect((store.fleetcareTickets ?? []).length).toBeGreaterThan(0);
  });

  it('links tickets to client organizations for tenant scoping', () => {
    const store = createDemoSeed();
    const tickets = store.fleetcareTickets ?? [];
    expect(tickets.every((t) => Boolean(t.clientOrganizationId))).toBe(true);
  });
});
