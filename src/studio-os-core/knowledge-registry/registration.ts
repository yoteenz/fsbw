import type { KnowledgeRegistryEntry } from './types';
import { buildKnowledgeRegistry, getRegistryEntryById } from './registry-builder';

const customRegistrations: KnowledgeRegistryEntry[] = [];

export function registerKnowledgeFeature(entry: KnowledgeRegistryEntry): KnowledgeRegistryEntry {
  const idx = customRegistrations.findIndex((e) => e.internalId === entry.internalId);
  const enriched = { ...entry, lastUpdated: new Date().toISOString().slice(0, 10) };
  if (idx >= 0) customRegistrations[idx] = enriched;
  else customRegistrations.push(enriched);
  return enriched;
}

/** @deprecated */
export const registerDocumentationFeature = registerKnowledgeFeature;

export function getAllRegistryEntries(): KnowledgeRegistryEntry[] {
  const builtIn = buildKnowledgeRegistry();
  const byId = new Map(builtIn.map((e) => [e.internalId, e]));
  for (const custom of customRegistrations) {
    byId.set(custom.internalId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredFeature(internalId: string): KnowledgeRegistryEntry | undefined {
  return getAllRegistryEntries().find((e) => e.internalId === internalId || e.moduleId === internalId)
    ?? getRegistryEntryById(internalId);
}

export function listRegisteredFeatureIds(): string[] {
  return getAllRegistryEntries().map((e) => e.internalId);
}

export function validateRegistryEntry(entry: KnowledgeRegistryEntry): string[] {
  const issues: string[] = [];
  if (!entry.officialName) issues.push('Missing officialName');
  if (!entry.purpose) issues.push('Missing purpose');
  if (!entry.internalId) issues.push('Missing internalId');

  const allIds = new Set(getAllRegistryEntries().map((e) => e.internalId));
  const allowUnresolved = entry.implementationStatus === 'planned' || entry.implementationStatus === 'in-progress';

  if (
    !allowUnresolved &&
    entry.relatedSystems.some((id) => !allIds.has(id) && !id.startsWith('volume-') && !id.startsWith('DR-'))
  ) {
    issues.push('Broken relatedSystems reference');
  }

  return issues;
}
