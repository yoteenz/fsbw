import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';
import { getClientCommandCenterView } from '../../../src/portal/clientCommandCenterService';
import { getOfficeCommandCenterView } from '../../../src/office-core/officeCommandCenterService';

describe('Client Portal & AIO Office readiness', () => {
  it('builds client command center view from demo seed', () => {
    const store = createDemoSeed();
    store.portalClientId = 'client-a';
    const view = getClientCommandCenterView(store);
    expect(view.greeting).toBeTruthy();
  });

  it('builds office command center view with work sections', () => {
    const store = createDemoSeed();
    const view = getOfficeCommandCenterView(store);
    expect(view.assignedCount).toBeGreaterThanOrEqual(0);
  });
});
