import { readFirstEnsure } from '../sync/profile-cache';
import {
  PRODUCTION_ORCHESTRATOR_STORAGE_KEY,
  PRODUCTION_ORCHESTRATOR_VERSION,
  STUDIO_OS_PRODUCTION_ORCHESTRATOR_UPDATED,
} from './constants';
import { generateArchitecturePrompt, generateProductionPackage, isArchitectureOutputComplete } from './package-builder';
import type {
  CreateProductionTaskInput,
  ProductionBoardTask,
  ProductionOrchestratorProfile,
  ProductionOrchestratorStore,
  ProductionOrchestratorStage,
} from './types';

function nowIso(): string {
  return new Date().toISOString();
}

function newId(prefix: string): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}`;
}

function emptyStore(): ProductionOrchestratorStore {
  return { version: PRODUCTION_ORCHESTRATOR_VERSION, profiles: [] };
}

function dispatchUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_OS_PRODUCTION_ORCHESTRATOR_UPDATED));
  }
}

export function readProductionOrchestratorStore(): ProductionOrchestratorStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(PRODUCTION_ORCHESTRATOR_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as ProductionOrchestratorStore;
    return { ...emptyStore(), ...parsed, version: PRODUCTION_ORCHESTRATOR_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeProductionOrchestratorStore(store: ProductionOrchestratorStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(PRODUCTION_ORCHESTRATOR_STORAGE_KEY, JSON.stringify(store));
  dispatchUpdated();
}

export function getOrganizationProductionOrchestratorProfile(organizationId: string): ProductionOrchestratorProfile | null {
  return readProductionOrchestratorStore().profiles.find((p) => p.organizationId === organizationId) ?? null;
}

function summarizeProfile(profile: ProductionOrchestratorProfile): ProductionOrchestratorProfile {
  const architectureQueuedCount = profile.tasks.filter((t) =>
    ['architecture-queued', 'architecture-running'].includes(t.currentStage)
  ).length;
  const implementationReadyCount = profile.tasks.filter((t) => t.currentStage === 'implementation-ready').length;
  const blockedCount = profile.tasks.filter((t) => t.status === 'blocked').length;
  const reviewNeededCount = profile.tasks.filter((t) => t.currentStage === 'review-needed').length;
  const approvedCount = profile.tasks.filter((t) => t.currentStage === 'approved').length;

  return {
    ...profile,
    architectureQueuedCount,
    implementationReadyCount,
    blockedCount,
    reviewNeededCount,
    approvedCount,
    dockLine:
      blockedCount > 0
        ? `${blockedCount} production task blocked — founder or architecture decision required.`
        : `${implementationReadyCount} Composer handoff package${implementationReadyCount === 1 ? '' : 's'} ready. ${architectureQueuedCount} architecture queue item${architectureQueuedCount === 1 ? '' : 's'} active.`,
  };
}

function upsertProfile(profile: ProductionOrchestratorProfile): ProductionOrchestratorProfile {
  const summarized = summarizeProfile({ ...profile, updatedAt: nowIso() });
  const store = readProductionOrchestratorStore();
  const next = store.profiles.filter((p) => p.organizationId !== profile.organizationId);
  writeProductionOrchestratorStore({ ...store, profiles: [...next, summarized] });
  return summarized;
}

function createBoardTask(input: CreateProductionTaskInput, stage: ProductionOrchestratorStage = 'architecture-queued'): ProductionBoardTask {
  const createdAt = nowIso();
  const productionPackage = generateProductionPackage(input);
  return {
    id: newId('spo'),
    featureName: input.featureName.trim() || 'Untitled Studio World Feature',
    founderIntent: input.founderIntent.trim(),
    currentStage: stage,
    assignedModel: stage === 'idea' ? 'founder' : 'gpt-5.5',
    prompt: generateArchitecturePrompt(input),
    output: '',
    dependencies: input.dependencies ?? [],
    status: stage === 'idea' ? 'queued' : 'queued',
    nextRequiredAction: 'Send architecture prompt to GPT-5.5 and wait for architecture output.',
    blockingIssues: [],
    reviewState: 'not-started',
    requiresAssets: input.requiresAssets ?? false,
    requiresMotion: input.requiresMotion ?? false,
    createdAt,
    updatedAt: createdAt,
    gate: {
      architectureComplete: false,
      dependenciesResolved: (input.dependencies ?? []).length === 0,
      founderApproval: false,
      autoApprovalAllowed: input.autoApprovalAllowed ?? false,
    },
    productionPackage,
    handoffLog: [`${createdAt}: Founder Intent™ captured and Architecture Prompt Queue™ populated.`],
  };
}

function buildDemoTasks(): ProductionBoardTask[] {
  const seedArchitecture = [
    'Architecture summary: Build a Studio World production board with React and TypeScript, local Studio OS state, route registration, and production package generation.',
    'Implementation requirements: add a dedicated /admin/studio/production-orchestrator page, model handoff stages, gated Composer queue, package panels, and review checklist.',
    'Testing checklist: run TypeScript and Vite build, verify route registration, verify incomplete architecture blocks Composer.',
    'Knowledge Core / ADR: record the production handoff workflow, model roles, automation gates, and decision audit requirements.',
  ].join('\n');
  const task = createBoardTask(
    {
      featureName: 'Studio Production Orchestrator™',
      founderIntent: 'Submit one Studio World idea and route it through GPT architecture, Composer implementation, OpenArt/FAL assets, Kling motion, review, Knowledge Core, and ADR updates.',
      dependencies: ['Model Orchestrator™', 'Workflow Engine™', 'Prompt Registry™', 'Knowledge Registry™', 'Decision Audit™'],
      requiresAssets: true,
      requiresMotion: true,
      autoApprovalAllowed: false,
    },
    'implementation-ready'
  );
  return [
    {
      ...task,
      output: seedArchitecture,
      assignedModel: 'composer-2.5',
      status: 'ready',
      nextRequiredAction: 'Founder approval required before Composer can begin.',
      gate: {
        architectureComplete: true,
        dependenciesResolved: true,
        founderApproval: false,
        autoApprovalAllowed: false,
      },
      productionPackage: generateProductionPackage(
        {
          featureName: task.featureName,
          founderIntent: task.founderIntent,
          dependencies: task.dependencies,
          requiresAssets: task.requiresAssets,
          requiresMotion: task.requiresMotion,
          autoApprovalAllowed: false,
        },
        seedArchitecture
      ),
      handoffLog: [
        ...task.handoffLog,
        `${nowIso()}: GPT Architecture Output™ saved and Composer Implementation Queue™ package generated.`,
      ],
    },
  ];
}

export function syncProductionOrchestratorFromSources(organizationId: string): ProductionOrchestratorProfile {
  const existing = getOrganizationProductionOrchestratorProfile(organizationId);
  if (existing) return upsertProfile(existing);

  return upsertProfile({
    organizationId,
    companyName: 'Studio World',
    updatedAt: nowIso(),
    tasks: buildDemoTasks(),
    activeTaskId: '',
    architectureQueuedCount: 0,
    implementationReadyCount: 0,
    blockedCount: 0,
    reviewNeededCount: 0,
    approvedCount: 0,
    dockLine: '',
  });
}

export function ensureOrganizationProductionOrchestratorProfile(organizationId: string): ProductionOrchestratorProfile {
  return readFirstEnsure(
    organizationId,
    getOrganizationProductionOrchestratorProfile,
    syncProductionOrchestratorFromSources
  );
}

function updateTask(
  organizationId: string,
  taskId: string,
  updater: (task: ProductionBoardTask) => ProductionBoardTask
): ProductionOrchestratorProfile {
  const profile = ensureOrganizationProductionOrchestratorProfile(organizationId);
  return upsertProfile({
    ...profile,
    activeTaskId: taskId,
    tasks: profile.tasks.map((task) => (task.id === taskId ? updater(task) : task)),
  });
}

export function createProductionBoardTask(
  organizationId: string,
  input: CreateProductionTaskInput
): ProductionOrchestratorProfile {
  const profile = ensureOrganizationProductionOrchestratorProfile(organizationId);
  const task = createBoardTask(input);
  return upsertProfile({
    ...profile,
    activeTaskId: task.id,
    tasks: [task, ...profile.tasks],
  });
}

export function markArchitectureRunning(organizationId: string, taskId: string): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => ({
    ...task,
    currentStage: 'architecture-running',
    assignedModel: 'gpt-5.5',
    status: 'running',
    nextRequiredAction: 'Wait for GPT-5.5 architecture output, then save it to trigger handoff detection.',
    updatedAt: nowIso(),
    handoffLog: [...task.handoffLog, `${nowIso()}: GPT-5.5 architecture run started.`],
  }));
}

export function saveArchitectureOutput(
  organizationId: string,
  taskId: string,
  architectureOutput: string
): ProductionOrchestratorProfile {
  const complete = isArchitectureOutputComplete(architectureOutput);
  return updateTask(organizationId, taskId, (task) => {
    const nextPackage = generateProductionPackage(
      {
        featureName: task.featureName,
        founderIntent: task.founderIntent,
        dependencies: task.dependencies,
        requiresAssets: task.requiresAssets,
        requiresMotion: task.requiresMotion,
        autoApprovalAllowed: task.gate.autoApprovalAllowed,
      },
      architectureOutput
    );

    if (!complete) {
      return {
        ...task,
        currentStage: 'architecture-running',
        assignedModel: 'gpt-5.5',
        output: architectureOutput,
        status: 'blocked',
        nextRequiredAction: 'Architecture output is missing required implementation, testing, Knowledge Core, or ADR details.',
        blockingIssues: ['GPT output incomplete or conflicting — Composer handoff blocked.'],
        updatedAt: nowIso(),
        productionPackage: nextPackage,
        handoffLog: [...task.handoffLog, `${nowIso()}: Architecture Completion Detection™ failed; task marked blocked.`],
      };
    }

    return {
      ...task,
      currentStage: 'implementation-ready',
      assignedModel: 'composer-2.5',
      prompt: nextPackage.composerPrompt,
      output: architectureOutput,
      status: 'ready',
      nextRequiredAction:
        task.gate.dependenciesResolved && (task.gate.founderApproval || task.gate.autoApprovalAllowed)
          ? 'Composer can proceed.'
          : 'Founder approval and dependency resolution required before Composer begins.',
      blockingIssues: [],
      updatedAt: nowIso(),
      gate: { ...task.gate, architectureComplete: true },
      productionPackage: nextPackage,
      handoffLog: [
        ...task.handoffLog,
        `${nowIso()}: GPT Architecture Output™ saved; Composer prompt, asset prompts, motion prompts, Knowledge Core updates, and ADR requirements generated automatically.`,
      ],
    };
  });
}

export function setDependenciesResolved(
  organizationId: string,
  taskId: string,
  resolved: boolean
): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => ({
    ...task,
    gate: { ...task.gate, dependenciesResolved: resolved },
    blockingIssues: resolved ? task.blockingIssues.filter((issue) => !issue.includes('Dependencies')) : [...task.blockingIssues, 'Dependencies unresolved.'],
    nextRequiredAction: resolved ? 'Founder approval can unlock Composer.' : 'Resolve dependencies before Composer begins.',
    updatedAt: nowIso(),
  }));
}

export function approveProductionHandoff(organizationId: string, taskId: string): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => ({
    ...task,
    gate: { ...task.gate, founderApproval: true },
    nextRequiredAction: task.gate.architectureComplete && task.gate.dependenciesResolved ? 'Composer can proceed.' : task.nextRequiredAction,
    updatedAt: nowIso(),
    handoffLog: [...task.handoffLog, `${nowIso()}: Founder approval recorded for Composer Implementation Queue™.`],
  }));
}

export function startComposerImplementation(organizationId: string, taskId: string): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => {
    const canStart = task.gate.architectureComplete && task.gate.dependenciesResolved && (task.gate.founderApproval || task.gate.autoApprovalAllowed);
    if (!canStart) {
      return {
        ...task,
        status: 'blocked',
        blockingIssues: ['Composer gate failed: architecture complete, dependencies resolved, and founder approval or auto-approval are required.'],
        nextRequiredAction: 'Clear automation gate before starting Composer.',
        updatedAt: nowIso(),
      };
    }

    return {
      ...task,
      currentStage: 'composer-running',
      assignedModel: 'composer-2.5',
      status: 'running',
      nextRequiredAction: 'Composer implementation running; capture output when complete.',
      updatedAt: nowIso(),
      handoffLog: [...task.handoffLog, `${nowIso()}: Composer Implementation Queue™ started.`],
    };
  });
}

export function completeImplementation(organizationId: string, taskId: string, implementationOutput: string): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => {
    const nextStage: ProductionOrchestratorStage = task.requiresAssets
      ? 'assets-needed'
      : task.requiresMotion
        ? 'motion-needed'
        : 'review-needed';

    return {
      ...task,
      currentStage: nextStage,
      output: implementationOutput || task.output,
      assignedModel: task.requiresAssets ? 'openart-fal' : task.requiresMotion ? 'kling' : 'founder',
      status: nextStage === 'review-needed' ? 'ready' : 'queued',
      reviewState: nextStage === 'review-needed' ? 'founder-review' : task.reviewState,
      nextRequiredAction:
        nextStage === 'assets-needed'
          ? 'Queue OpenArt/FAL visual asset prompts.'
          : nextStage === 'motion-needed'
            ? 'Queue Kling motion prompts.'
            : 'Founder review required.',
      updatedAt: nowIso(),
      handoffLog: [...task.handoffLog, `${nowIso()}: Implementation complete; routed to ${nextStage}.`],
    };
  });
}

export function advanceMediaQueue(organizationId: string, taskId: string): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => {
    const nextStage: ProductionOrchestratorStage =
      task.currentStage === 'assets-needed' && task.requiresMotion ? 'motion-needed' : 'review-needed';
    return {
      ...task,
      currentStage: nextStage,
      assignedModel: nextStage === 'motion-needed' ? 'kling' : 'founder',
      status: nextStage === 'review-needed' ? 'ready' : 'queued',
      reviewState: nextStage === 'review-needed' ? 'founder-review' : task.reviewState,
      nextRequiredAction: nextStage === 'motion-needed' ? 'Queue Kling motion prompts.' : 'Founder review required.',
      updatedAt: nowIso(),
      handoffLog: [...task.handoffLog, `${nowIso()}: Media queue advanced to ${nextStage}.`],
    };
  });
}

export function approveProductionTask(organizationId: string, taskId: string): ProductionOrchestratorProfile {
  return updateTask(organizationId, taskId, (task) => ({
    ...task,
    currentStage: 'approved',
    assignedModel: 'founder',
    status: 'approved',
    reviewState: 'approved',
    nextRequiredAction: 'Archive after Knowledge Core and ADR updates are committed.',
    updatedAt: nowIso(),
    handoffLog: [...task.handoffLog, `${nowIso()}: Founder approved; Knowledge Core / ADR update ready.`],
  }));
}
