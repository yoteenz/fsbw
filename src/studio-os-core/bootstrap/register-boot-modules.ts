import { bootRegistry, createBootModule } from '../kernel/boot-registry';

let storageReady = false;

export function registerStorageBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'storage',
      name: 'Storage',
      dependencies: [],
      required: true,
      initialize: async () => {
        const { bootstrapStudioOsBrowserStorage } = await import('../../utils/studioOsBrowserStorage');
        bootstrapStudioOsBrowserStorage();
        storageReady = true;
      },
      isReady: () => storageReady,
    })
  );
}

export function registerAuthSessionBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'auth-session',
      name: 'Auth session restore',
      dependencies: ['storage'],
      required: false,
      initialize: async () => {
        const { restoreSupabaseSessionFromCookie, getSupabase } = await import('../../utils/supabase');
        const { ensureAuthRestoredFromBackup, isSignedIn } = await import('../../utils/adminAuth');
        restoreSupabaseSessionFromCookie();
        getSupabase();
        if (!isSignedIn()) {
          ensureAuthRestoredFromBackup();
        }
      },
    })
  );
}

export function registerAdminContextBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'admin-context',
      name: 'User / admin context',
      dependencies: ['auth-session'],
      required: false,
      initialize: async () => {
        const { isSignedIn, canAccessAdminPages } = await import('../../utils/adminAuth');
        if (!isSignedIn() || !canAccessAdminPages()) {
          const mod = bootRegistry.get('admin-context');
          mod!.warnings.push('Admin session not active — studio modules may be limited');
        }
      },
    })
  );
}

export function registerPlatformDnaBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'platform-dna',
      name: 'Platform DNA',
      dependencies: ['storage'],
      required: true,
      initialize: async () => {
        const { getDefaultRuntimeSeed } = await import(
          '../genesis/experience-runtime/runtime-boot/default-seed'
        );
        getDefaultRuntimeSeed();
      },
    })
  );
}

export function registerBrandRegistryBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'brand-registry',
      name: 'Brand Registry',
      dependencies: ['platform-dna'],
      required: true,
      initialize: async () => {
        const { ensureExperienceEngineDnaSubsystem } = await import('../genesis/experience-engine/engine');
        const { withExperienceEngineSeedFallback } = await import('../genesis/experience-engine/persistence');
        ensureExperienceEngineDnaSubsystem();
        const store = withExperienceEngineSeedFallback();
        const mod = bootRegistry.get('brand-registry');
        if (!store.brands?.length) {
          if (mod) mod.fallback = 'Brand registry empty — using studio-os default contract';
          return;
        }
      },
    })
  );
}

export function registerDepartmentRegistryBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'department-registry',
      name: 'Department Registry',
      dependencies: ['brand-registry'],
      required: true,
      initialize: async () => {
        const { withExperienceEngineSeedFallback } = await import('../genesis/experience-engine/persistence');
        const store = withExperienceEngineSeedFallback();
        const mod = bootRegistry.get('department-registry');
        if (!store.departments?.length) {
          if (mod) mod.fallback = 'Department registry empty — using executive default';
          return;
        }
      },
    })
  );
}

export function registerSceneRegistryBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'scene-registry',
      name: 'Scene Registry',
      dependencies: ['department-registry'],
      required: true,
      initialize: async () => {
        const { withExperienceEngineSeedFallback } = await import('../genesis/experience-engine/persistence');
        const store = withExperienceEngineSeedFallback();
        const mod = bootRegistry.get('scene-registry');
        if (!store.scenes?.length) {
          if (mod) mod.fallback = 'Scene registry empty — using executive-headquarters default';
          return;
        }
      },
    })
  );
}

export function registerStateDnaBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'state-dna',
      name: 'State DNA',
      dependencies: ['scene-registry'],
      required: true,
      initialize: async () => {
        const { getDefaultRuntimeSeed, safeStateDnaVersion } = await import(
          '../genesis/experience-runtime/runtime-boot/default-seed'
        );
        const seed = getDefaultRuntimeSeed();
        const version = safeStateDnaVersion(seed.defaultStateDna);
        const mod = bootRegistry.get('state-dna');
        if (!version) {
          if (mod) mod.fallback = 'State DNA version missing — using v1 default';
          return;
        }
      },
    })
  );
}

export function registerDesignDnaResolverBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'design-dna-resolver',
      name: 'Design DNA Resolver',
      dependencies: ['state-dna'],
      required: true,
      initialize: async () => {
        await import('../genesis/experience-runtime/runtime-engine/dna-resolver');
      },
    })
  );
}

export function registerExperienceRuntimeBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'experience-runtime',
      name: 'Experience Runtime',
      dependencies: ['design-dna-resolver'],
      required: true,
      initialize: async () => {
        const { ensureExperienceRuntimeSubsystem } = await import('../genesis/experience-runtime/engine');
        const { validateRuntimeBoot } = await import(
          '../genesis/experience-runtime/runtime-boot/runtime-boot-validator'
        );
        ensureExperienceRuntimeSubsystem();
        const report = validateRuntimeBoot();
        const mod = bootRegistry.get('experience-runtime');
        if (!report.ready && mod) {
          mod.fallback = `Runtime boot used fallbacks: ${report.fallbacksUsed.join(', ') || 'defaults'}`;
          mod.warnings.push(...report.warnings);
        }
      },
    })
  );
}

export function registerWorkspaceRuntimeBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'workspace-runtime',
      name: 'Workspace Runtime',
      dependencies: ['experience-runtime'],
      required: false,
      initialize: async () => {
        const { ensureWorkspacesBootstrapped } = await import('../../utils/ensureWorkspacesBootstrapped');
        await ensureWorkspacesBootstrapped();
      },
    })
  );
}

export function registerUiRenderBootModule(): void {
  bootRegistry.register(() =>
    createBootModule({
      id: 'ui-render',
      name: 'UI Render',
      dependencies: ['workspace-runtime'],
      required: false,
      initialize: async () => {
        /* Marker — UI may render after workspace runtime attempt. */
      },
    })
  );
}

export function registerAllStudioBootModules(): void {
  registerStorageBootModule();
  registerAuthSessionBootModule();
  registerAdminContextBootModule();
  registerPlatformDnaBootModule();
  registerBrandRegistryBootModule();
  registerDepartmentRegistryBootModule();
  registerSceneRegistryBootModule();
  registerStateDnaBootModule();
  registerDesignDnaResolverBootModule();
  registerExperienceRuntimeBootModule();
  registerWorkspaceRuntimeBootModule();
  registerUiRenderBootModule();
}
