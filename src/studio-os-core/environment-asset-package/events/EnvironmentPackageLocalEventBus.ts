import type { EnvironmentPackageEvent, EnvironmentPackageEventType } from './EnvironmentPackageEvent';
import { nextLocalEventSequence } from './EnvironmentPackageEventProcessor';

function newLocalEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `local-${crypto.randomUUID()}`;
  }
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

type LocalEventListener = (event: EnvironmentPackageEvent) => void;

const listenersByPackage = new Map<string, Set<LocalEventListener>>();
const globalListeners = new Set<LocalEventListener>();

export function subscribeLocalEnvironmentPackageEvents(
  packageId: string | null,
  listener: LocalEventListener
): () => void {
  if (!packageId) {
    globalListeners.add(listener);
    return () => globalListeners.delete(listener);
  }
  let set = listenersByPackage.get(packageId);
  if (!set) {
    set = new Set();
    listenersByPackage.set(packageId, set);
  }
  set.add(listener);
  return () => {
    set?.delete(listener);
    if (set?.size === 0) listenersByPackage.delete(packageId);
  };
}

export function publishLocalEnvironmentPackageEvent(input: {
  eventType: EnvironmentPackageEventType | string;
  packageId: string;
  variantId?: string | null;
  environmentId?: string | null;
  departmentId?: string | null;
  revision: number;
  outputType?: string | null;
  jobId?: string | null;
  actorType?: EnvironmentPackageEvent['actorType'];
  actorId?: string | null;
  source?: EnvironmentPackageEvent['source'];
  payload?: Record<string, unknown>;
  correlationId?: string | null;
  causationId?: string | null;
}): EnvironmentPackageEvent {
  const now = new Date().toISOString();
  const event: EnvironmentPackageEvent = {
    eventId: newLocalEventId(),
    eventType: input.eventType,
    packageId: input.packageId,
    variantId: input.variantId ?? null,
    environmentId: input.environmentId ?? null,
    departmentId: input.departmentId ?? null,
    revision: input.revision,
    outputType: input.outputType ?? null,
    jobId: input.jobId ?? null,
    actorType: input.actorType ?? 'admin',
    actorId: input.actorId ?? null,
    source: input.source ?? 'client-local',
    sequence: nextLocalEventSequence(input.packageId),
    occurredAt: now,
    persistedAt: now,
    correlationId: input.correlationId ?? null,
    causationId: input.causationId ?? null,
    schemaVersion: 'studio.environment-package-event.v1',
    payload: input.payload ?? {},
  };

  const scoped = listenersByPackage.get(input.packageId);
  scoped?.forEach((fn) => fn(event));
  globalListeners.forEach((fn) => fn(event));
  return event;
}

export function resetLocalEnvironmentPackageEventBus(): void {
  listenersByPackage.clear();
  globalListeners.clear();
}
