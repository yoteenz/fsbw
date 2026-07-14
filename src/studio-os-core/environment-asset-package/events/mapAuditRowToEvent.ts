import {
  ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION,
  normalizeLegacyAuditEventType,
  type EnvironmentPackageEvent,
} from './EnvironmentPackageEvent';

export function mapAuditRowToEnvironmentPackageEvent(row: Record<string, unknown>): EnvironmentPackageEvent {
  const legacyType = String(row.event_type ?? '');
  const normalizedType = normalizeLegacyAuditEventType(legacyType);
  const occurredAt = String(row.occurred_at ?? row.persisted_at ?? new Date().toISOString());
  const persistedAt = String(row.persisted_at ?? row.occurred_at ?? occurredAt);

  return {
    eventId: String(row.event_id ?? row.id ?? ''),
    eventType: normalizedType,
    packageId: String(row.package_id ?? ''),
    variantId: (row.variant_id as string | null) ?? null,
    environmentId: (row.environment_id as string | null) ?? null,
    departmentId: (row.department_id as string | null) ?? null,
    revision: typeof row.revision === 'number' ? row.revision : Number(row.revision ?? 1),
    outputType: (row.output_type as string | null) ?? null,
    jobId: (row.job_id as string | null) ?? null,
    actorType: (row.actor_type as EnvironmentPackageEvent['actorType']) ?? 'system',
    actorId: (row.actor_id as string | null) ?? (row.actor as string | null) ?? null,
    source: (row.source as EnvironmentPackageEvent['source']) ?? 'package-repository',
    sequence: typeof row.sequence === 'number' ? row.sequence : Number(row.sequence ?? 0),
    occurredAt,
    persistedAt,
    correlationId: (row.correlation_id as string | null) ?? null,
    causationId: (row.causation_id as string | null) ?? null,
    schemaVersion: ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION,
    payload: (row.payload as Record<string, unknown>) ?? {},
  };
}
