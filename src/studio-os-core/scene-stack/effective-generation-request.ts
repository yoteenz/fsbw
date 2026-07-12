import type { SceneStackLayerId } from './types';
import {
  assertLayerGenerationModeAllowed,
  resolveSceneStackLayerModelRoute,
  type SceneStackReferenceStrategy,
} from './layer-model-routing';
import { resolveLayerGenerationMode } from './isolated-layer-contract';
import { ISOLATED_ASSET_PROMPT_CONTRACT_VERSION } from './isolated-asset-prompt';

export const PROHIBITED_ISOLATED_PROMPT_PATTERNS = [
  /create the room/i,
  /recreate the environment/i,
  /preserve the architecture/i,
  /render the full scene/i,
  /complete interior/i,
  /redesign the room/i,
  /cinematic room/i,
  /final environment/i,
  /entire composition/i,
  /enhance this room/i,
  /maintain exact architecture/i,
  /realistic version of this environment/i,
  /preserve this scene/i,
  /full-scene render/i,
  /environment render/i,
  /room enhancement/i,
];

export const REQUIRED_ISOLATED_PROMPT_MARKERS = [
  'isolated',
  'transparent background',
  'no room',
  'no architecture',
  'separately composited',
  'do not reproduce reference environment',
] as const;

function hasObjectIdentityMarker(prompt: string): boolean {
  const lower = prompt.toLowerCase();
  return lower.includes('object only') || lower.includes('object group') || lower.includes('object-group');
}

export type EffectiveGenerationRequestRecord = {
  schemaVersion: 'effective-generation-request.v1';
  recordedAt: string;
  compileRunId: string | null;
  jobId: string | null;
  layerId: SceneStackLayerId;
  layerType: string;
  generationMode: string;
  promptBuilderId: string;
  promptContractVersion: string;
  promptHash: string;
  safePromptPreview: string;
  negativePromptHash: string;
  safeNegativePreview: string;
  provider: string;
  providerModel: string;
  providerEndpoint: string;
  outputFormat: string;
  requestedAlpha: boolean;
  aspectRatio: string;
  referenceCount: number;
  referenceRoles: string[];
  referenceStrategy: SceneStackReferenceStrategy;
  shellImageSupplied: boolean;
  fullCompositeSupplied: boolean;
  maskSupplied: boolean;
  depthSupplied: boolean;
  textToImageOnly: boolean;
  organizationId: string | null;
  stationId: string | null;
  projectId: string | null;
  regenerationAttempt: number;
  placementMetadataIncluded: boolean;
};

function hashText(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function safePreview(text: string, max = 480): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, max);
}

export function assertIsolatedPromptBeforeDispatch(input: {
  layerId: SceneStackLayerId;
  prompt: string;
  generationMode: string;
  referenceImageUrls: string[];
  textToImageOnly: boolean;
}): { ok: true } | { ok: false; code: string; violations: string[] } {
  const modeCheck = assertLayerGenerationModeAllowed(
    input.layerId,
    input.generationMode as ReturnType<typeof resolveLayerGenerationMode>
  );
  if (!modeCheck.ok) {
    return { ok: false, code: modeCheck.code, violations: [modeCheck.reason] };
  }

  const violations: string[] = [];
  const positivePrompt = input.prompt.split(/\bNEGATIVE:/i)[0] ?? input.prompt;

  for (const pattern of PROHIBITED_ISOLATED_PROMPT_PATTERNS) {
    if (pattern.test(positivePrompt)) {
      violations.push(`Prohibited scene language matched: ${pattern.source}`);
    }
  }

  for (const marker of REQUIRED_ISOLATED_PROMPT_MARKERS) {
    if (!positivePrompt.toLowerCase().includes(marker.toLowerCase())) {
      violations.push(`Missing required isolated marker: ${marker}`);
    }
  }

  if (!hasObjectIdentityMarker(positivePrompt)) {
    violations.push('Missing required isolated marker: object only / object group');
  }

  if (!input.textToImageOnly && input.referenceImageUrls.length > 0) {
    violations.push('Isolated layer must not use dominant img2img reference URLs.');
  }

  if (violations.length > 0) {
    return { ok: false, code: 'ISOLATED_PROMPT_CONTRACT_VIOLATION', violations };
  }

  return { ok: true };
}

export function buildEffectiveGenerationRequestRecord(input: {
  layerId: SceneStackLayerId;
  prompt: string;
  negativePrompt: string;
  outputFormat: string;
  aspectRatio: string;
  referenceImageUrls?: string[];
  compileRunId?: string | null;
  jobId?: string | null;
  organizationId?: string | null;
  stationId?: string | null;
  projectId?: string | null;
  isolationAttempt?: number;
  placementMetadataIncluded?: boolean;
}): EffectiveGenerationRequestRecord {
  const route = resolveSceneStackLayerModelRoute(input.layerId, input.isolationAttempt ?? 0);
  const refs = input.referenceImageUrls ?? [];

  return {
    schemaVersion: 'effective-generation-request.v1',
    recordedAt: new Date().toISOString(),
    compileRunId: input.compileRunId ?? null,
    jobId: input.jobId ?? null,
    layerId: input.layerId,
    layerType: input.layerId,
    generationMode: route.generationMode,
    promptBuilderId: route.promptBuilderId,
    promptContractVersion: ISOLATED_ASSET_PROMPT_CONTRACT_VERSION,
    promptHash: hashText(input.prompt),
    safePromptPreview: safePreview(input.prompt),
    negativePromptHash: hashText(input.negativePrompt),
    safeNegativePreview: safePreview(input.negativePrompt),
    provider: route.provider,
    providerModel: route.providerModel,
    providerEndpoint: route.providerEndpoint,
    outputFormat: input.outputFormat,
    requestedAlpha: route.requestedAlpha,
    aspectRatio: input.aspectRatio,
    referenceCount: route.textToImageOnly ? 0 : refs.length,
    referenceRoles: route.textToImageOnly
      ? ['placement-metadata-only']
      : refs.length
        ? ['img2img-anchor']
        : ['marble-genesis-anchor'],
    referenceStrategy: route.referenceStrategy,
    shellImageSupplied: refs.some((u) => u.includes('environment-shell') || u.includes('scene-stack')),
    fullCompositeSupplied: false,
    maskSupplied: false,
    depthSupplied: false,
    textToImageOnly: route.textToImageOnly,
    organizationId: input.organizationId ?? null,
    stationId: input.stationId ?? null,
    projectId: input.projectId ?? null,
    regenerationAttempt: input.isolationAttempt ?? 0,
    placementMetadataIncluded: input.placementMetadataIncluded ?? true,
  };
}

export function recordEffectiveGenerationRequest(
  record: EffectiveGenerationRequestRecord
): void {
  console.info(JSON.stringify({ audit: 'effective-generation-request', ...record }));
}
