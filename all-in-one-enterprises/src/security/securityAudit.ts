import type { DemoStore } from '../demo/demoTypes';
import type { SecurityAuditEvent, SecurityAuditEventType, SecurityAuditResult } from './securityTypes';

function uid(): string {
  return crypto.randomUUID();
}

export function generateCorrelationId(): string {
  const part = crypto.randomUUID().replace(/-/g, '').slice(0, 8).toUpperCase();
  return `AIO-ERR-${part}`;
}

export interface RecordAuditInput {
  eventType: SecurityAuditEventType;
  action: string;
  result: SecurityAuditResult;
  actorId?: string;
  actorLabel?: string;
  actorRole?: string;
  organizationId?: string;
  entityType?: string;
  entityId?: string;
  correlationId?: string;
  metadata?: Record<string, string | number | boolean | null>;
  beforeSnapshot?: Record<string, unknown>;
  afterSnapshot?: Record<string, unknown>;
}

export function recordSecurityAudit(store: DemoStore, input: RecordAuditInput): SecurityAuditEvent {
  const event: SecurityAuditEvent = {
    id: uid(),
    eventType: input.eventType,
    timestamp: new Date().toISOString(),
    actorId: input.actorId,
    actorLabel: input.actorLabel,
    actorRole: input.actorRole,
    organizationId: input.organizationId,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    result: input.result,
    correlationId: input.correlationId ?? generateCorrelationId(),
    metadata: sanitizeAuditMetadata(input.metadata),
    beforeSnapshot: redactAuditSnapshot(input.beforeSnapshot),
    afterSnapshot: redactAuditSnapshot(input.afterSnapshot),
    isDemo: true,
  };
  if (!store.securityAuditEvents) store.securityAuditEvents = [];
  store.securityAuditEvents.unshift(event);
  return event;
}

const SECRET_KEYS = /password|secret|token|api_key|authorization|credential/i;

function redactAuditSnapshot(snap?: Record<string, unknown>): Record<string, unknown> | undefined {
  if (!snap) return undefined;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(snap)) {
    if (SECRET_KEYS.test(k)) out[k] = '[REDACTED]';
    else if (typeof v === 'string' && SECRET_KEYS.test(v)) out[k] = '[REDACTED]';
    else out[k] = v;
  }
  return out;
}

function sanitizeAuditMetadata(meta?: Record<string, string | number | boolean | null>) {
  if (!meta) return undefined;
  const out: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(meta)) {
    if (SECRET_KEYS.test(k)) out[k] = '[REDACTED]';
    else if (typeof v === 'string' && v.length > 500) out[k] = `${v.slice(0, 500)}…`;
    else out[k] = v;
  }
  return out;
}

export function filterAuditEvents(
  store: DemoStore,
  filters: {
    from?: string;
    to?: string;
    eventType?: SecurityAuditEventType;
    actorId?: string;
    organizationId?: string;
    result?: SecurityAuditResult;
  },
): SecurityAuditEvent[] {
  let events = [...(store.securityAuditEvents ?? [])];
  if (filters.from) events = events.filter((e) => e.timestamp >= filters.from!);
  if (filters.to) events = events.filter((e) => e.timestamp <= filters.to!);
  if (filters.eventType) events = events.filter((e) => e.eventType === filters.eventType);
  if (filters.actorId) events = events.filter((e) => e.actorId === filters.actorId);
  if (filters.organizationId) events = events.filter((e) => e.organizationId === filters.organizationId);
  if (filters.result) events = events.filter((e) => e.result === filters.result);
  return events;
}
