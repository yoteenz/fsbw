import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import type { SystemCapabilityRecord } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createCapabilityId(systemId: string, capabilityKey: string): string {
  const key = capabilityKey.toUpperCase().replace(/[^A-Z0-9]+/g, '-');
  return `CAP-${systemId}-${key}-${Date.now().toString(36)}`;
}

export type RegisterCapabilityInput = {
  systemId: string;
  capabilityKey: string;
  description?: string;
  isPublic?: boolean;
};

/** Capability Registry™ */
export function registerSystemCapability(input: RegisterCapabilityInput): SystemCapabilityRecord {
  const record: SystemCapabilityRecord = {
    capabilityId: createCapabilityId(input.systemId, input.capabilityKey),
    systemId: input.systemId.trim(),
    capabilityKey: input.capabilityKey.trim(),
    description: input.description,
    isPublic: input.isPublic ?? true,
    createdAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    capabilities: [...store.capabilities, record],
  }));

  return record;
}

export function listCapabilityRegistry(): SystemCapabilityRecord[] {
  return readCoreSystemsStore().capabilities;
}

export function listCapabilitiesForSystem(systemId: string): SystemCapabilityRecord[] {
  return listCapabilityRegistry().filter((c) => c.systemId === systemId);
}

export function listPublicCapabilities(): SystemCapabilityRecord[] {
  return listCapabilityRegistry().filter((c) => c.isPublic);
}

export function findCapabilityByKey(
  systemId: string,
  capabilityKey: string
): SystemCapabilityRecord | undefined {
  return listCapabilityRegistry().find(
    (c) => c.systemId === systemId && c.capabilityKey === capabilityKey
  );
}

export function getCapabilityCoverage(): { systemId: string; count: number }[] {
  const map = new Map<string, number>();
  for (const cap of listCapabilityRegistry()) {
    map.set(cap.systemId, (map.get(cap.systemId) ?? 0) + 1);
  }
  return [...map.entries()].map(([systemId, count]) => ({ systemId, count }));
}
