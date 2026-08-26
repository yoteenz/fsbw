import type { FreightAutopilotEventType } from './freightAutopilotTypes';

export interface FreightAutopilotAuditEntry {
  id: string;
  loadId: string;
  organizationId: string;
  event: FreightAutopilotEventType;
  action: string;
  outcome: 'success' | 'blocked' | 'skipped' | 'error';
  details?: string;
  staffId?: string;
  idempotencyKey: string;
  createdAt: string;
}

export function autopilotAuditIdempotencyKey(loadId: string, event: FreightAutopilotEventType, action: string): string {
  return `${loadId}:${event}:${action}`;
}
