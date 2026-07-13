import type { ModelRoutingDecision } from '../creative-production/model-routing-engine/types';

export const GENERATION_ROUTING_RECORD_VERSION = 'generation-routing-record.v1' as const;

/** Forensic replay record — Quality Guard™ stores routing context for every generation. */
export type GenerationRoutingRecord = {
  recordVersion: typeof GENERATION_ROUTING_RECORD_VERSION;
  recordedAt: string;
  artifactIntent: string;
  workerFamily: string;
  surface: string;
  selectedModel: string;
  routeId: string;
  promptVersion: string;
  promptBuilderId: string;
  routingDecision: string;
  referenceStrategy: string;
  referencePolicy: string;
  policyVersion: string;
  materialLibraryVersion?: string | null;
  lightingProfileId?: string | null;
  cameraProfileId?: string | null;
  perspectiveProfileId?: string | null;
  brandAssetRevision?: string | null;
  approvedFounderRenderUrl?: string | null;
  blueprintRevision?: number | null;
  organizationId?: string | null;
};

export type BuildGenerationRoutingRecordInput = {
  decision: ModelRoutingDecision;
  materialLibraryVersion?: string | null;
  lightingProfileId?: string | null;
  cameraProfileId?: string | null;
  perspectiveProfileId?: string | null;
  brandAssetRevision?: string | null;
  approvedFounderRenderUrl?: string | null;
  blueprintRevision?: number | null;
  organizationId?: string | null;
  recordedAt?: string;
};

export function buildGenerationRoutingRecord(input: BuildGenerationRoutingRecordInput): GenerationRoutingRecord {
  const { decision } = input;
  return {
    recordVersion: GENERATION_ROUTING_RECORD_VERSION,
    recordedAt: input.recordedAt ?? new Date().toISOString(),
    artifactIntent: decision.artifactIntent,
    workerFamily: decision.workerFamily,
    surface: decision.surface,
    selectedModel: decision.providerModel,
    routeId: decision.routeId,
    promptVersion: decision.promptVersion,
    promptBuilderId: decision.promptBuilderId,
    routingDecision: `${decision.workerFamily}:${decision.routeId}`,
    referenceStrategy: decision.referenceStrategy,
    referencePolicy: decision.referencePolicy,
    policyVersion: decision.policyVersion,
    materialLibraryVersion: input.materialLibraryVersion ?? null,
    lightingProfileId: input.lightingProfileId ?? null,
    cameraProfileId: input.cameraProfileId ?? null,
    perspectiveProfileId: input.perspectiveProfileId ?? null,
    brandAssetRevision: input.brandAssetRevision ?? null,
    approvedFounderRenderUrl: input.approvedFounderRenderUrl ?? null,
    blueprintRevision: input.blueprintRevision ?? null,
    organizationId: input.organizationId ?? null,
  };
}
