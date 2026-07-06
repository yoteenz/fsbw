import type { ComponentRegistryEntry } from './types';
import { buildComponentRegistry, getComponentRegistryEntry } from './registry-builder';

const customRegistrations: ComponentRegistryEntry[] = [];

/** Register a reusable UI component — every visual element becomes a managed platform asset. */
export function registerComponent(entry: ComponentRegistryEntry): ComponentRegistryEntry {
  const idx = customRegistrations.findIndex((e) => e.componentId === entry.componentId);
  if (idx >= 0) customRegistrations[idx] = entry;
  else customRegistrations.push(entry);
  return entry;
}

export function getAllRegisteredComponents(): ComponentRegistryEntry[] {
  const builtIn = buildComponentRegistry();
  const byId = new Map(builtIn.map((e) => [e.componentId, e]));
  for (const custom of customRegistrations) {
    byId.set(custom.componentId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredComponent(componentId: string): ComponentRegistryEntry | undefined {
  return getAllRegisteredComponents().find((e) => e.componentId === componentId)
    ?? getComponentRegistryEntry(componentId);
}

export function listRegisteredComponentIds(): string[] {
  return getAllRegisteredComponents().map((e) => e.componentId);
}

export function validateComponentEntry(entry: ComponentRegistryEntry): string[] {
  const issues: string[] = [];
  if (!entry.componentId) issues.push('Missing componentId');
  if (!entry.officialName) issues.push('Missing officialName');
  if (!entry.componentPath) issues.push('Missing componentPath');
  if (entry.variants.length === 0) issues.push('Missing variants');
  return issues;
}

export function computeTotalReuseScore(components: ComponentRegistryEntry[]): number {
  if (components.length === 0) return 0;
  return Math.round(components.reduce((s, c) => s + c.reuseScore, 0) / components.length);
}
