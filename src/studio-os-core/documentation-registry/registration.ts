import type { DocumentationRegistryEntry } from './types';
import { buildDocumentationRegistry, getRegistryEntryById } from './registry-builder';

const customRegistrations: DocumentationRegistryEntry[] = [];

/** Register or update a feature — one registration, many consumers. */
export function registerDocumentationFeature(entry: DocumentationRegistryEntry): DocumentationRegistryEntry {
  const idx = customRegistrations.findIndex((e) => e.internalId === entry.internalId);
  const enriched = { ...entry, lastUpdated: new Date().toISOString().slice(0, 10) };
  if (idx >= 0) customRegistrations[idx] = enriched;
  else customRegistrations.push(enriched);
  return enriched;
}

/** All registered features — built-in registry + custom registrations. */
export function getAllRegistryEntries(): DocumentationRegistryEntry[] {
  const builtIn = buildDocumentationRegistry();
  const byId = new Map(builtIn.map((e) => [e.internalId, e]));
  for (const custom of customRegistrations) {
    byId.set(custom.internalId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredFeature(internalId: string): DocumentationRegistryEntry | undefined {
  return getAllRegistryEntries().find((e) => e.internalId === internalId || e.moduleId === internalId)
    ?? getRegistryEntryById(internalId);
}

export function listRegisteredFeatureIds(): string[] {
  return getAllRegistryEntries().map((e) => e.internalId);
}

export function validateRegistryEntry(entry: DocumentationRegistryEntry): string[] {
  const issues: string[] = [];
  if (!entry.officialName) issues.push('Missing officialName');
  if (!entry.purpose) issues.push('Missing purpose');
  if (!entry.internalId) issues.push('Missing internalId');
  if (
    entry.relatedSystems.some((id) => !getAllRegistryEntries().some((e) => e.internalId === id))
  ) {
    issues.push('Broken relatedSystems reference');
  }
  return issues;
}
