import type { SceneGraph } from './scene-graph';
import { listApprovedGraphNodes } from './scene-graph';
import type { MasterSceneBlueprint } from './master-scene-blueprint';
import type { SceneStackLayerId } from './types';

export type SceneExportLayerSource = {
  layerId: SceneStackLayerId;
  assetRegistryId: string | null;
  sourceImageUrl: string;
  zIndex: number;
  blendMode: string;
  opacity: number;
  version: number;
};

/** Canonical export bundle — layered sources remain authoritative. */
export type SceneStackExportBundle = {
  exportId: string;
  exportedAt: string;
  blueprintId: string;
  departmentId: string;
  projectId: string;
  stationId: string;
  /** Layered scene graph — canonical */
  sceneGraph: SceneGraph;
  /** Individual source layers — never flattened */
  sourceLayers: SceneExportLayerSource[];
  /** Flattened preview is delivery artifact only */
  flattenedPreviewUrl: string | null;
  generationReceiptIds: string[];
  canonicalRule: 'layered-source-is-canonical';
};

export type FlattenSceneGraphOptions = {
  width?: number;
  height?: number;
  backgroundColor?: string;
};

/**
 * Final Export Rule™ — flattening allowed ONLY here, never during assembly or runtime.
 * Produces a canvas-based preview from independent layer nodes.
 */
export async function flattenSceneGraphToCanvas(
  graph: SceneGraph,
  options: FlattenSceneGraphOptions = {}
): Promise<HTMLCanvasElement | null> {
  const nodes = listApprovedGraphNodes(graph).sort((a, b) => a.zIndex - b.zIndex);
  if (nodes.length === 0) return null;

  const firstUrl = nodes[0]!.sourceImageUrl!;
  const probe = await loadImage(firstUrl);
  const width = options.width ?? probe.naturalWidth;
  const height = options.height ?? probe.naturalHeight;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.fillStyle = options.backgroundColor ?? '#080706';
  ctx.fillRect(0, 0, width, height);

  for (const node of nodes) {
    if (!node.sourceImageUrl) continue;
    const img = await loadImage(node.sourceImageUrl);
    ctx.save();
    ctx.globalAlpha = node.opacity;
    ctx.globalCompositeOperation = mapBlendMode(node.blendMode);
    ctx.drawImage(img, 0, 0, width, height);
    ctx.restore();
  }

  return canvas;
}

function mapBlendMode(mode: string): GlobalCompositeOperation {
  switch (mode) {
    case 'soft-light':
      return 'soft-light';
    case 'screen':
      return 'screen';
    case 'overlay':
      return 'overlay';
    case 'color':
      return 'color';
    default:
      return 'source-over';
  }
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Export flatten: image load failed'));
    img.src = url;
  });
}

export async function buildSceneStackExportBundle(input: {
  blueprint: MasterSceneBlueprint;
  graph: SceneGraph;
  generationReceiptIds?: string[];
  includeFlattenedPreview?: boolean;
}): Promise<SceneStackExportBundle> {
  const sourceLayers: SceneExportLayerSource[] = listApprovedGraphNodes(input.graph)
    .sort((a, b) => a.zIndex - b.zIndex)
    .map((node) => ({
      layerId: node.layerId,
      assetRegistryId: node.assetRegistryId,
      sourceImageUrl: node.sourceImageUrl!,
      zIndex: node.zIndex,
      blendMode: node.blendMode,
      opacity: node.opacity,
      version: node.version,
    }));

  let flattenedPreviewUrl: string | null = null;
  if (input.includeFlattenedPreview) {
    const canvas = await flattenSceneGraphToCanvas(input.graph);
    if (canvas) {
      flattenedPreviewUrl = canvas.toDataURL('image/webp', 0.92);
    }
  }

  return {
    exportId: `sse-${input.graph.stationId}-${Date.now()}`,
    exportedAt: new Date().toISOString(),
    blueprintId: input.blueprint.blueprintId,
    departmentId: input.graph.departmentId,
    projectId: input.graph.projectId,
    stationId: input.graph.stationId,
    sceneGraph: input.graph,
    sourceLayers,
    flattenedPreviewUrl,
    generationReceiptIds: input.generationReceiptIds ?? [],
    canonicalRule: 'layered-source-is-canonical',
  };
}
