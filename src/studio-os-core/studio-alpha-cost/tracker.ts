/**
 * Studio Alpha™ production tracker — call from generation hooks to record receipts.
 */

import { SCENE_STACK_LAYER_SHORT_LABELS } from '../scene-stack/layer-catalog';
import type { SceneStackLayerId } from '../scene-stack/types';
import {
  estimateGenerationCost,
  estimateGenerationDurationSec,
  resolveActualCost,
} from './cost-engine';
import {
  STUDIO_ALPHA_DEFAULT_MODEL,
  STUDIO_ALPHA_DEFAULT_PROVIDER,
  STUDIO_ALPHA_DEFAULT_QUALITY,
  STUDIO_ALPHA_DEFAULT_RESOLUTION,
} from './pricing-config';
import {
  createGenerationReceipt,
  updateGenerationReceipt,
} from './receipt-store';
import type { GenerationReceipt } from './types';

export type BeginGenerationInput = {
  departmentId: string;
  projectId: string;
  sceneId: string;
  assetId: string;
  assetType: string;
  model?: string;
  quality?: string;
  resolution?: string;
  provider?: string;
};

export type CompleteGenerationInput = {
  generationId: string;
  apiActualCost?: number | null;
  model?: string;
  resolution?: string;
  durationMs?: number;
  assetId?: string;
};

const activeTimers = new Map<string, number>();

export function layerIdToAssetType(layerId: SceneStackLayerId): string {
  return SCENE_STACK_LAYER_SHORT_LABELS[layerId] ?? layerId;
}

export function beginStudioAlphaGeneration(input: BeginGenerationInput): string {
  const model = input.model ?? STUDIO_ALPHA_DEFAULT_MODEL;
  const { estimatedCost } = estimateGenerationCost({
    model,
    quality: input.quality,
    resolution: input.resolution,
  });

  const receipt = createGenerationReceipt({
    assetId: input.assetId,
    sceneId: input.sceneId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    provider: input.provider ?? STUDIO_ALPHA_DEFAULT_PROVIDER,
    model,
    quality: input.quality ?? STUDIO_ALPHA_DEFAULT_QUALITY,
    resolution: input.resolution ?? STUDIO_ALPHA_DEFAULT_RESOLUTION,
    assetType: input.assetType,
    estimatedCost,
    status: 'generating',
  });

  activeTimers.set(receipt.generationId, Date.now());
  return receipt.generationId;
}

export function completeStudioAlphaGeneration(input: CompleteGenerationInput): GenerationReceipt | null {
  const started = activeTimers.get(input.generationId);
  const durationMs =
    input.durationMs ?? (started ? Date.now() - started : undefined);
  activeTimers.delete(input.generationId);

  const { actualCost, certainty } = resolveActualCost({
    apiActualCost: input.apiActualCost,
    model: input.model,
    resolution: input.resolution,
  });

  return updateGenerationReceipt(input.generationId, {
    status: 'complete',
    actualCost,
    actualCostCertainty: certainty,
    durationMs,
    approvedAt: new Date().toISOString(),
    assetId: input.assetId,
  });
}

export function failStudioAlphaGeneration(
  generationId: string,
  error?: string
): GenerationReceipt | null {
  activeTimers.delete(generationId);
  return updateGenerationReceipt(generationId, {
    status: 'failed',
    error,
  });
}

export function recordStudioAlphaReuse(input: {
  departmentId: string;
  projectId: string;
  sceneId: string;
  assetId: string;
  assetType: string;
  reusedFromAssetId: string;
  model?: string;
}): GenerationReceipt {
  const model = input.model ?? STUDIO_ALPHA_DEFAULT_MODEL;
  const { estimatedCost } = estimateGenerationCost({ model });

  return createGenerationReceipt({
    assetId: input.assetId,
    sceneId: input.sceneId,
    departmentId: input.departmentId,
    projectId: input.projectId,
    provider: STUDIO_ALPHA_DEFAULT_PROVIDER,
    model,
    quality: STUDIO_ALPHA_DEFAULT_QUALITY,
    resolution: STUDIO_ALPHA_DEFAULT_RESOLUTION,
    assetType: input.assetType,
    estimatedCost: 0,
    actualCost: 0,
    actualCostCertainty: 'actual',
    status: 'reused',
    approvedAt: new Date().toISOString(),
    reusedAssets: [input.reusedFromAssetId],
    savingsEstimate: estimatedCost,
  });
}

export function beginPipelineGeneration(input: {
  departmentId: string;
  projectId: string;
  stageId: string;
  stageName: string;
  heroAssetId: string;
  model?: string;
  aspectRatio?: string;
}): string {
  return beginStudioAlphaGeneration({
    departmentId: input.departmentId,
    projectId: input.projectId,
    sceneId: input.stageId,
    assetId: input.heroAssetId,
    assetType: input.stageName,
    model: input.model,
    resolution: input.aspectRatio ?? STUDIO_ALPHA_DEFAULT_RESOLUTION,
  });
}

export function estimateSecondsForModel(model?: string): number {
  return estimateGenerationDurationSec(model);
}
