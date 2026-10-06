import { describe, expect, it, vi } from 'vitest';
import { createDemoSeed } from '../demo/demoSeed';
import { findCaseById, findOrgQuarter, parseQuarterKey } from './iftaRouteHelpers';
import { aioPaths } from '../utils/paths';

describe('IFTA route helpers', () => {
  it('parses quarter keys', () => {
    expect(parseQuarterKey('2026-Q3')).toEqual({ year: 2026, quarter: 3 });
    expect(parseQuarterKey('bad')).toBeNull();
  });

  it('client and staff paths resolve the same canonical case', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date('2026-10-06T15:00:00.000Z'));
    const store = createDemoSeed();
    vi.useRealTimers();
    const caseId = 'ifta-client-c-2026-q3';
    const q = findCaseById(store, caseId);
    expect(q).toBeDefined();
    const fromKey = findOrgQuarter(store, 'client-c', '2026-Q3');
    expect(fromKey?.id).toBe(caseId);
    expect(aioPaths.portalWorkspaceIftaQuarter('2026-Q3')).toContain('/portal/workspaces/ifta/2026-Q3');
    expect(aioPaths.officeWorkspaceIftaCase('client-c', '2026-Q3')).toContain('/office/workspaces/ifta/client-c/2026-Q3');
  });
});
