import { bootRegistry } from './boot-registry';
import type { BootModuleContract, BootModuleSnapshot, StudioBootReport } from './types';
import { STUDIO_BOOT_EVENT } from './types';

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

let bootPromise: Promise<StudioBootReport> | null = null;
let lastReport: StudioBootReport | null = null;

function dispatchBootUpdated(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STUDIO_BOOT_EVENT, { detail: lastReport }));
  }
}

function snapshotModule(mod: BootModuleContract): BootModuleSnapshot {
  return {
    id: mod.id,
    name: mod.name,
    status: mod.status,
    dependencies: [...mod.dependencies],
    required: mod.required,
    errors: [...mod.errors],
    warnings: [...mod.warnings],
    fallback: mod.fallback,
  };
}

async function runModule(mod: BootModuleContract): Promise<void> {
  for (const depId of mod.dependencies) {
    const dep = bootRegistry.get(depId);
    if (!dep?.isReady()) {
      throw new Error(`Missing dependency: ${depId}`);
    }
  }

  mod.status = 'loading';
  mod.errors.length = 0;
  dispatchBootUpdated();

  try {
    await mod.initialize();
    if (mod.fallback) {
      mod.status = 'fallback';
      mod.warnings.push(mod.fallback);
    } else {
      mod.status = 'ready';
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    mod.errors.push(msg);
    if (mod.required) {
      mod.status = 'failed';
      throw err;
    }
    mod.status = 'fallback';
    mod.warnings.push(`Optional module failed: ${msg}`);
  }
}

/** StudioKernel™ — deterministic startup orchestrator. */
export async function runStudioKernelBoot(options?: {
  through?: StudioBootPhase;
  force?: boolean;
}): Promise<StudioBootReport> {
  const through = options?.through ?? 'ui-render';
  const throughIdx = STUDIO_BOOT_ORDER.indexOf(through);
  const order = STUDIO_BOOT_ORDER.slice(0, throughIdx + 1);

  if (!options?.force && bootPromise && lastReport?.ready) {
    return lastReport;
  }

  if (options?.force) {
    bootPromise = null;
    bootRegistry.resetRuntimeState();
  }

  if (!bootPromise) {
    bootPromise = (async () => {
      const startedAt = Date.now();
      const fallbacksUsed: string[] = [];
      const errors: string[] = [];
      const warnings: string[] = [];

      for (const id of order) {
        const mod = bootRegistry.get(id);
        if (!mod) {
          const msg = `Boot module not registered: ${id}`;
          errors.push(msg);
          if (id !== 'ui-render') continue;
        }
        if (!mod) continue;

        try {
          await runModule(mod);
          if (mod.status === 'fallback' && mod.fallback) {
            fallbacksUsed.push(mod.fallback);
          }
          warnings.push(...mod.warnings);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          errors.push(msg);
          if (mod.required) break;
        }
      }

      const modules = order
        .map((id) => bootRegistry.get(id))
        .filter((m): m is BootModuleContract => Boolean(m))
        .map(snapshotModule);

      const requiredReady = modules
        .filter((m) => m.required)
        .every((m) => m.status === 'ready' || m.status === 'fallback');

      const report: StudioBootReport = {
        ready: requiredReady,
        modules,
        errors,
        warnings,
        fallbacksUsed,
        startedAt,
        finishedAt: Date.now(),
      };

      lastReport = report;
      dispatchBootUpdated();
      return report;
    })().catch((err) => {
      bootPromise = null;
      throw err;
    });
  }

  return bootPromise;
}

export function getStudioBootReport(): StudioBootReport | null {
  return lastReport;
}

export function resetStudioKernelBoot(): void {
  bootPromise = null;
  lastReport = null;
  bootRegistry.resetRuntimeState();
}
