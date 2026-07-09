import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import type { SystemBoundaryDefinition } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function createBoundaryId(systemId: string): string {
  return `BND-${systemId}-${Date.now().toString(36)}`;
}

export type DefineBoundaryInput = {
  systemId: string;
  owns: string[];
  doesNotOwn?: string[];
  inboundInterfaces?: string[];
  outboundInterfaces?: string[];
  description?: string;
};

/** Boundary Definitions™ */
export function defineSystemBoundary(input: DefineBoundaryInput): SystemBoundaryDefinition {
  const timestamp = now();
  const existing = getSystemBoundary(input.systemId);

  if (existing) {
    const updated: SystemBoundaryDefinition = {
      ...existing,
      owns: input.owns,
      doesNotOwn: input.doesNotOwn ?? existing.doesNotOwn,
      inboundInterfaces: input.inboundInterfaces ?? existing.inboundInterfaces,
      outboundInterfaces: input.outboundInterfaces ?? existing.outboundInterfaces,
      description: input.description ?? existing.description,
      updatedAt: timestamp,
    };

    mutateCoreSystemsStore((store) => ({
      ...store,
      boundaries: store.boundaries.map((b) =>
        b.systemId === input.systemId ? updated : b
      ),
    }));

    return updated;
  }

  const boundary: SystemBoundaryDefinition = {
    boundaryId: createBoundaryId(input.systemId),
    systemId: input.systemId.trim(),
    owns: input.owns,
    doesNotOwn: input.doesNotOwn ?? [],
    inboundInterfaces: input.inboundInterfaces ?? [],
    outboundInterfaces: input.outboundInterfaces ?? [],
    description: input.description,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    boundaries: [...store.boundaries, boundary],
  }));

  return boundary;
}

export function listBoundaryDefinitions(): SystemBoundaryDefinition[] {
  return readCoreSystemsStore().boundaries;
}

export function getSystemBoundary(systemId: string): SystemBoundaryDefinition | undefined {
  return listBoundaryDefinitions().find((b) => b.systemId === systemId);
}

export function validateBoundaryOwnership(systemId: string): {
  valid: boolean;
  conflicts: { object: string; ownerSystemId: string }[];
} {
  const boundary = getSystemBoundary(systemId);
  if (!boundary) return { valid: true, conflicts: [] };

  const conflicts: { object: string; ownerSystemId: string }[] = [];
  for (const other of listBoundaryDefinitions()) {
    if (other.systemId === systemId) continue;
    for (const obj of boundary.owns) {
      if (other.owns.includes(obj)) {
        conflicts.push({ object: obj, ownerSystemId: other.systemId });
      }
    }
  }

  return { valid: conflicts.length === 0, conflicts };
}
