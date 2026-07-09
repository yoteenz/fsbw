import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateCoreSystemsStore, readCoreSystemsStore } from '../persistence';
import { registerSystemCapability } from '../registry/capability-registry';
import { registerSystemDependency } from '../registry/dependency-registry';
import { defineSystemBoundary } from '../boundaries/definitions';
import type {
  CoreSystemBlueprint,
  CoreSystemEvent,
  CoreSystemExpansionPoint,
  CoreSystemRelationship,
  CoreSystemService,
  CoreSystemValidationReport,
} from '../types';
import type {
  CoreSystemDomain,
  SystemDependencyClass,
  SystemLifecycleState,
} from '../constants';

function now(): string {
  return new Date().toISOString();
}

export function createCoreSystemId(slug: string): string {
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export type RegisterCoreSystemInput = {
  systemId?: string;
  officialName: string;
  domain: CoreSystemDomain | string;
  dependencyClass?: SystemDependencyClass | string;
  responsibilities?: string[];
  capabilities?: string[];
  dependencies?: string[];
  relationships?: CoreSystemRelationship[];
  ownedObjects?: string[];
  events?: CoreSystemEvent[];
  services?: CoreSystemService[];
  publicInterfaces?: string[];
  lifecycleState?: SystemLifecycleState;
  expansionPoints?: CoreSystemExpansionPoint[];
  purpose?: string;
  contentHome?: string;
  metadata?: Record<string, unknown>;
};

export function registerCoreSystem(input: RegisterCoreSystemInput): CoreSystemBlueprint {
  const timestamp = now();
  const systemId = input.systemId?.trim() || createCoreSystemId(input.officialName);

  const existing = readCoreSystemsStore().systems.find((s) => s.systemId === systemId);
  if (existing) {
    throw new Error(`System already registered: ${systemId}`);
  }

  const system: CoreSystemBlueprint = {
    systemId,
    officialName: input.officialName.trim(),
    domain: input.domain,
    dependencyClass: input.dependencyClass,
    responsibilities: input.responsibilities ?? [],
    capabilities: input.capabilities ?? [],
    dependencies: input.dependencies ?? [],
    relationships: input.relationships ?? [],
    ownedObjects: input.ownedObjects ?? [],
    events: input.events ?? [],
    services: input.services ?? [],
    publicInterfaces: input.publicInterfaces ?? [],
    version: { ...INITIAL_GENESIS_VERSION },
    lifecycleState: input.lifecycleState ?? 'draft',
    expansionPoints: input.expansionPoints ?? [],
    purpose: input.purpose,
    contentHome: input.contentHome,
    metadata: input.metadata ?? {},
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    systems: [...store.systems, system],
  }));

  for (const cap of system.capabilities) {
    registerSystemCapability({
      systemId,
      capabilityKey: cap,
      isPublic: true,
    });
  }

  for (const dep of system.dependencies) {
    registerSystemDependency({
      fromSystemId: systemId,
      toSystemId: dep,
      relationType: 'requires',
      dependencyClass: system.dependencyClass,
    });
  }

  if (system.ownedObjects.length > 0) {
    defineSystemBoundary({
      systemId,
      owns: system.ownedObjects,
      outboundInterfaces: system.publicInterfaces,
    });
  }

  return system;
}

export function updateCoreSystem(
  systemId: string,
  patch: Partial<
    Pick<
      CoreSystemBlueprint,
      | 'officialName'
      | 'responsibilities'
      | 'capabilities'
      | 'dependencies'
      | 'relationships'
      | 'ownedObjects'
      | 'events'
      | 'services'
      | 'publicInterfaces'
      | 'expansionPoints'
      | 'purpose'
      | 'metadata'
    >
  >
): CoreSystemBlueprint | undefined {
  const existing = readCoreSystemsStore().systems.find((s) => s.systemId === systemId);
  if (!existing) return undefined;

  const updated: CoreSystemBlueprint = {
    ...existing,
    ...patch,
    updatedAt: now(),
  };

  mutateCoreSystemsStore((store) => ({
    ...store,
    systems: store.systems.map((s) => (s.systemId === systemId ? updated : s)),
  }));

  return updated;
}

export function validateCoreSystemEnvelope(system: CoreSystemBlueprint): CoreSystemValidationReport {
  const issues: CoreSystemValidationReport['issues'] = [];

  if (!system.systemId?.trim()) {
    issues.push({ code: 'MISSING_SYSTEM_ID', message: 'System ID is required', systemId: system.systemId });
  }
  if (!system.officialName?.trim()) {
    issues.push({ code: 'MISSING_NAME', message: 'Official Name is required', systemId: system.systemId });
  }
  if (!system.domain) {
    issues.push({ code: 'MISSING_DOMAIN', message: 'Domain is required', systemId: system.systemId });
  }
  if (!Array.isArray(system.responsibilities)) {
    issues.push({ code: 'INVALID_RESPONSIBILITIES', message: 'Responsibilities must be an array', systemId: system.systemId });
  }
  if (!Array.isArray(system.capabilities)) {
    issues.push({ code: 'INVALID_CAPABILITIES', message: 'Capabilities must be an array', systemId: system.systemId });
  }
  if (!Array.isArray(system.dependencies)) {
    issues.push({ code: 'INVALID_DEPENDENCIES', message: 'Dependencies must be an array', systemId: system.systemId });
  }
  if (!system.lifecycleState) {
    issues.push({ code: 'MISSING_LIFECYCLE', message: 'Lifecycle state is required', systemId: system.systemId });
  }

  return { valid: issues.length === 0, issues };
}

export function validateCoreSystemsStore(): CoreSystemValidationReport {
  const store = readCoreSystemsStore();
  const issues: CoreSystemValidationReport['issues'] = [];
  const seenIds = new Set<string>();

  for (const system of store.systems) {
    const envelope = validateCoreSystemEnvelope(system);
    issues.push(...envelope.issues);

    if (seenIds.has(system.systemId)) {
      issues.push({
        code: 'DUPLICATE_SYSTEM_ID',
        message: `Duplicate system ID: ${system.systemId}`,
        systemId: system.systemId,
      });
    }
    seenIds.add(system.systemId);

    for (const dep of system.dependencies) {
      if (dep === system.systemId) {
        issues.push({
          code: 'SELF_DEPENDENCY',
          message: 'System cannot depend on itself',
          systemId: system.systemId,
        });
      }
    }
  }

  return { valid: issues.length === 0, issues };
}
