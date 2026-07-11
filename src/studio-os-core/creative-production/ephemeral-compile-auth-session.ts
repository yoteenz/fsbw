/**
 * In-memory ephemeral compile authorization — never persisted to localStorage.
 * One active grant per browser tab session; cleared when compile completes.
 */

import type { ProductionAuthorization } from './types';

export type EphemeralCompileAuthGrant = {
  productionAuthorizationId: string;
  productionAuthorization: ProductionAuthorization;
  compileRunId: string;
  previewSessionId: string;
  organizationId: string;
  expiresAt: string;
  issuedAt: string;
  pipeline: 'experience-lab-validation';
};

let activeGrant: EphemeralCompileAuthGrant | null = null;

export function setActiveEphemeralCompileAuthorization(grant: EphemeralCompileAuthGrant): void {
  activeGrant = grant;
}

export function getActiveEphemeralCompileAuthorization(
  compileRunId?: string | null
): EphemeralCompileAuthGrant | null {
  if (!activeGrant) return null;
  if (compileRunId && activeGrant.compileRunId !== compileRunId) return null;
  const expires = Date.parse(activeGrant.expiresAt);
  if (!Number.isNaN(expires) && expires < Date.now()) {
    activeGrant = null;
    return null;
  }
  return activeGrant;
}

export function clearActiveEphemeralCompileAuthorization(compileRunId?: string | null): void {
  if (!activeGrant) return;
  if (!compileRunId || activeGrant.compileRunId === compileRunId) {
    activeGrant = null;
  }
}

export function attachEphemeralCompileAuth<T extends Record<string, unknown>>(
  payload: T,
  options: {
    validationMode: boolean;
    compileRunId?: string | null;
    previewSessionId?: string | null;
    organizationId?: string;
    departmentId?: string;
    stationId?: string;
    projectId?: string;
  }
): T & {
  productionAuthorizationId?: string;
  productionAuthorization?: ProductionAuthorization;
  validationMode?: boolean;
  compileRunId?: string;
  previewSessionId?: string;
  org_id?: string;
} {
  if (!options.validationMode) return payload;

  const grant = getActiveEphemeralCompileAuthorization(options.compileRunId);
  const validationContext = {
    validationMode: true as const,
    compileRunId: options.compileRunId ?? grant?.compileRunId,
    previewSessionId: options.previewSessionId ?? grant?.previewSessionId,
    org_id: options.organizationId ?? grant?.organizationId,
    departmentId: options.departmentId,
    stationId: options.stationId,
    projectId: options.projectId,
  };

  if (!grant) {
    return { ...payload, ...validationContext };
  }

  return {
    ...payload,
    ...validationContext,
    productionAuthorizationId: grant.productionAuthorizationId,
    productionAuthorization: grant.productionAuthorization,
    compileRunId: grant.compileRunId,
    previewSessionId: validationContext.previewSessionId ?? grant.previewSessionId,
    org_id: validationContext.org_id ?? grant.organizationId,
  };
}
