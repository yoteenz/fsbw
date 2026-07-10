/**
 * Staged dynamic loaders — no later-stage module evaluates until its stage is active.
 */

import {
  recordFreezeCheckpoint,
  saveBisectSessionReport,
  getLatestFreezeCheckpoint,
  getFreezeTraceRing,
  getBisectRenderCounts,
} from './freeze-trace-ledger';

export type BisectStageMeta = {
  id: number;
  label: string;
  description: string;
};

export const BISECT_STAGES: BisectStageMeta[] = [
  { id: 0, label: 'Heartbeats only', description: 'Plain DOM + RAF/timeout/CSS pulse. No EE imports.' },
  { id: 1, label: 'Route shell', description: 'Static Experience Engine bisect shell text.' },
  { id: 2, label: 'Error boundary', description: 'PlatformErrorBoundary wrapper.' },
  { id: 3, label: 'Auth/session read', description: 'Sync read auth keys from localStorage (no providers).' },
  { id: 4, label: 'Workspace context', description: 'WorkspaceProvider + workspaces bootstrap.' },
  { id: 5, label: 'Experience Engine DNA', description: 'repairExperienceEngineDnaIfNeeded + ensureExperienceEngineDnaSubsystem.' },
  { id: 6, label: 'Experience Runtime', description: 'ensureExperienceRuntimeSubsystem (dynamic).' },
  { id: 7, label: 'Scene Stack read', description: 'readSceneStack layer count for EE station (dynamic).' },
  { id: 8, label: 'Brand DNA resolve', description: 'resolveExperienceProfile once (dynamic).' },
  { id: 9, label: 'Experience graph', description: 'buildExperienceEngineReadyView once (dynamic).' },
  { id: 10, label: 'Preview compiler', description: 'compileCreativeStudioPreview read-only (dynamic).' },
  { id: 11, label: 'Orb integration', description: 'StudioOrbProvider + useOrbState mount (dynamic).' },
  { id: 12, label: 'Full EE UI', description: 'DepartmentGoldenBuildShell + ExperienceEngineDnaWorkspace (dynamic).' },
];

export type StageRunResult = {
  stage: number;
  ok: boolean;
  error?: string;
  detail?: string;
};

function checkpoint(stage: number, component: string, fn: string, phase: 'enter' | 'exit', detail?: string): void {
  recordFreezeCheckpoint({
    route: '/__experience-engine-bisect',
    stage,
    component,
    function: fn,
    phase,
    detail,
  });
}

function readMtdSnapshot(): Record<string, unknown> | null {
  try {
    const win = window as unknown as { __MTD?: () => Record<string, unknown> };
    if (typeof win.__MTD === 'function') return win.__MTD() as Record<string, unknown>;
  } catch {
    /* ignore */
  }
  return null;
}

function detectCssAnimationRunning(): boolean | null {
  const el = document.querySelector('[data-ee-css-heartbeat]');
  if (!el) return null;
  const style = getComputedStyle(el, '::after');
  const anim = style.animationName || style.getPropertyValue('animation-name');
  return anim !== 'none' && anim !== '';
}

function authPresent(): boolean {
  try {
    return localStorage.getItem('isSignedIn') === 'true' || Boolean(localStorage.getItem('currentUser'));
  } catch {
    return false;
  }
}

function genesisBytes(): number {
  try {
    const raw = localStorage.getItem('genesis_v1');
    return raw?.length ?? 0;
  } catch {
    return 0;
  }
}

/** Run stages 0..maxStage sequentially with enter/exit checkpoints. */
export async function runBisectStages(maxStage: number): Promise<StageRunResult[]> {
  const results: StageRunResult[] = [];
  const cap = Math.min(Math.max(0, maxStage), 12);

  for (let s = 0; s <= cap; s += 1) {
    checkpoint(s, `stage-${s}`, 'runBisectStages', 'enter');
    try {
      const detail = await executeStage(s);
      results.push({ stage: s, ok: true, detail });
      checkpoint(s, `stage-${s}`, 'runBisectStages', 'exit', detail);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      results.push({ stage: s, ok: false, error: message });
      checkpoint(s, `stage-${s}`, 'runBisectStages', 'exit', `error:${message}`);
      break;
    }
  }

  saveBisectSessionReport({
    route: '/__experience-engine-bisect',
    targetStage: cap,
    completedStage: results.filter((r) => r.ok).length ? results[results.length - 1].stage : -1,
    privateMode: detectPrivateMode(),
    visibilityState: document.visibilityState,
    mtdSnapshot: readMtdSnapshot(),
    cssAnimationRunning: detectCssAnimationRunning(),
    authPresent: authPresent(),
    genesisBytes: genesisBytes(),
    lastCheckpoint: getLatestFreezeCheckpoint(),
    ring: getFreezeTraceRing(),
    renderCounts: getBisectRenderCounts(),
    userAgent: navigator.userAgent,
  });

  return results;
}

function detectPrivateMode(): boolean {
  try {
    // Heuristic: empty genesis + no studio keys often indicates fresh/private session.
    const genesis = localStorage.getItem('genesis_v1');
    if (!genesis) return true;
    return false;
  } catch {
    return false;
  }
}

async function executeStage(stage: number): Promise<string> {
  switch (stage) {
    case 0:
      return 'heartbeats-active';

    case 1:
      return 'static-shell-mounted';

    case 2: {
      await import('../../platform-stabilization/PlatformErrorBoundary');
      return 'error-boundary-imported';
    }

    case 3: {
      const signedIn = localStorage.getItem('isSignedIn');
      const user = localStorage.getItem('currentUser');
      return `auth-read signedIn=${signedIn ?? 'null'} user=${user ? `${user.length}b` : 'null'}`;
    }

    case 4: {
      const { ensureWorkspacesBootstrapped } = await import('../../utils/ensureWorkspacesBootstrapped');
      checkpoint(4, 'WorkspaceBootstrap', 'ensureWorkspacesBootstrapped', 'enter');
      await ensureWorkspacesBootstrapped();
      checkpoint(4, 'WorkspaceBootstrap', 'ensureWorkspacesBootstrapped', 'exit');
      return 'workspaces-bootstrapped';
    }

    case 5: {
      const { repairExperienceEngineDnaIfNeeded } = await import(
        '../../studio-os-core/genesis/experience-engine/repair'
      );
      const { ensureExperienceEngineDnaSubsystem } = await import(
        '../../studio-os-core/genesis/experience-engine/engine'
      );
      checkpoint(5, 'ExperienceEngineDna', 'repairExperienceEngineDnaIfNeeded', 'enter');
      const repair = repairExperienceEngineDnaIfNeeded();
      checkpoint(5, 'ExperienceEngineDna', 'repairExperienceEngineDnaIfNeeded', 'exit', repair.reasons.join(';'));
      checkpoint(5, 'ExperienceEngineDna', 'ensureExperienceEngineDnaSubsystem', 'enter');
      ensureExperienceEngineDnaSubsystem();
      checkpoint(5, 'ExperienceEngineDna', 'ensureExperienceEngineDnaSubsystem', 'exit');
      return `ee-dna repair=${repair.repaired}`;
    }

    case 6: {
      const { ensureExperienceRuntimeSubsystem } = await import('../../studio-os-core/genesis/experience-runtime/engine');
      checkpoint(6, 'ExperienceRuntime', 'ensureExperienceRuntimeSubsystem', 'enter');
      ensureExperienceRuntimeSubsystem();
      checkpoint(6, 'ExperienceRuntime', 'ensureExperienceRuntimeSubsystem', 'exit');
      return 'experience-runtime-ensured';
    }

    case 7: {
      const { readGenesisStore } = await import('../../studio-os-core/genesis/persistence/store');
      checkpoint(7, 'SceneStack', 'readGenesisStore', 'enter');
      void readGenesisStore();
      checkpoint(7, 'SceneStack', 'readGenesisStore', 'exit');
      const { getSceneStackLayerRecord } = await import('../../studio-os-core/scene-stack/store');
      const rec = getSceneStackLayerRecord('creative-direction', 'default', 'arrival-zone', 'environment-shell');
      return `scene-stack-probe shell=${rec?.publicUrl ? 'yes' : 'no'}`;
    }

    case 8: {
      const { resolveExperienceProfile } = await import(
        '../../studio-os-core/genesis/experience-engine/engines/experience-generator'
      );
      checkpoint(8, 'BrandDna', 'resolveExperienceProfile', 'enter');
      const profile = resolveExperienceProfile({ brandId: 'studio-os' });
      checkpoint(8, 'BrandDna', 'resolveExperienceProfile', 'exit');
      return `brand=${profile.brandId} dept=${profile.departmentId}`;
    }

    case 9: {
      const { buildExperienceEngineReadyView } = await import(
        '../../studio-os-core/genesis/experience-engine/room/ready-view'
      );
      checkpoint(9, 'ExperienceGraph', 'buildExperienceEngineReadyView', 'enter');
      const view = buildExperienceEngineReadyView({ pathname: '/admin/studio/experience-engine' });
      checkpoint(9, 'ExperienceGraph', 'buildExperienceEngineReadyView', 'exit');
      return `brands=${view.brands.length} scenes=${view.scenes.length}`;
    }

    case 10: {
      const { compileCreativeStudioPreview } = await import('../../studio-os-core/creative-studio-preview/compiler');
      checkpoint(10, 'PreviewCompiler', 'compileCreativeStudioPreview', 'enter');
      const preview = compileCreativeStudioPreview('studio-os');
      checkpoint(10, 'PreviewCompiler', 'compileCreativeStudioPreview', 'exit');
      return `concepts=${preview.concepts.length}`;
    }

    case 11: {
      checkpoint(11, 'Orb', 'dynamic-import-orb-hook', 'enter');
      const { buildOrbReadyViewSnapshot } = await import('../../studio-os-core/genesis/orb/engine');
      const snap = buildOrbReadyViewSnapshot({ pathname: '/admin/studio/experience-engine' });
      checkpoint(11, 'Orb', 'buildOrbReadyViewSnapshot', 'exit');
      return `orb-memories=${snap.memoryTimeline.length}`;
    }

    case 12: {
      checkpoint(12, 'FullUI', 'dynamic-import-workspace', 'enter');
      await import('../../components/admin/studio/experience-engine-dna/ExperienceEngineDnaWorkspace');
      checkpoint(12, 'FullUI', 'dynamic-import-workspace', 'exit', 'chunk-evaluated-not-mounted');
      return 'ee-workspace-chunk-loaded';
    }

    default:
      return 'unknown';
  }
}
