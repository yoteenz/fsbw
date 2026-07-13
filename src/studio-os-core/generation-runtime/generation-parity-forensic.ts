/**
 * Shared forensic envelope for Frontal Slayer vs Studio OS generation parity probes.
 * Diagnostic mode only — never logs secrets or raw tokens.
 */
import { isWorldCompilerDiagnosticMode } from '../../studio-os/diagnostics/world-compiler-investigation/diagnostic-mode';

export type GenerationParitySurface = 'frontal-slayer' | 'experience-lab' | 'creative-direction-studio';

export type GenerationParityForensicEnvelope = {
  requestId: string;
  surface: GenerationParitySurface;
  organizationId: string | null;
  projectId: string | null;
  compileRunId: string | null;
  jobId: string | null;
  artifactIntent: string | null;
  modelRoute: string | null;
  provider: string;
  endpoint: string;
  promptHash: string | null;
  promptVersion: string | null;
  referenceCount: number;
  referenceRoles: string[];
  generationMode: string | null;
  requestedDimensions: string | null;
  timeoutMs: number | null;
  authorizationState: string | null;
  dispatchTimestamp: string | null;
  providerRequestId: string | null;
  providerLatencyMs: number | null;
  providerOutputUrls: string[];
  validationPath: string | null;
  validationResult: string | null;
  postprocessing: string | null;
  sceneStackState: string | null;
  finalStatus: string | null;
  firstDivergence: string | null;
  recordedAt: string;
};

const MAX_CAPTURES = 24;
const captures: GenerationParityForensicEnvelope[] = [];

function nextRequestId(surface: GenerationParitySurface): string {
  return `gpf-${surface}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function recordGenerationParityForensic(
  partial: Partial<GenerationParityForensicEnvelope> & { surface: GenerationParitySurface; endpoint: string }
): GenerationParityForensicEnvelope | null {
  if (!isWorldCompilerDiagnosticMode()) return null;

  const envelope: GenerationParityForensicEnvelope = {
    requestId: partial.requestId ?? nextRequestId(partial.surface),
    surface: partial.surface,
    organizationId: partial.organizationId ?? null,
    projectId: partial.projectId ?? null,
    compileRunId: partial.compileRunId ?? null,
    jobId: partial.jobId ?? null,
    artifactIntent: partial.artifactIntent ?? null,
    modelRoute: partial.modelRoute ?? null,
    provider: partial.provider ?? 'fal',
    endpoint: partial.endpoint,
    promptHash: partial.promptHash ?? null,
    promptVersion: partial.promptVersion ?? null,
    referenceCount: partial.referenceCount ?? 0,
    referenceRoles: partial.referenceRoles ?? [],
    generationMode: partial.generationMode ?? null,
    requestedDimensions: partial.requestedDimensions ?? null,
    timeoutMs: partial.timeoutMs ?? null,
    authorizationState: partial.authorizationState ?? null,
    dispatchTimestamp: partial.dispatchTimestamp ?? new Date().toISOString(),
    providerRequestId: partial.providerRequestId ?? null,
    providerLatencyMs: partial.providerLatencyMs ?? null,
    providerOutputUrls: partial.providerOutputUrls ?? [],
    validationPath: partial.validationPath ?? null,
    validationResult: partial.validationResult ?? null,
    postprocessing: partial.postprocessing ?? null,
    sceneStackState: partial.sceneStackState ?? null,
    finalStatus: partial.finalStatus ?? null,
    firstDivergence:
      partial.firstDivergence ??
      'Studio OS applies isolated-layer verified-asset pipeline; Frontal Slayer accepts provider output without it.',
    recordedAt: new Date().toISOString(),
  };

  captures.unshift(envelope);
  if (captures.length > MAX_CAPTURES) captures.length = MAX_CAPTURES;
  return envelope;
}

export function listGenerationParityForensics(): GenerationParityForensicEnvelope[] {
  return [...captures];
}

export function exportGenerationParityForensicsJson(): string {
  return JSON.stringify(
    {
      version: 'generation-parity-forensic.v1',
      firstCausalDivergence:
        'Studio OS runVerifiedAssetProductionPipeline + isolated-layer contract on signature-landmark/furniture-objects; Frontal Slayer has no equivalent validation.',
      captures: captures,
    },
    null,
    2
  );
}

export function clearGenerationParityForensics(): void {
  captures.length = 0;
}

export function buildParityComparisonSummary(): {
  frontalSlayer: GenerationParityForensicEnvelope | null;
  experienceLab: GenerationParityForensicEnvelope | null;
  creativeDirectorStudio: GenerationParityForensicEnvelope | null;
  firstDivergence: string;
} {
  const bySurface = (surface: GenerationParitySurface) =>
    captures.find((c) => c.surface === surface) ?? null;
  return {
    frontalSlayer: bySurface('frontal-slayer'),
    experienceLab: bySurface('experience-lab'),
    creativeDirectorStudio: bySurface('creative-direction-studio'),
    firstDivergence:
      'Studio OS isolated layers validate raw provider output against transparent-plate contract before background removal; Frontal Slayer accepts final composite without Scene Stack validation.',
  };
}
