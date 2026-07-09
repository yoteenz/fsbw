import { bootRegistry } from './boot-registry';
import type {
  BootModuleContract,
  BootModuleSnapshot,
  StudioBootEventLogEntry,
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
let bootRunId = 0;
let activeBootRunId = 0;
let bootEventLog: StudioBootEventLogEntry[] = [];

function logBoot(moduleId: string, message: string, detail?: unknown): void {
  console.warn(`[StudioKernel] ${moduleId}: ${message}`, detail ?? '');
}

function appendBootEvent(kind: StudioBootEventLogEntry['kind'], message: string): void {
  const entry: StudioBootEventLogEntry = { ts: Date.now(), kind, message };
  bootEventLog = [...bootEventLog.slice(-49), entry];
  const prefix = kind === 'error' ? 'error' : kind === 'warn' ? 'warn' : 'log';
  console[prefix === 'log' ? 'log' : prefix](`[StudioBootstrap] ${message}`);
}

function isActiveBootRun(runId: number): boolean {
  return runId === activeBootRunId;
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
  safeMode: boolean,
  opts?: { started?: boolean; waitingForManualStart?: boolean }
): StudioBootLiveState {
  const modules = order.map((id) => {
    const mod = bootRegistry.get(id);
    return mod ? snapshotModule(mod) : idleSnapshot(id);
  });
  const started = opts?.started ?? bootStartedAt > 0;
  return {
    modules,
    currentModuleId,
    elapsedMs: bootStartedAt ? Date.now() - bootStartedAt : 0,
    complete,
    ready,
    started,
    waitingForManualStart: opts?.waitingForManualStart ?? false,
    eventLog: [...bootEventLog],
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
  safeMode: boolean,
  opts?: { started?: boolean; waitingForManualStart?: boolean }
): void {
  lastLiveState = buildLiveState(order, complete, ready, errors, warnings, fallbacksUsed, safeMode, opts);
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

async function runModule(mod: BootModuleContract, onProgress: () => void): Promise<void> {
  for (const depId of mod.dependencies) {
    const dep = bootRegistry.get(depId);
    if (!dep?.isReady() && dep?.status !== 'fallback' && dep?.status !== 'skipped' && dep?.status !== 'failed') {
      throw new Error(`Missing dependency: ${depId}`);
    }
  }

  mod.status = 'starting';
  mod.errors.length = 0;
  currentModuleId = mod.id;
  appendBootEvent('module', `module starting: ${mod.label}`);
  logBoot(mod.id, 'starting');
  onProgress();

  mod.status = 'running';
  appendBootEvent('module', `module running: ${mod.label}`);
  logBoot(mod.id, 'running');
  onProgress();

  try {
    await withBootTimeout(mod.initialize());
    if (mod.fallback) {
      mod.status = 'fallback';
      appendBootEvent('module', `module completed: ${mod.label} (fallback)`);
      logBoot(mod.id, 'ready (fallback)', mod.fallback);
    } else {
      mod.status = 'ready';
      appendBootEvent('module', `module completed: ${mod.label}`);
      logBoot(mod.id, 'ready');
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    appendBootEvent('error', `module failed: ${mod.label} — ${msg}`);
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
  /** When false, skip reset if boot is already in progress (StrictMode remount). */
  allowReset?: boolean;
};

function primeBootStart(
  order: readonly string[],
  safeMode: boolean
): number {
  const runId = ++bootRunId;
  activeBootRunId = runId;
  bootStartedAt = Date.now();
  currentModuleId = order[0] ?? null;
  appendBootEvent('info', 'bootstrap start requested');
  dispatchBootUpdated(order, false, false, [], [], [], safeMode, { started: true });
  return runId;
}

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

  const inProgress = Boolean(bootPromise && bootStartedAt > 0 && !lastLiveState?.complete);

  if (!options?.force && bootPromise && lastReport?.ready) {
    return lastReport;
  }

  if (!options?.force && inProgress) {
    return bootPromise!;
  }

  if (options?.force && options?.allowReset !== false) {
    activeBootRunId = 0;
    bootPromise = null;
    bootEventLog = [];
    bootRegistry.resetRuntimeState();
  } else if (options?.force && inProgress) {
    return bootPromise!;
  }

  if (!bootPromise) {
    const runId = primeBootStart(order, safeMode);
    bootPromise = (async () => {
      const fallbacksUsed: string[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!isActiveBootRun(runId)) {
        throw new Error('Boot run superseded');
      }

      for (const id of order) {
        if (!isActiveBootRun(runId)) {
          throw new Error('Boot run superseded');
        }
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
          dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode, { started: true });
          continue;
        }

        currentModuleId = id;
        dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode, { started: true });

        try {
          await runModule(mod, () => {
            dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode, { started: true });
          });
          if (!isActiveBootRun(runId)) {
            throw new Error('Boot run superseded');
          }
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

        dispatchBootUpdated(order, false, false, errors, warnings, fallbacksUsed, safeMode, { started: true });
      }

      if (!isActiveBootRun(runId)) {
        throw new Error('Boot run superseded');
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
      appendBootEvent('info', `bootstrap complete (ready=${report.ready ? 'yes' : 'no'})`);
      dispatchBootUpdated(order, true, report.ready, errors, warnings, fallbacksUsed, safeMode, { started: true });
      return report;
    })().catch((err) => {
      if (err instanceof Error && err.message === 'Boot run superseded') {
        return lastReport ?? {
          ready: false,
          modules: order.map((id) => idleSnapshot(id)),
          errors: [],
          warnings: [],
          fallbacksUsed: [],
          startedAt: bootStartedAt,
          finishedAt: Date.now(),
          safeMode,
        };
      }
      bootPromise = null;
      currentModuleId = null;
      const msg = err instanceof Error ? err.message : String(err);
      appendBootEvent('error', `bootstrap failed: ${msg}`);
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
  if (lastLiveState) {
    return {
      ...lastLiveState,
      elapsedMs: bootStartedAt ? Date.now() - bootStartedAt : lastLiveState.elapsedMs,
    };
  }
  if (bootStartedAt > 0) {
    return buildLiveState(STUDIO_BOOT_ORDER, false, false, [], [], [], false, { started: true });
  }
  return null;
}

export function getInitialBootLiveState(order: readonly string[] = STUDIO_BOOT_ORDER): StudioBootLiveState {
  return {
    modules: order.map(idleSnapshot),
    currentModuleId: null,
    elapsedMs: 0,
    complete: false,
    ready: false,
    started: false,
    waitingForManualStart: false,
    eventLog: [],
    errors: [],
    warnings: [],
    fallbacksUsed: [],
    safeMode: false,
  };
}

export function isStudioKernelBootInProgress(): boolean {
  return Boolean(bootPromise && bootStartedAt > 0 && !lastLiveState?.complete);
}

/** Explicit synchronous kick — sets elapsed timer and dispatches before first module runs. */
export function startStudioKernelBoot(options?: StudioKernelBootOptions): Promise<StudioBootReport> {
  return runStudioKernelBoot({ ...options, force: options?.force ?? true });
}

export function resetStudioKernelBoot(): void {
  activeBootRunId = 0;
  bootPromise = null;
  lastReport = null;
  lastLiveState = null;
  currentModuleId = null;
  bootStartedAt = 0;
  bootEventLog = [];
  bootRegistry.resetRuntimeState();
}

export function appendStudioBootDiagnosticsEvent(message: string): void {
  appendBootEvent('info', message);
  const order = STUDIO_BOOT_ORDER;
  if (lastLiveState) {
    lastLiveState = { ...lastLiveState, eventLog: [...bootEventLog] };
  } else {
    lastLiveState = buildLiveState(order, false, false, [], [], [], false, {
      started: bootStartedAt > 0,
      waitingForManualStart: bootStartedAt === 0,
    });
    lastLiveState.eventLog = [...bootEventLog];
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_BOOT_EVENT, { detail: lastLiveState }));
  }
}

export { BOOT_MODULE_TIMEOUT_MS, BOOT_MODULE_DISPLAY_LABELS };
