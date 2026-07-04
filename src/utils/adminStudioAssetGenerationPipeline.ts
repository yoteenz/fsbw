/**
 * Studio asset generation pipeline — Asset Director → Asset Factory → Fal API → delivery.
 */

import type { BlueprintDefinition } from './adminStudioBlueprintManagerDemo';
import { WEATHER_STUDIO_BLUEPRINT } from './adminStudioBlueprintManagerDemo';
import { exportBlueprintManagerSnapshot } from '../hooks/useAdminStudioBlueprintManagerState';

export const STUDIO_TO_BLUEPRINT_ID: Record<string, string> = {
  'ad-studio-weather': 'bp-weather-studio',
};

export type StudioVariantTarget = {
  studioId: string;
  variantId: string;
  variantName: string;
  previewSrc?: string;
};

export function resolveBlueprintForStudio(studioId: string): BlueprintDefinition | undefined {
  const blueprintId = STUDIO_TO_BLUEPRINT_ID[studioId];
  if (!blueprintId) return undefined;
  const snap = exportBlueprintManagerSnapshot();
  return snap.blueprints.find((b) => b.id === blueprintId) ?? WEATHER_STUDIO_BLUEPRINT;
}

export function blueprintPromptStack(bp: BlueprintDefinition): string[] {
  return bp.promptStack.map((layer) => layer.content);
}

export function versionStorageKey(studioId: string, variantId: string): string {
  return `${studioId}:${variantId}`;
}

export type GenerateStudioAssetRequest = {
  blueprintId: string;
  blueprintName: string;
  studioId: string;
  variantId: string;
  variantName: string;
  promptStack: string[];
  referenceImageUrl?: string;
};

export function buildGenerateRequest(
  target: StudioVariantTarget,
  bp: BlueprintDefinition
): GenerateStudioAssetRequest {
  return {
    blueprintId: bp.id,
    blueprintName: bp.identity.name,
    studioId: target.studioId,
    variantId: target.variantId,
    variantName: target.variantName,
    promptStack: blueprintPromptStack(bp),
    referenceImageUrl: target.previewSrc,
  };
}
