import type { Client } from '../demo/demoTypes';
import { isActiveClient } from './lifecycle';

/** Single canonical rule: counted in founder "active clients" metrics. */
export function isCountedActiveClient(client: Client): boolean {
  return isActiveClient({
    clientLifecycle: client.clientLifecycle ?? 'KNOWN_UNMIGRATED',
    activationConditions: client.activationConditions,
  });
}

export function countActiveClientsCanonical(clients: Client[]): number {
  return clients.filter(isCountedActiveClient).length;
}
