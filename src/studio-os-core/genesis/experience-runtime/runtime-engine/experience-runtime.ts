import { XER_SUBSYSTEM_VERSION } from '../constants';
import {
  buildRuntimeCacheKey,
  getCachedRuntimeGraph,
  getRuntimeCacheStats,
  recordCacheHit,
  recordCacheMiss,
  setCachedRuntimeGraph,
} from '../runtime-cache/runtime-cache';
import {
  detectActiveOverrides,
  createGraphId,
  patchGraphBrand,
  resolveDnaLayers,
} from './dna-resolver';
import { resolveThemeBundle, applyThemeToElement } from './theme-resolver';
import { assembleSceneGraph } from './scene-assembler';
import { assembleMotionProfile } from './motion-assembler';
import { assembleInteractionProfile } from './interaction-assembler';
import {
  ensureRuntimeSessionId,
  hydrateSessionState,
  preserveStateOnBrandSwitch,
} from '../runtime-state/session-state';
import { readExperienceRuntimeStore, mutateExperienceRuntimeStore } from '../persistence';
import { updateRuntimeSelectionStore } from '../bootstrap/seed';
import type { XerAssemblyRequest, XerRuntimeGraph, XerRuntimeSelection } from '../types';

export function assembleExperienceRuntime(request?: XerAssemblyRequest): XerRuntimeGraph {
  const started = performance.now();
  const runtimeStore = readExperienceRuntimeStore();
  const sessionId = request?.sessionId ?? ensureRuntimeSessionId();
  const layers = resolveDnaLayers(request);

  const cacheKey = buildRuntimeCacheKey({
    brandId: layers.brand.brandId,
    departmentId: layers.department.departmentId,
    sceneId: layers.scene.sceneId,
    motionDnaId: layers.motion.motionDnaId,
    platformVersion: layers.platformDna.version,
    stateVersion: layers.stateDna.version,
  });

  if (!request?.skipCache) {
    const cached = getCachedRuntimeGraph(cacheKey);
    if (cached) {
      recordCacheHit();
      mutateExperienceRuntimeStore((s) => ({
        ...s,
        cacheStats: getRuntimeCacheStats(),
      }));
      return cached;
    }
  }

  recordCacheMiss();
  const overrides = detectActiveOverrides(layers);
  const theme = resolveThemeBundle(layers, overrides);
  const renderNodes = assembleSceneGraph(layers, theme);
  assembleMotionProfile(layers);
  assembleInteractionProfile(layers);

  const assemblyMs = Math.round(performance.now() - started);
  const graph: XerRuntimeGraph = {
    graphId: createGraphId(sessionId, layers.brand.brandId),
    sessionId,
    brandId: layers.brand.brandId,
    departmentId: layers.department.departmentId,
    sceneId: layers.scene.sceneId,
    platformDna: layers.platformDna,
    brand: layers.brand,
    department: layers.department,
    scene: layers.scene,
    components: layers.components,
    motion: layers.motion,
    interaction: layers.interaction,
    stateDna: layers.stateDna,
    renderNodes,
    cssVariables: theme.cssVariables,
    cssText: theme.cssText,
    resolvedTokens: theme.resolvedTokens,
    activeOverrides: overrides,
    performance: {
      assemblyMs,
      cacheHit: false,
      graphNodeCount: renderNodes.length,
      tokenCount: Object.keys(theme.resolvedTokens).length,
      overrideCount: overrides.length,
      brandSwitchCount: runtimeStore.brandSwitchCount,
      lastAssembledAt: new Date().toISOString(),
    },
    dnaVersions: {
      platform: layers.platformDna.version,
      brand: layers.brand.brandId,
      department: layers.department.departmentDnaId,
      scene: layers.scene.sceneId,
      state: layers.stateDna.version,
      runtime: XER_SUBSYSTEM_VERSION,
    },
  };

  setCachedRuntimeGraph(cacheKey, graph);
  mutateExperienceRuntimeStore((s) => ({
    ...s,
    cacheStats: getRuntimeCacheStats(),
  }));

  return graph;
}

/** Live Brand DNA switch — graph patch without route rebuild or state loss */
export function switchRuntimeBrandLive(brandId: string): XerRuntimeGraph {
  const started = performance.now();
  const store = readExperienceRuntimeStore();
  const previousState = { ...store.sessionState };
  const sceneId = store.selection.sceneId;

  const preserved = preserveStateOnBrandSwitch(sceneId, previousState);
  mutateExperienceRuntimeStore((s) => ({
    ...s,
    selection: {
      ...s.selection,
      brandId,
      motionDnaId: `motion-${brandId}`,
    },
    sessionState: preserved,
    brandSwitchCount: s.brandSwitchCount + 1,
  }));

  const currentGraph = assembleExperienceRuntime({
    brandId,
    departmentId: store.selection.departmentId,
    sceneId,
    motionDnaId: `motion-${brandId}`,
    skipCache: true,
  });

  const layers = resolveDnaLayers({ brandId });
  const assemblyMs = Math.round(performance.now() - started);
  const patched = patchGraphBrand(currentGraph, layers, assemblyMs);

  const cacheKey = buildRuntimeCacheKey({
    brandId,
    departmentId: store.selection.departmentId,
    sceneId,
    motionDnaId: `motion-${brandId}`,
    platformVersion: layers.platformDna.version,
    stateVersion: layers.stateDna.version,
  });
  setCachedRuntimeGraph(cacheKey, patched);

  return patched;
}

export function applyRuntimeGraphToElement(
  element: HTMLElement,
  graph?: XerRuntimeGraph
): XerRuntimeGraph {
  const runtimeGraph = graph ?? assembleExperienceRuntime();
  const theme = {
    cssVariables: runtimeGraph.cssVariables,
    cssText: runtimeGraph.cssText,
    resolvedTokens: runtimeGraph.resolvedTokens,
    activeOverrides: runtimeGraph.activeOverrides,
    brandLabel: runtimeGraph.brand.officialName,
    departmentWash: runtimeGraph.cssVariables['--xer-dept-wash'] ?? '',
    orbGlow: runtimeGraph.brand.orbOverrides.glowColor,
    typography: {
      display: runtimeGraph.brand.typography.displayFont,
      label: runtimeGraph.brand.typography.labelFont,
      body: runtimeGraph.brand.typography.bodyFont,
    },
  };
  applyThemeToElement(element, theme, {
    brandId: runtimeGraph.brandId,
    departmentId: runtimeGraph.departmentId,
    sceneId: runtimeGraph.sceneId,
  });
  return runtimeGraph;
}

export function updateRuntimeSelection(partial: Partial<XerRuntimeSelection>): void {
  updateRuntimeSelectionStore(partial);
}

export function getRuntimeSessionState(): Record<string, string> {
  const store = readExperienceRuntimeStore();
  return hydrateSessionState(store.selection.sceneId);
}
