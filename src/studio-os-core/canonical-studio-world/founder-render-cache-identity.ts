import { createHash } from 'node:crypto';
import type { ConstructionPlan } from '../blueprint-author/construction-plan-schema';

export const FOUNDER_RENDER_CACHE_IDENTITY_VERSION = 'founder-render-cache-identity.v1' as const;

export type FounderRenderCacheIdentity = {
  identityVersion: typeof FOUNDER_RENDER_CACHE_IDENTITY_VERSION;
  organizationId: string;
  departmentId: string;
  departmentRevision: number;
  blueprintRevision: number;
  promptRevision: string;
  referenceRevision: string;
  materialRevision: string;
  lightingRevision: string;
  cameraRevision: string;
  model: string;
  aspectRatio: string;
  provider: string;
  cacheKey: string;
};

export function buildFounderRenderCacheIdentity(input: {
  plan: ConstructionPlan;
  promptVersion: string;
  model: string;
  aspectRatio: string;
  provider: string;
  referencePackageVersion?: string;
}): FounderRenderCacheIdentity {
  const departmentId = input.plan.room.roomId;
  const parts = {
    organizationId: input.plan.metadata.organizationId,
    departmentId,
    departmentRevision: input.plan.metadata.revision,
    blueprintRevision: input.plan.metadata.revision,
    promptRevision: input.promptVersion,
    referenceRevision: input.referencePackageVersion ?? `ref-${input.plan.metadata.organizationId}-v1`,
    materialRevision: input.plan.materialSet.version,
    lightingRevision: input.plan.lightingProfile.version,
    cameraRevision: input.plan.cameraAnchors[0]?.anchorId ?? 'default',
    model: input.model,
    aspectRatio: input.aspectRatio,
    provider: input.provider,
    architectureId: input.plan.architecture.architectureId,
    shellSpecId: input.plan.architecture.shellSpecId,
  };

  const cacheKey = createHash('sha256')
    .update(
      [
        parts.organizationId,
        parts.departmentId,
        String(parts.departmentRevision),
        String(parts.blueprintRevision),
        parts.promptRevision,
        parts.referenceRevision,
        parts.materialRevision,
        parts.lightingRevision,
        parts.cameraRevision,
        parts.model,
        parts.aspectRatio,
        parts.provider,
        parts.architectureId,
        parts.shellSpecId,
      ].join('|')
    )
    .digest('hex');

  return {
    identityVersion: FOUNDER_RENDER_CACHE_IDENTITY_VERSION,
    organizationId: parts.organizationId,
    departmentId: parts.departmentId,
    departmentRevision: parts.departmentRevision,
    blueprintRevision: parts.blueprintRevision,
    promptRevision: parts.promptRevision,
    referenceRevision: parts.referenceRevision,
    materialRevision: parts.materialRevision,
    lightingRevision: parts.lightingRevision,
    cameraRevision: parts.cameraRevision,
    model: parts.model,
    aspectRatio: parts.aspectRatio,
    provider: parts.provider,
    cacheKey,
  };
}
