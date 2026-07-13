import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';
import type { AssetDnaRecord } from '../manufacturing-engine/asset-dna';
import type { RenderIntent } from '../manufacturing-engine/render-intent';
import type { ManufacturingJob } from '../manufacturing-engine/manufacturing-queue';
import type { HealthOverlayColor } from './contract';

export const ASSET_INSPECTOR_VERSION = 'asset-inspector.v1';

export type AssetInspectorPanel = {
  inspectorVersion: typeof ASSET_INSPECTOR_VERSION;
  assetId: string;
  assetVersion: string;
  status: 'ready' | 'queued' | 'building' | 'installed' | 'repairing';
  socketId: string;
  dnaRevision: string;
  renderIntentId: string | null;
  materialLibrary: string;
  manufacturer: string;
  expectedDimensions: { width: number; height: number; depth: number };
  health: HealthOverlayColor;
  inspectionRules: string[];
  dependencies: string[];
  actions: {
    replace: boolean;
    upgrade: boolean;
    inspectDna: boolean;
    openManufacturingInstructions: boolean;
  };
};

export function buildAssetInspector(input: {
  plan: ConstructionPlan;
  assetId: string;
  dna: AssetDnaRecord | null;
  intent: RenderIntent | null;
  job: ManufacturingJob | null;
}): AssetInspectorPanel | null {
  const allAssets = [
    ...input.plan.heroAssets,
    ...input.plan.furnitureSet.assets,
    ...input.plan.decorSet.assets,
  ];
  const assetRef = allAssets.find((a) => a.assetId === input.assetId);
  if (!assetRef && input.assetId !== input.plan.architecture.architectureId) return null;

  const isArch = input.assetId === input.plan.architecture.architectureId;

  return {
    inspectorVersion: ASSET_INSPECTOR_VERSION,
    assetId: input.assetId,
    assetVersion: isArch ? input.plan.architecture.version : assetRef!.version,
    status: 'ready',
    socketId: isArch ? 'architecture-root' : assetRef!.socketId,
    dnaRevision: input.dna?.assetRevision ?? (isArch ? input.plan.architecture.version : assetRef!.version),
    renderIntentId: input.intent?.intentId ?? null,
    materialLibrary: input.plan.materialSet.materialSetId,
    manufacturer: input.job?.jobType === 'hero-asset' ? 'Hero Asset Worker' : input.job?.jobType === 'architecture' ? 'Architect Worker' : 'Factory Worker',
    expectedDimensions: input.dna?.physical.boundingVolume ?? { width: 2, height: 1, depth: 2 },
    health: 'green',
    inspectionRules: input.dna?.inspectionRules ?? [],
    dependencies: input.job?.dependencies ?? [],
    actions: {
      replace: true,
      upgrade: true,
      inspectDna: Boolean(input.dna),
      openManufacturingInstructions: Boolean(input.intent),
    },
  };
}
