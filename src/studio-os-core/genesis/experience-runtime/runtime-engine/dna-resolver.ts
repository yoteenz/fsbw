import { resolveExperienceProfile } from '../../experience-engine/engines/experience-generator';
import { readExperienceEngineDnaStore } from '../../experience-engine/persistence';
import { readExperienceRuntimeStore } from '../persistence';
import {
  getDefaultRuntimeSeed,
  safePlatformVersion,
  safeStateDnaVersion,
} from '../runtime-boot/default-seed';
import {
  resolveRuntimeSelection,
  toAssemblyRequest,
} from '../runtime-boot/runtime-fallback-resolver';
import type {
  XerAssemblyRequest,
  XerPlatformDna,
  XerRuntimeGraph,
  XerRuntimeOverride,
  XerStateDna,
} from '../types';
import type {
  XeeBrandDna,
  XeeComponentDna,
  XeeDepartmentDna,
  XeeInteractionDna,
  XeeMotionDna,
  XeeSceneDna,
} from '../../experience-engine/types';

export type XerResolvedDnaLayers = {
  platformDna: XerPlatformDna;
  brand: XeeBrandDna;
  department: XeeDepartmentDna;
  scene: XeeSceneDna;
  components: XeeComponentDna[];
  motion: XeeMotionDna;
  interaction: XeeInteractionDna;
  stateDna: XerStateDna;
  profile: ReturnType<typeof resolveExperienceProfile>;
};

function resolveStateDna(sceneId: string, profiles: XerStateDna[]): XerStateDna {
  const seed = getDefaultRuntimeSeed();
  return (
    profiles.find((p) => p?.sceneId === sceneId) ??
    seed.stateDnaProfiles.find((p) => p?.sceneId === sceneId) ??
    seed.defaultStateDna
  );
}

export function resolveDnaLayers(request?: XerAssemblyRequest): XerResolvedDnaLayers {
  const runtimeStore = readExperienceRuntimeStore();
  const resolved = resolveRuntimeSelection(request);
  const assemblyRequest = toAssemblyRequest(resolved);

  const profile = resolveExperienceProfile({
    brandId: assemblyRequest.brandId,
    departmentId: assemblyRequest.departmentId,
    sceneId: assemblyRequest.sceneId,
    motionDnaId: assemblyRequest.motionDnaId,
  });

  const seed = getDefaultRuntimeSeed();
  const platformDna: XerPlatformDna =
    runtimeStore.platformDna?.platformDnaId ? runtimeStore.platformDna : seed.platformDna;
  const stateDna = resolveStateDna(resolved.sceneId, runtimeStore.stateDnaProfiles ?? []);

  return {
    platformDna,
    brand: profile.brand,
    department: profile.department,
    scene: profile.scene,
    components: profile.components,
    motion: profile.motion,
    interaction: profile.interaction,
    stateDna,
    profile,
  };
}

export function detectActiveOverrides(layers: XerResolvedDnaLayers): XerRuntimeOverride[] {
  const overrides: XerRuntimeOverride[] = [];
  const engineStore = readExperienceEngineDnaStore();
  const baseBrand = engineStore.brands.find((b) => b.brandId === 'studio-os');
  if (!baseBrand || layers.brand.brandId === 'studio-os') return overrides;

  if (layers.brand.colorSystem.primary !== baseBrand.colorSystem.primary) {
    overrides.push({
      overrideId: `ov-brand-primary-${layers.brand.brandId}`,
      layer: 'brand',
      fieldPath: 'colorSystem.primary',
      value: layers.brand.colorSystem.primary,
      reason: 'Brand DNA identity expression',
    });
  }
  if (layers.department.departmentColor !== layers.brand.colorSystem.primary) {
    overrides.push({
      overrideId: `ov-dept-color-${layers.department.departmentId}`,
      layer: 'department',
      fieldPath: 'departmentColor',
      value: layers.department.departmentColor,
      reason: 'Department wing specialization',
    });
  }
  if (layers.motion.presetName !== engineStore.motions.find((m) => m.brandId === 'studio-os')?.presetName) {
    overrides.push({
      overrideId: `ov-motion-${layers.motion.motionDnaId}`,
      layer: 'motion',
      fieldPath: 'presetName',
      value: layers.motion.presetName,
      reason: 'Brand motion personality',
    });
  }
  return overrides;
}

export function buildResolvedTokenMap(layers: XerResolvedDnaLayers): Record<string, string> {
  const { profile, platformDna } = layers;
  return {
    ...profile.cssVariables,
    '--xer-platform-id': platformDna.platformDnaId,
    '--xer-brand-id': profile.brandId,
    '--xer-dept-id': profile.departmentId,
    '--xer-scene-id': profile.sceneId,
    '--xer-motion-timing': profile.cssVariables['--xee-motion-timing'] ?? '320ms',
    '--xer-interaction-approval': layers.interaction.approval,
  };
}

export function buildRuntimeCssText(tokens: Record<string, string>): string {
  const lines = Object.entries(tokens).map(([k, v]) => `  ${k}: ${v};`);
  return `:root,\n[data-xer-runtime] {\n${lines.join('\n')}\n}`;
}

export function createGraphId(sessionId: string, brandId: string): string {
  return `graph-${sessionId}-${brandId}-${Date.now().toString(36)}`;
}

export function patchGraphBrand(
  graph: XerRuntimeGraph,
  layers: XerResolvedDnaLayers,
  assemblyMs: number
): XerRuntimeGraph {
  const resolvedTokens = buildResolvedTokenMap(layers);
  return {
    ...graph,
    graphId: createGraphId(graph.sessionId, layers.brand.brandId),
    brandId: layers.brand.brandId,
    departmentId: layers.department.departmentId,
    brand: layers.brand,
    department: layers.department,
    components: layers.components,
    motion: layers.motion,
    interaction: layers.interaction,
    cssVariables: resolvedTokens,
    cssText: buildRuntimeCssText(resolvedTokens),
    resolvedTokens,
    activeOverrides: detectActiveOverrides(layers),
    performance: {
      ...graph.performance,
      assemblyMs,
      cacheHit: false,
      tokenCount: Object.keys(resolvedTokens).length,
      overrideCount: detectActiveOverrides(layers).length,
      brandSwitchCount: graph.performance.brandSwitchCount + 1,
      lastAssembledAt: new Date().toISOString(),
    },
    dnaVersions: {
      ...graph.dnaVersions,
      brand: layers.brand.brandId,
      department: layers.department.departmentDnaId,
    },
  };
}

export { safePlatformVersion, safeStateDnaVersion };
