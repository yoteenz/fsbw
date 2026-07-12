/**
 * Creative Direction Studio™ Scene Stack — server-issued ephemeral authorization.
 * Exploratory draft path; scoped to department / project / station.
 */

import type { ProductionAuthorization } from '../../../src/studio-os-core/creative-production/types.js';
import {
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
  validateAuthorizationStructure,
} from './studio-os-server.js';
import {
  signProductionAuthorization,
  verifyProductionAuthorizationSignature,
} from './authorization-signing.js';

export const CREATIVE_STUDIO_STACK_TTL_MS = 2 * 60 * 60 * 1000;
export const CREATIVE_STUDIO_STACK_PIPELINE = 'creative-studio-stack' as const;

export type IssueCreativeStudioStackAuthInput = {
  stackRunId: string;
  stackSessionId: string;
  organizationId: string;
  departmentId: string;
  stationId: string;
  projectId: string;
  actorId: string;
  actorEmail: string;
};

export type CreativeStudioStackAuthGrant = {
  productionAuthorizationId: string;
  productionAuthorization: ProductionAuthorization;
  stackRunId: string;
  stackSessionId: string;
  organizationId: string;
  departmentId: string;
  stationId: string;
  projectId: string;
  expiresAt: string;
  issuedAt: string;
  pipeline: typeof CREATIVE_STUDIO_STACK_PIPELINE;
};

export function buildCreativeStudioStackRunId(input: {
  departmentId: string;
  projectId: string;
  stationId: string;
}): string {
  return `cds-${input.departmentId}-${input.projectId}-${input.stationId}`;
}

export function buildCreativeStudioStackSessionId(input: {
  organizationId: string;
  departmentId: string;
  projectId: string;
  stationId: string;
}): string {
  return `${input.organizationId}:${input.departmentId}:${input.projectId}:${input.stationId}`;
}

export function isCreativeStudioStackAuthorization(
  authorization: ProductionAuthorization
): boolean {
  return (
    authorization.issuedBy?.issuedVia === 'creative-studio-stack-ephemeral' &&
    authorization.scope?.pipeline === CREATIVE_STUDIO_STACK_PIPELINE
  );
}

export function issueCreativeStudioStackAuthorization(
  input: IssueCreativeStudioStackAuthInput
): CreativeStudioStackAuthGrant {
  const now = Date.now();
  const issuedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + CREATIVE_STUDIO_STACK_TTL_MS).toISOString();
  const initiative = createDemoCreativeInitiative();
  const base = createDemoProductionAuthorizationPayload(initiative);

  const productionAuthorizationId = `auth-cds-${input.stackRunId}`;

  const productionAuthorization = signProductionAuthorization({
    ...base,
    id: productionAuthorizationId,
    issuedAt,
    expiresAt,
    issuedBy: {
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      role: 'creative-studio-stack-ephemeral',
      issuedVia: 'creative-studio-stack-ephemeral',
    },
    scope: {
      touchpoints: [],
      assetIntents: [],
      pipeline: CREATIVE_STUDIO_STACK_PIPELINE,
      ephemeralCompileRunId: input.stackRunId,
      previewSessionId: input.stackSessionId,
      organizationId: input.organizationId,
      departmentId: input.departmentId,
      stationId: input.stationId,
      projectId: input.projectId,
    },
    approvalState: 'approved',
    rightsState: 'cleared',
  });

  return {
    productionAuthorizationId,
    productionAuthorization,
    stackRunId: input.stackRunId,
    stackSessionId: input.stackSessionId,
    organizationId: input.organizationId,
    departmentId: input.departmentId,
    stationId: input.stationId,
    projectId: input.projectId,
    expiresAt,
    issuedAt,
    pipeline: CREATIVE_STUDIO_STACK_PIPELINE,
  };
}

export type CreativeStudioStackAuthBody = {
  productionAuthorizationId?: string;
  productionAuthorization?: unknown;
  creativeStudioStackMode?: boolean;
  stackRunId?: string;
  stackSessionId?: string;
  org_id?: string;
  departmentId?: string;
  stationId?: string;
  projectId?: string;
};

export function validateCreativeStudioStackAuthorization(
  authorization: ProductionAuthorization,
  body: CreativeStudioStackAuthBody
): { ok: true } | { ok: false; code: string; error: string } {
  if (!isCreativeStudioStackAuthorization(authorization)) {
    return { ok: true };
  }

  const structure = validateAuthorizationStructure(authorization);
  if (!structure.ok) {
    return { ok: false, code: structure.code, error: structure.error };
  }

  if (!verifyProductionAuthorizationSignature(authorization)) {
    return { ok: false, code: 'AUTH_SIGNATURE_INVALID', error: 'Invalid creative studio stack authorization signature' };
  }

  if (body.creativeStudioStackMode !== true) {
    return {
      ok: false,
      code: 'AUTH_STACK_SCOPE',
      error: 'Creative Studio stack authorization requires creativeStudioStackMode: true',
    };
  }

  const stackRunId = String(body.stackRunId ?? '').trim();
  const scopedRunId = authorization.scope.ephemeralCompileRunId ?? '';
  if (!stackRunId || stackRunId !== scopedRunId) {
    return {
      ok: false,
      code: 'AUTH_STACK_RUN_SCOPE',
      error: 'Creative Studio stack authorization stackRunId does not match active stack run',
    };
  }

  const orgId = String(body.org_id ?? 'frontal-slayer').trim();
  if (authorization.scope.organizationId && authorization.scope.organizationId !== orgId) {
    return { ok: false, code: 'AUTH_ORG_SCOPE', error: 'Creative Studio stack authorization organization scope mismatch' };
  }

  const departmentId = String(body.departmentId ?? '').trim();
  if (authorization.scope.departmentId && departmentId && departmentId !== authorization.scope.departmentId) {
    return { ok: false, code: 'AUTH_DEPARTMENT_SCOPE', error: 'Creative Studio stack authorization department scope mismatch' };
  }

  const stationId = String(body.stationId ?? '').trim();
  if (authorization.scope.stationId && stationId && stationId !== authorization.scope.stationId) {
    return { ok: false, code: 'AUTH_STATION_SCOPE', error: 'Creative Studio stack authorization station scope mismatch' };
  }

  const projectId = String(body.projectId ?? '').trim();
  if (authorization.scope.projectId && projectId && projectId !== authorization.scope.projectId) {
    return { ok: false, code: 'AUTH_PROJECT_SCOPE', error: 'Creative Studio stack authorization project scope mismatch' };
  }

  return { ok: true };
}

export function auditCreativeStudioStackAuthEvent(
  event: 'issued' | 'validated' | 'rejected',
  detail: Record<string, unknown>
): void {
  console.info(
    JSON.stringify({
      audit: 'creative-studio-stack-authorization',
      event,
      at: new Date().toISOString(),
      ...detail,
    })
  );
}
