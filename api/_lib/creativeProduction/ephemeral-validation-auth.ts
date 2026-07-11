/**
 * Experience Lab ephemeral ProductionAuthorization™ — server-issued, compile-scoped.
 * B1 repair: no hardcoded client IDs; signed, expiring, auditable, non-canonical.
 */

import type { ProductionAuthorization } from '../../../src/studio-os-core/creative-production/types.js';
import {
  createDemoCreativeInitiative,
  createDemoProductionAuthorizationPayload,
} from '../../../src/studio-os-core/creative-production/demo-seed.js';
import {
  signProductionAuthorization,
  verifyProductionAuthorizationSignature,
} from './authorization-signing.js';
import { validateAuthorizationStructure } from '../../../src/studio-os-core/creative-production/authorization.js';

export const EXPERIENCE_LAB_EPHEMERAL_TTL_MS = 30 * 60 * 1000;
export const EXPERIENCE_LAB_EPHEMERAL_PIPELINE = 'experience-lab-validation' as const;

export type IssueEphemeralValidationAuthInput = {
  compileRunId: string;
  previewSessionId: string;
  organizationId: string;
  departmentId: string;
  stationId: string;
  projectId: string;
  actorId: string;
  actorEmail: string;
};

export type EphemeralValidationAuthGrant = {
  productionAuthorizationId: string;
  productionAuthorization: ProductionAuthorization;
  compileRunId: string;
  previewSessionId: string;
  organizationId: string;
  expiresAt: string;
  issuedAt: string;
  pipeline: typeof EXPERIENCE_LAB_EPHEMERAL_PIPELINE;
};

export function isExperienceLabEphemeralAuthorization(
  authorization: ProductionAuthorization
): boolean {
  return (
    authorization.issuedBy?.issuedVia === 'experience-lab-ephemeral' &&
    authorization.scope?.pipeline === EXPERIENCE_LAB_EPHEMERAL_PIPELINE
  );
}

export function issueEphemeralValidationAuthorization(
  input: IssueEphemeralValidationAuthInput
): EphemeralValidationAuthGrant {
  const now = Date.now();
  const issuedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + EXPERIENCE_LAB_EPHEMERAL_TTL_MS).toISOString();
  const initiative = createDemoCreativeInitiative();
  const base = createDemoProductionAuthorizationPayload(initiative);

  const productionAuthorizationId = `auth-xelab-${input.compileRunId}`;

  const productionAuthorization = signProductionAuthorization({
    ...base,
    id: productionAuthorizationId,
    issuedAt,
    expiresAt,
    issuedBy: {
      actorId: input.actorId,
      actorEmail: input.actorEmail,
      role: 'validation-ephemeral',
      issuedVia: 'experience-lab-ephemeral',
    },
    scope: {
      touchpoints: [],
      assetIntents: [],
      pipeline: EXPERIENCE_LAB_EPHEMERAL_PIPELINE,
      ephemeralCompileRunId: input.compileRunId,
      previewSessionId: input.previewSessionId,
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
    compileRunId: input.compileRunId,
    previewSessionId: input.previewSessionId,
    organizationId: input.organizationId,
    expiresAt,
    issuedAt,
    pipeline: EXPERIENCE_LAB_EPHEMERAL_PIPELINE,
  };
}

export type EphemeralValidationBody = {
  productionAuthorizationId?: string;
  productionAuthorization?: unknown;
  validationMode?: boolean;
  compileRunId?: string;
  org_id?: string;
  previewSessionId?: string;
  departmentId?: string;
  stationId?: string;
  projectId?: string;
};

export function validateEphemeralValidationAuthorization(
  authorization: ProductionAuthorization,
  body: EphemeralValidationBody
): { ok: true } | { ok: false; code: string; error: string } {
  if (!isExperienceLabEphemeralAuthorization(authorization)) {
    return { ok: true };
  }

  const structure = validateAuthorizationStructure(authorization);
  if (!structure.ok) {
    return { ok: false, code: structure.code, error: structure.error };
  }

  if (!verifyProductionAuthorizationSignature(authorization)) {
    return { ok: false, code: 'AUTH_SIGNATURE_INVALID', error: 'Invalid ephemeral authorization signature' };
  }

  if (body.validationMode !== true) {
    return {
      ok: false,
      code: 'AUTH_VALIDATION_SCOPE',
      error: 'Experience Lab ephemeral authorization requires validationMode: true',
    };
  }

  const compileRunId = String(body.compileRunId ?? '').trim();
  const scopedRunId = authorization.scope.ephemeralCompileRunId ?? '';
  if (!compileRunId || compileRunId !== scopedRunId) {
    return {
      ok: false,
      code: 'AUTH_COMPILE_SCOPE',
      error: 'Ephemeral authorization compileRunId does not match active compile',
    };
  }

  const orgId = String(body.org_id ?? 'frontal-slayer').trim();
  if (authorization.scope.organizationId && authorization.scope.organizationId !== orgId) {
    return {
      ok: false,
      code: 'AUTH_ORG_SCOPE',
      error: 'Ephemeral authorization organization scope mismatch',
    };
  }

  const previewSessionId = String(body.previewSessionId ?? '').trim();
  if (authorization.scope.previewSessionId && previewSessionId && previewSessionId !== authorization.scope.previewSessionId) {
    return {
      ok: false,
      code: 'AUTH_PREVIEW_SCOPE',
      error: 'Ephemeral authorization preview session scope mismatch',
    };
  }

  return { ok: true };
}

export function auditEphemeralAuthEvent(
  event: 'issued' | 'validated' | 'rejected',
  detail: Record<string, unknown>
): void {
  console.info(
    JSON.stringify({
      audit: 'experience-lab-ephemeral-authorization',
      event,
      at: new Date().toISOString(),
      ...detail,
    })
  );
}
