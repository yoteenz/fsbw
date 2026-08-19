import { describe, expect, it } from 'vitest';
import { createDemoSeed } from '../../../src/demo/demoSeed';
import { buildNotification } from '../../../src/notifications/notificationEngine';

describe('Authentication & Notifications readiness', () => {
  it('creates in-app notifications with organization scope', () => {
    const n = buildNotification({
      organizationId: 'client-a',
      recipientType: 'customer',
      recipientId: 'client-a',
      eventType: 'SERVICE_REQUEST_STATUS_CHANGED',
      category: 'operations',
      title: 'QA test notification',
      body: 'Synthetic QA event',
      link: '/portal',
    });
    expect(n.organizationId).toBe('client-a');
  });

  it('notification records exist in demo seed', () => {
    const store = createDemoSeed();
    expect(store.notifications.length).toBeGreaterThan(0);
  });
});
