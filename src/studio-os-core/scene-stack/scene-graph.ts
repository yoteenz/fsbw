import { listComposeLayers } from './layer-catalog';
import type { MasterSceneBlueprint } from './master-scene-blueprint';
import { isBlendCompositeLayer } from './reference-chain';
import { listSceneStackLayersForStation } from './store';
import type { SceneLayerQualityStatus, SceneStackLayerId } from './types';
import { resolveMountType } from './world-compiler/component-package';
import { resolveShellLockState } from './world-compiler/immutable-shell';
import { WORLD_COMPILER_VERSION } from './world-compiler/constants';

/** Scene Graph™ — technical node model (Scene Stack™ remains founder-facing term). */
export type SceneGraphBlendMode =
  | 'normal'
  | 'soft-light'
  | 'screen'
  | 'overlay'
  | 'color';

export type SceneGraphMountType = 'structural' | 'effect-calculated' | 'reference-only';

export type SceneGraphCompositionMode = 'world-compiler' | 'legacy-stack';

export type SceneGraphNode = {
  nodeId: string;
  layerId: SceneStackLayerId;
  blueprintId: string;
  assetRegistryId: string | null;
  sourceImageUrl: string | null;
  zIndex: number;
  blendMode: SceneGraphBlendMode;
  opacity: number;
  transform: string;
  dependencyRules: string[];
  qualityStatus: SceneLayerQualityStatus;
  qualityIssues: string[];
  version: number;
  immutable: boolean;
  mountType: SceneGraphMountType;
  /** World Compiler™ — temporary placement reference, not composite source */
  referenceOnly: boolean;
};

export type SceneGraph = {
  graphId: string;
  blueprintId: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  nodes: SceneGraphNode[];
  compositionMode: SceneGraphCompositionMode;
  shellLocked: boolean;
  compilerVersion: string;
  /** Runtime composition only — never sent to FAL */
  flatteningAllowed: false;
};

const BLEND_MODES: Partial<Record<SceneStackLayerId, SceneGraphBlendMode>> = {
  'lighting-systems': 'soft-light',
  'atmospheric-systems': 'screen',
  'surface-materials': 'overlay',
  'ambient-motion': 'screen',
  'founder-personalization': 'color',
};

const OPACITY: Partial<Record<SceneStackLayerId, number>> = {
  'lighting-systems': 0.85,
  'atmospheric-systems': 0.55,
  'surface-materials': 0.45,
  'ambient-motion': 0.35,
  'founder-personalization': 0.25,
};

export function resolveSceneGraphBlendMode(layerId: SceneStackLayerId): SceneGraphBlendMode {
  return BLEND_MODES[layerId] ?? 'normal';
}

export function resolveSceneGraphOpacity(layerId: SceneStackLayerId, mode: SceneGraphCompositionMode = 'world-compiler'): number {
  if (mode === 'world-compiler') {
    const mountType = resolveMountType(layerId);
    if (mountType === 'structural' || mountType === 'reference-only') return 1;
    return OPACITY[layerId] ?? 1;
  }
  return OPACITY[layerId] ?? 1;
}

export function resolveSceneGraphBlendModeForMount(
  layerId: SceneStackLayerId,
  mode: SceneGraphCompositionMode = 'world-compiler'
): SceneGraphBlendMode {
  if (mode === 'world-compiler') {
    const mountType = resolveMountType(layerId);
    if (mountType === 'structural' || mountType === 'reference-only') return 'normal';
    return BLEND_MODES[layerId] ?? 'normal';
  }
  return resolveSceneGraphBlendMode(layerId);
}

export function buildSceneGraph(input: {
  blueprint: MasterSceneBlueprint;
  departmentId: string;
  projectId: string;
  stationId: string;
  compositionMode?: SceneGraphCompositionMode;
}): SceneGraph {
  const compositionMode = input.compositionMode ?? 'world-compiler';
  const shellLock = resolveShellLockState(input.departmentId, input.projectId, input.stationId);
  const records = listSceneStackLayersForStation(
    input.departmentId,
    input.projectId,
    input.stationId
  );
  const recordByLayer = new Map(records.map((r) => [r.layerId, r]));

  const nodes: SceneGraphNode[] = listComposeLayers()
    .filter((def) => def.role === 'fal-generated')
    .map((def) => {
      const rec = recordByLayer.get(def.id);
      const depRule = input.blueprint.layerDependencyRules.find((r) => r.layerId === def.id);
      const assetRegistryId = rec?.publicUrl
        ? `scene-stack-${input.stationId}-${def.id}-v${rec.version}`
        : null;

      return {
        nodeId: `sgn-${input.stationId}-${def.id}`,
        layerId: def.id,
        blueprintId: input.blueprint.blueprintId,
        assetRegistryId,
        sourceImageUrl: rec?.publicUrl ?? null,
        zIndex: depRule?.zIndex ?? def.order,
        blendMode: resolveSceneGraphBlendModeForMount(def.id, compositionMode),
        opacity: resolveSceneGraphOpacity(def.id, compositionMode),
        transform: 'none',
        dependencyRules: [
          depRule?.requiresShell ? 'requires-shell' : 'shell-genesis',
          depRule?.outputMode ?? 'isolated-object',
          `forbidden-refs:${depRule?.forbiddenReferenceLayers.join(',') ?? 'all-prior-generative'}`,
        ],
        qualityStatus: rec?.qualityStatus ?? 'pending',
        qualityIssues: rec?.qualityIssues ?? [],
        version: rec?.version ?? 0,
        immutable: Boolean(rec?.status === 'approved' && rec.publicUrl),
        mountType: resolveMountType(def.id),
        referenceOnly: def.id === 'environment-shell' || compositionMode === 'world-compiler',
      };
    });

  return {
    graphId: `sg-${input.departmentId}-${input.stationId}-${input.projectId}`,
    blueprintId: input.blueprint.blueprintId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
    nodes,
    compositionMode,
    shellLocked: shellLock.locked,
    compilerVersion: WORLD_COMPILER_VERSION,
    flatteningAllowed: false,
  };
}

export function getSceneGraphNode(
  graph: SceneGraph,
  layerId: SceneStackLayerId
): SceneGraphNode | undefined {
  return graph.nodes.find((n) => n.layerId === layerId);
}

export function isBlendOverlayNode(layerId: SceneStackLayerId): boolean {
  return isBlendCompositeLayer(layerId);
}

export function listApprovedGraphNodes(graph: SceneGraph): SceneGraphNode[] {
  return graph.nodes.filter((n) => Boolean(n.sourceImageUrl));
}
