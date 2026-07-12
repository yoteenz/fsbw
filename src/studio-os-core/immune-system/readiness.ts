import { IMMUNE_SCHEMA_DEPENDENCY_MANIFEST } from './schema-dependency-manifest.js';
import type { ImmuneSubsystemHealth } from './types.js';

export type SubsystemReadinessState = {
  subsystemId: string;
  health: ImmuneSubsystemHealth;
  featureIds: string[];
  missingResources: string[];
  lastCheckedAt: string | null;
  message: string;
};

let cachedGovernedGenerationHealth: SubsystemReadinessState | null = null;
let cachedAt = 0;

export function invalidateReadinessCache(): void {
  cachedGovernedGenerationHealth = null;
  cachedAt = 0;
}

export function getGovernedGenerationReadinessFromPresence(
  tablePresent: boolean,
  ttlMs = 60_000,
  now = Date.now()
): SubsystemReadinessState {
  if (cachedGovernedGenerationHealth && now - cachedAt < ttlMs) {
    return cachedGovernedGenerationHealth;
  }
  const dep = IMMUNE_SCHEMA_DEPENDENCY_MANIFEST.find((d) => d.featureId === 'async-governed-generation-v1');
  const state: SubsystemReadinessState = {
    subsystemId: 'governed-generation-dispatch',
    health: tablePresent ? 'ready' : 'blocked',
    featureIds: dep ? [dep.featureId] : [],
    missingResources: tablePresent ? [] : ['public.studio_governed_generation_jobs'],
    lastCheckedAt: new Date(now).toISOString(),
    message: tablePresent
      ? 'Governed generation persistence contract satisfied'
      : 'Required table public.studio_governed_generation_jobs is missing — async job submit blocked until repair',
  };
  cachedGovernedGenerationHealth = state;
  cachedAt = now;
  return state;
}

export function evaluateDeploymentReadinessFromTables(
  tablePresence: Record<string, boolean>
): { ready: boolean; blockedFeatures: string[]; missing: string[] } {
  const blockedFeatures: string[] = [];
  const missing: string[] = [];
  for (const dep of IMMUNE_SCHEMA_DEPENDENCY_MANIFEST) {
    for (const table of dep.requiredTables) {
      if (!tablePresence[table]) {
        blockedFeatures.push(dep.featureId);
        missing.push(table);
      }
    }
  }
  return { ready: missing.length === 0, blockedFeatures: [...new Set(blockedFeatures)], missing: [...new Set(missing)] };
}
