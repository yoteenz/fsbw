import type { SceneStackLayerId } from './types';
import {
  assertLayerGenerationModeAllowed,
  resolveSceneStackLayerModelRoute,
  type SceneStackReferenceStrategy,
} from './layer-model-routing';
import { resolveLayerGenerationMode } from './isolated-layer-contract';
import { ISOLATED_ASSET_PROMPT_CONTRACT_VERSION } from './isolated-asset-prompt';
import { validateReferencePolicy } from '../creative-production/brand-asset-grounding';

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
  schemaVersion: 'effective-generation-request.v2';
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
  routeId: string | null;
  brandReferenceUrls: string[];
  brandReferenceChecksums: string[];
  materialMappings: Record<string, string>;
  resolutionRequested: string;
  resolutionNative: string;
  resolutionTruthState: string | null;
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
  brandReferenceUrls?: string[];
  textToImageOnly: boolean;
  organizationId?: string | null;
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

  const brandRefs = input.brandReferenceUrls ?? [];
  if (brandRefs.length > 0 && input.organizationId) {
    const refPolicy = validateReferencePolicy({
      targetOrganizationId: input.organizationId,
      references: brandRefs.map((url) => ({
        url,
        role: 'material-reference' as const,
        organizationId: input.organizationId!,
      })),
    });
    if (!refPolicy.ok) {
      violations.push(refPolicy.reason);
    }
  }

  for (const marker of ['do not invent or substitute another marble', 'FORBIDDEN MATERIAL SUBSTITUTIONS']) {
    if (brandRefs.length > 0 && !positivePrompt.toLowerCase().includes(marker.toLowerCase().slice(0, 20))) {
      if (marker.includes('FORBIDDEN') && !positivePrompt.includes('FORBIDDEN MATERIAL')) {
        violations.push(`Missing brand-grounded marker when brand refs supplied: ${marker}`);
      }
    }
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
  routeId?: string | null;
  brandReferenceUrls?: string[];
  brandReferenceChecksums?: string[];
  materialMappings?: Record<string, string>;
  resolutionTruth?: {
    requestedResolution: string;
    providerNativeResolution: string;
    supportsNative4K: boolean;
  };
}): EffectiveGenerationRequestRecord {
  const route = resolveSceneStackLayerModelRoute(input.layerId, input.isolationAttempt ?? 0, {
    organizationId: input.organizationId,
    brandGroundingRequired: (input.brandReferenceUrls?.length ?? 0) > 0,
  });
  const refs = input.referenceImageUrls ?? [];
  const brandRefs = input.brandReferenceUrls ?? [];

  return {
    schemaVersion: 'effective-generation-request.v2',
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
    referenceCount: route.textToImageOnly ? brandRefs.length : refs.length,
    referenceRoles: brandRefs.length
      ? ['material-reference']
      : route.textToImageOnly
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
    routeId: input.routeId ?? route.routeId ?? null,
    brandReferenceUrls: brandRefs,
    brandReferenceChecksums: input.brandReferenceChecksums ?? [],
    materialMappings: input.materialMappings ?? {},
    resolutionRequested: input.resolutionTruth?.requestedResolution ?? route.resolutionTruth.requestedResolution,
    resolutionNative: input.resolutionTruth?.providerNativeResolution ?? route.resolutionTruth.providerNativeResolution,
    resolutionTruthState: route.resolutionTruth.supportsNative4K ? 'native-4k-capable' : 'provider-nearest-supported',
  };
}

export function recordEffectiveGenerationRequest(
  record: EffectiveGenerationRequestRecord
): void {
  console.info(JSON.stringify({ audit: 'effective-generation-request', ...record }));
}
