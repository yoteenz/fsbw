import type { IntegrationAuditAction, IntegrationAuditEvent } from './integrationTypes';

function uid(): string {
  return crypto.randomUUID();
}

export function createAuditEvent(
  action: IntegrationAuditAction,
  detail: {
    connectionId?: string;
    providerId?: string;
    staffId?: string;
    organizationId?: string;
    safeDetail?: string;
  },
): IntegrationAuditEvent {
  return {
    id: uid(),
    action,
    connectionId: detail.connectionId,
    providerId: detail.providerId,
    staffId: detail.staffId,
    organizationId: detail.organizationId,
    safeDetail: detail.safeDetail,
    createdAt: new Date().toISOString(),
  };
}

export function appendAuditEvent(
  events: IntegrationAuditEvent[],
  event: IntegrationAuditEvent,
): IntegrationAuditEvent[] {
  return [...events, event];
}

export function filterAuditForExport(events: IntegrationAuditEvent[]): IntegrationAuditEvent[] {
  return events.map((e) => ({
    ...e,
    safeDetail: e.safeDetail?.replace(/Bearer\s+\S+/gi, '[REDACTED]'),
  }));
}
