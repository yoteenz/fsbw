import type { SystemRegistryEntry } from './types';
import { buildSystemRegistry, getSystemRegistryEntry } from './registry-builder';

const customRegistrations: SystemRegistryEntry[] = [];

/** Register or update any Studio OS object — nothing exists outside the registry. */
export function registerSystem(entry: SystemRegistryEntry): SystemRegistryEntry {
  const idx = customRegistrations.findIndex((e) => e.uniqueId === entry.uniqueId);
  const enriched = { ...entry, updatedDate: new Date().toISOString().slice(0, 10) };
  if (idx >= 0) customRegistrations[idx] = enriched;
  else customRegistrations.push(enriched);
  return enriched;
}

export function getAllRegisteredSystems(): SystemRegistryEntry[] {
  const builtIn = buildSystemRegistry();
  const byId = new Map(builtIn.map((e) => [e.uniqueId, e]));
  for (const custom of customRegistrations) {
    byId.set(custom.uniqueId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredSystem(uniqueId: string): SystemRegistryEntry | undefined {
  return getAllRegisteredSystems().find((e) => e.uniqueId === uniqueId || e.moduleId === uniqueId)
    ?? getSystemRegistryEntry(uniqueId);
}

export function listRegisteredSystemIds(): string[] {
  return getAllRegisteredSystems().map((e) => e.uniqueId);
}

export function validateSystemEntry(entry: SystemRegistryEntry): string[] {
  const issues: string[] = [];
  if (!entry.uniqueId) issues.push('Missing uniqueId');
  if (!entry.officialName) issues.push('Missing officialName');
  if (!entry.description) issues.push('Missing description');
  if (
    entry.dependencies.some((id) => !getAllRegisteredSystems().some((e) => e.uniqueId === id || e.moduleId === id))
  ) {
    issues.push('Broken dependency reference');
  }
  return issues;
}
