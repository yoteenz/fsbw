import { compileAllManualDefinitions } from './compiler';
import { buildAllManualDefinitions } from './buildFromKnowledge';
import type { ManualModule, ManualStep } from './types';

const ALL_MODULES = compileAllManualDefinitions(buildAllManualDefinitions());

export function getAllManualModules(): ManualModule[] {
  return ALL_MODULES.map((m) => ({
    ...m,
    steps: [...m.steps].sort((a, b) => a.order - b.order),
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
