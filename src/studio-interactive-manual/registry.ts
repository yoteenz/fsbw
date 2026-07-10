import { compileAllManualDefinitions } from './compiler';
import { buildAllManualDefinitions } from './buildFromKnowledge';
import { bindManualModuleReader } from './manualGraphBridge';
import type { ManualModule, ManualStep } from './types';

let compiledModulesCache: ManualModule[] | null = null;
let compilingModules = false;

/** Lazy single-flight compile — avoids module-scope init while buildGraph/registry cycle resolves. */
function ensureCompiledModules(): ManualModule[] {
  if (compiledModulesCache) return compiledModulesCache;
  if (compilingModules) return [];
  compilingModules = true;
  try {
    compiledModulesCache = compileAllManualDefinitions(buildAllManualDefinitions()).map((m) => ({
      ...m,
      steps: [...m.steps].sort((a, b) => a.order - b.order),
    }));
    // Defer graph invalidation — avoids registry ↔ buildGraph static import cycle.
    queueMicrotask(() => {
      void import('./knowledge-graph/buildGraph').then((m) => m.invalidateKnowledgeGraphCache());
    });
    return compiledModulesCache;
  } finally {
    compilingModules = false;
  }
}

export function getAllManualModules(): ManualModule[] {
  return ensureCompiledModules().map((m) => ({
    ...m,
    steps: [...m.steps],
  }));
}

export function getManualModuleById(moduleId: string): ManualModule | undefined {
  return getAllManualModules().find((m) => m.id === moduleId);
}

export function getManualSteps(moduleId: string): ManualStep[] {
  return getManualModuleById(moduleId)?.steps ?? [];
}

export function findManualStepIndex(moduleId: string, stepId: string): number {
  return getManualSteps(moduleId).findIndex((s) => s.id === stepId);
}

bindManualModuleReader(() => ensureCompiledModules());

/** Test / hot-reload hook — not used in production paths. */
export function invalidateManualRegistryCache(): void {
  compiledModulesCache = null;
}
