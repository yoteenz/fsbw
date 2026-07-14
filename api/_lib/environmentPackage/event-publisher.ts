import { randomUUID } from 'crypto';
import { getSupabaseAdminServiceRole } from '../supabase.js';
import { AUDIT_TABLE } from './persistence.js';

export const ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION = 'studio.environment-package-event.v1';

export type PublishEnvironmentPackageEventInput = {
  eventId?: string;
  eventType: string;
  packageId: string;
  variantId?: string | null;
  environmentId?: string | null;
  departmentId?: string | null;
  revision: number;
  outputType?: string | null;
  jobId?: string | null;
  actorType?: string;
  actorId?: string | null;
  source?: string;
  correlationId?: string | null;
  causationId?: string | null;
  detail: string;
  payload?: Record<string, unknown>;
  occurredAt?: string;
  failClosed?: boolean;
};

export type PublishedEnvironmentPackageEvent = {
  eventId: string;
  sequence: number;
  persistedAt: string;
};

async function nextPackageSequence(packageId: string): Promise<number> {
  const admin = getSupabaseAdminServiceRole();
  const { data } = await admin
    .from(AUDIT_TABLE)
    .select('sequence')
    .eq('package_id', packageId)
    .order('sequence', { ascending: false })
    .limit(1)
    .maybeSingle();
  const current = typeof data?.sequence === 'number' ? data.sequence : 0;
  return current + 1;
}

/** Canonical server-side Environment Package event publisher — append-only durable stream. */
export async function publishEnvironmentPackageEvent(
  input: PublishEnvironmentPackageEventInput
): Promise<{ ok: true; event: PublishedEnvironmentPackageEvent } | { ok: false; error: string; duplicate?: boolean }> {
  const admin = getSupabaseAdminServiceRole();
  const eventId = input.eventId ?? `envpkg-evt-${randomUUID()}`;
  const occurredAt = input.occurredAt ?? new Date().toISOString();
  const persistedAt = new Date().toISOString();

  const { data: existing } = await admin
    .from(AUDIT_TABLE)
    .select('event_id, sequence, persisted_at')
    .eq('event_id', eventId)
    .maybeSingle();

  if (existing) {
    return {
      ok: true,
      event: {
        eventId: existing.event_id as string,
        sequence: (existing.sequence as number) ?? 0,
        persistedAt: (existing.persisted_at as string) ?? persistedAt,
      },
    };
  }

  const sequence = await nextPackageSequence(input.packageId);

  const row = {
    event_id: eventId,
    package_id: input.packageId,
    event_type: input.eventType,
    actor: input.actorId ?? null,
    detail: input.detail,
    revision: input.revision,
    payload: input.payload ?? {},
    occurred_at: occurredAt,
    variant_id: input.variantId ?? null,
    environment_id: input.environmentId ?? null,
    department_id: input.departmentId ?? null,
    output_type: input.outputType ?? null,
    job_id: input.jobId ?? null,
    actor_type: input.actorType ?? 'system',
    actor_id: input.actorId ?? null,
    source: input.source ?? 'package-repository',
    sequence,
    correlation_id: input.correlationId ?? null,
    causation_id: input.causationId ?? null,
    schema_version: ENVIRONMENT_PACKAGE_EVENT_SCHEMA_VERSION,
    persisted_at: persistedAt,
  };

  const { error } = await admin.from(AUDIT_TABLE).insert(row);
  if (error) {
    if (error.code === '23505') {
      return {
        ok: true,
        event: { eventId, sequence, persistedAt },
      };
    }
    if (input.failClosed) {
      return { ok: false, error: error.message };
    }
    console.warn('[EnvironmentPackageEventPublisher] noncritical telemetry failure', error.message);
    return { ok: false, error: error.message };
  }

  return { ok: true, event: { eventId, sequence, persistedAt } };
}
