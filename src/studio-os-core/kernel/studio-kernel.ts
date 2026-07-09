import { bootRegistry } from './boot-registry';
import type {
  BootModuleContract,
  BootModuleSnapshot,
  StudioBootLiveState,
  StudioBootReport,
} from './types';
import {
  BOOT_MODULE_DISPLAY_LABELS,
  BOOT_MODULE_TIMEOUT_MS,
  STUDIO_BOOT_EVENT,
} from './types';

/** Canonical boot order — strict dependency sequence. */
export const STUDIO_BOOT_ORDER = [
  'storage',
  'auth-session',
  'admin-context',
  'platform-dna',
  'brand-registry',
  'department-registry',
  'scene-registry',
  'state-dna',
  'design-dna-resolver',
  'experience-runtime',
  'workspace-runtime',
  'ui-render',
] as const;

export type StudioBootPhase = (typeof STUDIO_BOOT_ORDER)[number];

const SAFE_MODE_SKIP_MODULES = new Set<string>(['workspace-runtime']);

let bootPromise: Promise<StudioBootReport> | null = null;
let lastReport: StudioBootReport | null = null;
let lastLiveState: StudioBootLiveState | null = null;
let bootStartedAt = 0;
let currentModuleId: string | null = null;

function logBoot(moduleId: string, message: string, detail?: unknown): void {
  console.warn(`[StudioKernel] ${moduleId}: ${message}`, detail ?? '');
}

function snapshotModule(mod: BootModuleContract): BootModuleSnapshot {
  return {
    id: mod.id,
    name: mod.name,
    label: mod.label,
    status: mod.status,
    dependencies: [...mod.dependencies],
    required: mod.required,
    errors: [...mod.errors],
    warnings: [...mod.warnings],
    fallback: mod.fallback,
  };
}

function idleSnapshot(id: string): BootModuleSnapshot {
  const mod = bootRegistry.get(id);
  return {
    id,
    name: mod?.name ?? id,
    label: BOOT_MODULE_DISPLAY_LABELS[id] ?? id,
    status: 'idle',
    dependencies: mod?.dependencies ?? [],
    required: mod?.required ?? true,
    errors: [],
    warnings: [],
  };
}

function buildLiveState(
  order: readonly string[],
  complete: boolean,
  ready: boolean,
  errors: string[],
  warnings: string[],
  fallbacksUsed: string[],
  safeMode: boolean
): StudioBootLiveState {
  const modules = order.map((id) => {
    const mod = bootRegistry.get(id);
    return mod ? snapshotModule(mod) : idleSnapshot(id);
  });
  return {
    modules,
    currentModuleId,
    elapsedMs: bootStartedAt ? Date.now() - bootStartedAt : 0,
    complete,
    ready,
    errors,
    warnings,
    fallbacksUsed,
    safeMode,
  };
}

function dispatchBootUpdated(
  order: readonly string[],
  complete: boolean,
  ready: boolean,
  errors: string[],
  warnings: string[],
  fallbacksUsed: string[],
  safeMode: boolean
): void {
  lastLiveState = buildLiveState(order, complete, ready, errors, warnings, fallbacksUsed, safeMode);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_BOOT_EVENT, { detail: lastLiveState }));
  }
}

async function withBootTimeout(promise: Promise<void>): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    await Promise.race([
      promise,
      new Promise<void>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Boot module timed out')), BOOT_MODULE_TIMEOUT_MS);
      }),
    ]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

function applyModuleFallback(mod: BootModuleContract, reason: string): void {
  mod.errors.push(reason);
  mod.fallback = mod.fallback ?? `Using safe defaults (${mod.label})`;
  mod.warnings.push(mod.fallback);
  mod.status = mod.status === 'failed' ? 'failed' : 'fallback';
  if (reason === 'Boot module timed out') {
    mod.status = 'failed';
    logBoot(mod.id, 'timed out — continuing with fallback if available');
  }
  if (mod.fallback) {
    mod.status = 'fallback';
  }
}

async function runModule(mod: BootModuleContract): Promise<void> {
  for (const depId of mod.dependencies) {
    const dep = bootRegistry.get(depId);
    if (!dep?.isReady() && dep?.status !== 'fallback' && dep?.status !== 'skipped' && dep?.status !== 'failed') {
      throw new Error(`Missing dependency: ${depId}`);
    }
  }

  mod.status = 'loading';
  mod.errors.length = 0;
  currentModuleId = mod.id;
  logBoot(mod.id, 'loading');

  try {
    await withBootTimeout(mod.initialize());
    if (mod.fallback) {
      mod.status = 'fallback';
      logBoot(mod.id, 'ready (fallback)', mod.fallback);
    } else {
      mod.status = 'ready';
      logBoot(mod.id, 'ready');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    logBoot(mod.id, 'error', msg);
    applyModuleFallback(mod, msg);
    if (msg === 'Boot module timed out') {
      mod.status = 'failed';
      mod.errors.push('Boot module timed out');
      if (mod.fallback) mod.status = 'fallback';
    }
  } finally {
    currentModuleId = null;
  }
}

function markSkipped(mod: BootModuleContract, reason: string): void {
  mod.status = 'skipped';
  mod.warnings.push(reason);
  mod.fallback = mod.fallback ?? reason;
  logBoot(mod.id, 'skipped', reason);
}

export type StudioKernelBootOptions = {
  through?: StudioBootPhase;
  force?: boolean;
  skipModuleIds?: string[];
  safeMode?: boolean;
};

/** StudioKernel™ — deterministic startup orchestrator (never hangs silently). */
export async function runStudioKernelBoot(options?: StudioKernelBootOptions): Promise<StudioBootReport> {
  const through = options?.through ?? 'ui-render';
  const throughIdx = STUDIO_BOOT_ORDER.indexOf(through);
  const order = STUDIO_BOOT_ORDER.slice(0, throughIdx + 1);
  const skipIds = new Set(options?.skipModuleIds ?? []);
  const safeMode = options?.safeMode ?? false;
  if (safeMode) {
    for (const id of SAFE_MODE_SKIP_MODULES) skipIds.add(id);
  }

  if (!options?.force && bootPromise && lastReport?.ready) {
    return lastReport;
  }

  if (options?.force) {
    bootPromise = null;
    bootRegistry.resetRuntimeState();
  }

  if (!bootPromise) {
    bootPromise = (async () => {
      bootStartedAt = Date.now();
      currentModuleId = null;
      const fallbacksUsed: string[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode);

      for (const id of order) {
        const mod = bootRegistry.get(id);
        if (!mod) {
          const msg = `Boot module not registered: ${id}`;
          errors.push(msg);
          logBoot(id, msg);
          continue;
        }

        if (skipIds.has(id)) {
          markSkipped(mod, 'Skipped by emergency bypass');
          fallbacksUsed.push(`${id}: skipped`);
          dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode);
          continue;
        }

        currentModuleId = id;
        dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode);

        try {
          await runModule(mod);
          if (mod.status === 'fallback' && mod.fallback) {
            fallbacksUsed.push(mod.fallback);
          }
          if (mod.status === 'failed') {
            errors.push(...mod.errors);
          }
          warnings.push(...mod.warnings);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(msg);
          applyModuleFallback(mod, msg);
          warnings.push(...mod.warnings);
          if (mod.fallback) fallbacksUsed.push(mod.fallback);
        }

        dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode);
      }

      currentModuleId = null;

      const modules = order
        .map((id) => bootRegistry.get(id))
        .filter((m): m is BootModuleContract => Boolean(m))
        .map(snapshotModule);

      const requiredReady = modules
        .filter((m) => m.required)
        .every((m) => m.status === 'ready' || m.status === 'fallback' || m.status === 'skipped' || m.status === 'failed');

      const report: StudioBootReport = {
        ready: requiredReady && errors.length === 0,
        modules,
        errors,
        warnings,
        fallbacksUsed,
        startedAt: bootStartedAt,
        finishedAt: Date.now(),
        currentModuleId: null,
        elapsedMs: Date.now() - bootStartedAt,
        safeMode,
      };

      lastReport = report;
      dispatchBootUpdated(order, true, report.ready, errors, warnings, fallbacksUsed, safeMode);
      return report;
    })().catch((err) => {
      bootPromise = null;
      currentModuleId = null;
      const msg = err instanceof Error ? err.message : String(err);
      logBoot('kernel', 'fatal', msg);
      throw err;
    });
  }

  return bootPromise;
}

export function getStudioBootReport(): StudioBootReport | null {
  return lastReport;
}

export function getStudioBootLiveState(): StudioBootLiveState | null {
  if (!lastLiveState) return null;
  return {
    ...lastLiveState,
    elapsedMs: bootStartedAt ? Date.now() - bootStartedAt : lastLiveState.elapsedMs,
  };
}

export function getInitialBootLiveState(order: readonly string[] = STUDIO_BOOT_ORDER): StudioBootLiveState {
  return {
    modules: order.map(idleSnapshot),
    currentModuleId: null,
    elapsedMs: 0,
    complete: false,
    ready: false,
    errors: [],
    warnings: [],
    fallbacksUsed: [],
    safeMode: false,
  };
}

export function resetStudioKernelBoot(): void {
  bootPromise = null;
  lastReport = null;
  lastLiveState = null;
  currentModuleId = null;
  bootStartedAt = 0;
  bootRegistry.resetRuntimeState();
}

export { BOOT_MODULE_TIMEOUT_MS, BOOT_MODULE_DISPLAY_LABELS };
