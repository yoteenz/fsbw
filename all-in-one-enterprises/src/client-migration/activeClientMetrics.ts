import type { Client } from '../demo/demoTypes';
import { countActiveClientsCanonical, isCountedActiveClient } from './activeClientRule';

/** @deprecated use countActiveClientsCanonical or isCountedActiveClient */
export function countActiveClients(clients: Client[]): number {
  return countActiveClientsCanonical(clients);
}

export { isCountedActiveClient, countActiveClientsCanonical };

export function filterClientsByFounderSegment(clients: Client[], segment: string): Client[] {
  return clients.filter((c) => {
    const lifecycle = c.clientLifecycle ?? 'KNOWN_UNMIGRATED';
    switch (segment) {
      case 'ACTIVE':
        return lifecycle === 'ACTIVE';
      case 'PREBUILT':
        return lifecycle === 'PREBUILT';
      case 'INVITED':
        return lifecycle === 'INVITED';
      case 'WAITING_FOR_CLIENT':
        return lifecycle === 'CLIENT_CONFIRMATION_REQUIRED';
      case 'MIGRATION_REVIEW':
        return lifecycle === 'MIGRATION_REVIEW_REQUIRED';
      case 'MIGRATING':
        return lifecycle === 'MIGRATION_IN_PROGRESS';
      default:
        return true;
    }
  });
}
