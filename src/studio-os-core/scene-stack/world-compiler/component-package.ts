/**
 * Component Package™ — generation layers return structured scene data,
 * not final rendered scenes. Images are temporary placement references only.
 */

import type { SceneStackLayerId, SceneStackLayerRecord } from '../types';
import { isBlendCompositeLayer } from '../reference-chain';

export type ComponentPlacement = {
  componentId: string;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  depth: number;
};

export type ComponentAnchorPoint = {
  id: string;
  label: string;
  x: number;
  y: number;
};

export type SceneComponentPackage = {
  layerId: SceneStackLayerId;
  packageVersion: string;
  /** Structured IDs — not raster pixels */
  componentIds: string[];
  placements: ComponentPlacement[];
  occlusionMaskRef: string | null;
  shadowGroup: string;
  reflectionGroup: string;
  materialGroup: string;
  animationHooks: string[];
  anchorPoints: ComponentAnchorPoint[];
  /** Temporary visualization reference — never composited as full scene */
  temporaryImageRef: string | null;
  mountType: 'structural' | 'effect-calculated' | 'reference-only';
  isolatedPass: boolean;
};

const STRUCTURAL_LAYERS: ReadonlySet<SceneStackLayerId> = new Set([
  'environment-shell',
  'signature-landmark',
  'furniture-objects',
]);

export function resolveMountType(layerId: SceneStackLayerId): SceneComponentPackage['mountType'] {
  if (layerId === 'environment-shell') return 'reference-only';
  if (STRUCTURAL_LAYERS.has(layerId)) return 'structural';
  if (isBlendCompositeLayer(layerId)) return 'effect-calculated';
  return 'structural';
}

/** Derive Component Package™ from approved layer record + blueprint station context */
export function buildComponentPackageFromRecord(
  record: SceneStackLayerRecord,
  stationId: string
): SceneComponentPackage {
  const layerId = record.layerId;
  const mountType = resolveMountType(layerId);
  const componentCount =
    layerId === 'furniture-objects' ? 3 + (record.version % 4) : layerId === 'signature-landmark' ? 1 : 0;

  const componentIds = Array.from({ length: componentCount }, (_, i) => {
    return `${stationId}-${layerId}-comp-${i + 1}`;
  });

  if (componentIds.length === 0 && layerId !== 'environment-shell') {
    componentIds.push(`${stationId}-${layerId}-primary`);
  }

  const placements: ComponentPlacement[] = componentIds.map((id, i) => ({
    componentId: id,
    x: 0.12 + (i * 0.18) % 0.76,
    y: 0.55 + (i % 3) * 0.08,
    rotation: 0,
    scale: 1,
    depth: 0.3 + i * 0.15,
  }));

  return {
    layerId,
    packageVersion: 'component-package.v1',
    componentIds,
    placements,
    occlusionMaskRef: mountType === 'structural' ? `${stationId}-${layerId}-occlusion` : null,
    shadowGroup: `${stationId}-${layerId}-shadows`,
    reflectionGroup: `${stationId}-${layerId}-reflections`,
    materialGroup: `${stationId}-${layerId}-materials`,
    animationHooks: layerId === 'ambient-motion' ? [`${stationId}-motion-hook`] : [],
    anchorPoints: [
      { id: `${stationId}-anchor-floor`, label: 'Floor Anchor', x: 0.5, y: 0.85 },
      { id: `${stationId}-anchor-focus`, label: 'Focus Anchor', x: 0.5, y: 0.45 },
    ],
    temporaryImageRef: record.publicUrl ?? null,
    mountType,
    isolatedPass: mountType === 'effect-calculated' || mountType === 'structural',
  };
}

export function buildComponentPackagesForStation(
  records: SceneStackLayerRecord[],
  stationId: string,
  _options?: { validationMode?: boolean }
): SceneComponentPackage[] {
  return records
    .filter((r) => {
      if (!r.publicUrl) return false;
      return r.status === 'approved' && Boolean(r.approvalProof?.assetCandidateId);
    })
    .map((r) => buildComponentPackageFromRecord(r, stationId));
}
