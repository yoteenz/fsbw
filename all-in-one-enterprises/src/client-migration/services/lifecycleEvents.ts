import type { ClientLifecycleEvent, ClientLifecycleState } from '../types';
import type { DemoStore } from '../../demo/demoTypes';
import { deriveAccountStatusFromLifecycle } from '../lifecycle';

function uid(): string {
  return crypto.randomUUID();
}

export function appendLifecycleEvent(
  store: DemoStore,
  input: Omit<ClientLifecycleEvent, 'id' | 'createdAt'>,
): DemoStore {
  const event: ClientLifecycleEvent = {
    ...input,
    id: uid(),
    createdAt: new Date().toISOString(),
  };
  if (!store.clientLifecycleEvents) store.clientLifecycleEvents = [];
  store.clientLifecycleEvents.unshift(event);
  return store;
}

export function transitionClientLifecycle(
  store: DemoStore,
  organizationId: string,
  toState: ClientLifecycleState,
  eventType: string,
  actorType: ClientLifecycleEvent['actorType'],
  actorId?: string,
): DemoStore {
  const client = store.clients.find((c) => c.id === organizationId);
  if (!client) return store;
  const fromState = client.clientLifecycle ?? 'KNOWN_UNMIGRATED';
  client.clientLifecycle = toState;
  client.accountStatus = deriveAndSyncAccountStatus({ clientLifecycle: toState, accountStatus: client.accountStatus });
  return appendLifecycleEvent(store, {
    organizationId,
    fromState,
    toState,
    eventType,
    actorType,
    actorId,
  });
}

function deriveAndSyncAccountStatus(client: {
  clientLifecycle: ClientLifecycleState;
  accountStatus: 'active' | 'pending' | 'inactive';
}): 'active' | 'pending' | 'inactive' {
  return deriveAccountStatusFromLifecycle(client.clientLifecycle);
}
