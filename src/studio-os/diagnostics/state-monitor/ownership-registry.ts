import type { OwnershipConflict } from '../types';

/** Static ownership map — evidence baseline for state ownership report. */
export const STATE_OWNERSHIP: Record<
  string,
  { owner: string; secondaryOwners: string[]; subscribers: string[]; writers: string[]; readers: string[] }
> = {
  heartbeat: {
    owner: 'platform-stabilization/main-thread-diagnostics.ts',
    secondaryOwners: [],
    subscribers: ['post-load-render-guard', 'loadingTerminalRegistry'],
    writers: ['initMainThreadDiagnostics'],
    readers: ['__MTD', 'thread-heartbeat page'],
  },
  sceneStack: {
    owner: 'studio-os-core/scene-stack/store.ts',
    secondaryOwners: ['useCreativeStudioRenderPreview'],
    subscribers: ['CreativeStudioRenderPreview', 'scene-stack-hydrated listeners'],
    writers: ['compileStation', 'ensureStation', 'ephemeral-validation-registry'],
    readers: ['getLayerViews', 'getCompositeStatus'],
  },
  compiler: {
    owner: 'studio-os-core/scene-stack/world-compiler',
    secondaryOwners: ['validation-shell-pipeline'],
    subscribers: ['render-pipeline-progress'],
    writers: ['compileStation', 'compileCreativeStudioPreview'],
    readers: ['useCreativeStudioRenderPreview'],
  },
  registry: {
    owner: 'studio-os-core/genesis/persistence/store.ts',
    secondaryOwners: ['genesis/engine.ts subsystems'],
    subscribers: ['useOrbState', 'useExperienceEngineDnaState', 'useGenesisState', '20+ genesis hooks'],
    writers: ['mutateGenesisStore', 'writeGenesisStore', 'repairExperienceEngineDnaIfNeeded'],
    readers: ['readGenesisStore'],
  },
  genesis: {
    owner: 'localStorage.genesis_v1',
    secondaryOwners: ['genesis/persistence/store.ts cache'],
    subscribers: ['GENESIS_UPDATED_EVENT listeners'],
    writers: ['writeGenesisStore', 'bootstrapGenesisStoreIfEmpty'],
    readers: ['readGenesisStore'],
  },
  shell: {
    owner: 'scene-stack/world-compiler/immutable-shell.ts',
    secondaryOwners: ['ephemeral-validation-registry'],
    subscribers: ['shell-diagnostics'],
    writers: ['validation-shell-pipeline', 'registerEphemeralValidationShell'],
    readers: ['getSceneStackLayerRecord'],
  },
  station: {
    owner: 'scene-stack/store.ts (per stationId)',
    secondaryOwners: ['useCreativeStudioRenderPreview'],
    subscribers: ['CreativeStudioRenderPreview'],
    writers: ['ensureStation', 'compileStation'],
    readers: ['getStationPipelineProgress'],
  },
  compileJob: {
    owner: 'useCreativeStudioRenderPreview',
    secondaryOwners: ['scene-stack compile pipeline'],
    subscribers: ['CreativeStudioPipelineStatusBar'],
    writers: ['runPreviewPipeline'],
    readers: ['render-pipeline-progress'],
  },
  currentCompany: {
    owner: 'WorkspaceProvider',
    secondaryOwners: ['company-routes/registry'],
    subscribers: ['StudioOrbProvider', 'useOrbState'],
    writers: ['setActiveWorkspace', 'activateWorkspaceContext'],
    readers: ['useWorkspace'],
  },
  currentRoute: {
    owner: 'react-router (BrowserRouter)',
    secondaryOwners: [],
    subscribers: ['useLocation hooks', 'DepartmentGoldenBuildShell'],
    writers: ['navigate', 'history.pushState'],
    readers: ['useLocation'],
  },
};

const runtimeMutations = new Map<string, number>();

export function recordStateMutation(stateKey: string, writer: string): void {
  runtimeMutations.set(stateKey, (runtimeMutations.get(stateKey) ?? 0) + 1);
  runtimeMutations.set(`${stateKey}:${writer}`, (runtimeMutations.get(`${stateKey}:${writer}`) ?? 0) + 1);
}

export function buildOwnershipReport(): OwnershipConflict[] {
  const conflicts: OwnershipConflict[] = [];
  for (const [key, meta] of Object.entries(STATE_OWNERSHIP)) {
    const mutationCount = runtimeMutations.get(key) ?? 0;
    const competingWriters = meta.writers.length > 1 ? meta.writers : [];
    if (competingWriters.length > 1 || meta.secondaryOwners.length > 0) {
      conflicts.push({
        stateKey: key,
        owners: [meta.owner, ...meta.secondaryOwners],
        writers: meta.writers,
        readers: meta.readers,
        mutationCount,
      });
    }
  }
  return conflicts;
}

export function getRuntimeMutationCounts(): Record<string, number> {
  return Object.fromEntries(runtimeMutations);
}
