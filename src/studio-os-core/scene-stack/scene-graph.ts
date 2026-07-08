import { listComposeLayers } from './layer-catalog';
import type { MasterSceneBlueprint } from './master-scene-blueprint';
import { isBlendCompositeLayer } from './reference-chain';
import { listSceneStackLayersForStation } from './store';
import type { SceneLayerQualityStatus, SceneStackLayerId } from './types';

/** Scene Graph™ — technical node model (Scene Stack™ remains founder-facing term). */
export type SceneGraphBlendMode =
  | 'normal'
  | 'soft-light'
  | 'screen'
  | 'overlay'
  | 'color';

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
};

export type SceneGraph = {
  graphId: string;
  blueprintId: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  nodes: SceneGraphNode[];
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

export function resolveSceneGraphOpacity(layerId: SceneStackLayerId): number {
  return OPACITY[layerId] ?? 1;
}

export function buildSceneGraph(input: {
  blueprint: MasterSceneBlueprint;
  departmentId: string;
  projectId: string;
  stationId: string;
}): SceneGraph {
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
        blendMode: resolveSceneGraphBlendMode(def.id),
        opacity: resolveSceneGraphOpacity(def.id),
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
      };
    });

  return {
    graphId: `sg-${input.departmentId}-${input.stationId}-${input.projectId}`,
    blueprintId: input.blueprint.blueprintId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    stationId: input.stationId,
    nodes,
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
