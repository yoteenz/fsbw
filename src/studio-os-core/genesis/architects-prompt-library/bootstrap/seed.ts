import { updateBuildOrderSystemStatus } from '../../build-order/build-order/registry';
import { ensureExecutiveReflectionSuiteSubsystem } from '../../executive-reflection-suite/engine';
import { APL_SUBSYSTEM_VERSION } from '../constants';
import { mutateArchitectsPromptLibraryStore, readArchitectsPromptLibraryStore } from '../persistence';
import type { AplPromptTemplate, AplStore } from '../types';
import {
  SEED_COLLECTIONS,
  SEED_COMPARISONS,
  SEED_CORE_SYSTEM_REFS,
  SEED_DEPENDENCIES,
  SEED_EXECUTIONS,
  SEED_GENESIS_REFS,
  SEED_LAUNCH_STACK_REFS,
  SEED_LESSONS,
  SEED_MODEL_PERFORMANCE,
  SEED_OUTPUTS,
  SEED_PROMPTS,
  SEED_RELATIONSHIPS,
  SEED_VALIDATIONS,
  SEED_VERSIONS,
} from './seed-data';

function now(): string {
  return new Date().toISOString();
}

export function seedArchitectsPromptLibraryStore(): void {
  mutateArchitectsPromptLibraryStore((s: AplStore) => ({
    ...s,
    prompts: SEED_PROMPTS,
    versions: SEED_VERSIONS,
    collections: SEED_COLLECTIONS,
    dependencies: SEED_DEPENDENCIES,
    relationships: SEED_RELATIONSHIPS,
    executions: SEED_EXECUTIONS,
    validations: SEED_VALIDATIONS,
    modelPerformance: SEED_MODEL_PERFORMANCE,
    lessons: SEED_LESSONS,
    outputs: SEED_OUTPUTS,
    genesisRefs: SEED_GENESIS_REFS,
    launchStackRefs: SEED_LAUNCH_STACK_REFS,
    coreSystemRefs: SEED_CORE_SYSTEM_REFS,
    comparisons: SEED_COMPARISONS,
    recommendations: [],
    archivedPromptIds: [],
    orbLibrarianMode: true,
    seededAt: s.seededAt ?? now(),
    bootstrappedAt: now(),
    version: APL_SUBSYSTEM_VERSION,
  }));
}

export function ensureArchitectsPromptLibraryStore() {
  ensureExecutiveReflectionSuiteSubsystem();
  const store = readArchitectsPromptLibraryStore();
  if (!store.seededAt) {
    seedArchitectsPromptLibraryStore();
    updateBuildOrderSystemStatus('architects-prompt-library', 'implemented');
  }
  return readArchitectsPromptLibraryStore();
}

export function recordArchitectsPromptLibraryOpened(): void {
  mutateArchitectsPromptLibraryStore((s) => ({
    ...s,
    lastOpenedAt: now(),
  }));
}

export function listPromptTemplates(): AplPromptTemplate[] {
  return readArchitectsPromptLibraryStore().prompts.filter(
    (p) => !readArchitectsPromptLibraryStore().archivedPromptIds.includes(p.promptId)
  );
}

export function getPromptTemplate(promptId: string): AplPromptTemplate | undefined {
  return readArchitectsPromptLibraryStore().prompts.find((p) => p.promptId === promptId);
}

export function listArchivedPrompts(): AplPromptTemplate[] {
  const store = readArchitectsPromptLibraryStore();
  return store.prompts.filter((p) => store.archivedPromptIds.includes(p.promptId));
}

export function toggleOrbLibrarianMode(): boolean {
  let next = false;
  mutateArchitectsPromptLibraryStore((s) => {
    next = !s.orbLibrarianMode;
    return { ...s, orbLibrarianMode: next };
  });
  return next;
}

export function promotePromptToCanon(promptId: string): boolean {
  const prompt = getPromptTemplate(promptId);
  if (!prompt) return false;
  const validation = readArchitectsPromptLibraryStore().validations.find(
    (v) => v.promptId === promptId && v.canonizationEligible
  );
  if (!validation) return false;

  mutateArchitectsPromptLibraryStore((s) => ({
    ...s,
    prompts: s.prompts.map((p) =>
      p.promptId === promptId
        ? {
            ...p,
            canonical: true,
            lifecycleStage: 'canonized' as const,
            approvalStatus: 'canonized' as const,
            lastUpdated: now(),
          }
        : p
    ),
  }));
  return true;
}

export function archivePrompt(promptId: string, reason: string): void {
  mutateArchitectsPromptLibraryStore((s) => ({
    ...s,
    archivedPromptIds: s.archivedPromptIds.includes(promptId)
      ? s.archivedPromptIds
      : [...s.archivedPromptIds, promptId],
    prompts: s.prompts.map((p) =>
      p.promptId === promptId
        ? { ...p, lifecycleStage: 'archived' as const, archivedAt: now(), retirementReason: reason }
        : p
    ),
  }));
}
