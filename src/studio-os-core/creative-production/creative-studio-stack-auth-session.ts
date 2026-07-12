/**
 * In-memory Creative Studio stack authorization — never persisted to localStorage.
 */

import type { ProductionAuthorization } from './types';

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
  pipeline: 'creative-studio-stack';
};

let activeStackGrant: CreativeStudioStackAuthGrant | null = null;

export function setActiveCreativeStudioStackAuthorization(grant: CreativeStudioStackAuthGrant): void {
  activeStackGrant = grant;
}

export function getActiveCreativeStudioStackAuthorization(
  stackRunId?: string | null
): CreativeStudioStackAuthGrant | null {
  if (!activeStackGrant) return null;
  if (stackRunId && activeStackGrant.stackRunId !== stackRunId) return null;
  const expires = Date.parse(activeStackGrant.expiresAt);
  if (!Number.isNaN(expires) && expires < Date.now()) {
    activeStackGrant = null;
    return null;
  }
  return activeStackGrant;
}

export function clearActiveCreativeStudioStackAuthorization(stackRunId?: string | null): void {
  if (!activeStackGrant) return;
  if (!stackRunId || activeStackGrant.stackRunId === stackRunId) {
    activeStackGrant = null;
  }
}

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

export function attachCreativeStudioStackAuth<T extends Record<string, unknown>>(
  payload: T,
  options: {
    creativeStudioStackMode: boolean;
    organizationId?: string;
    departmentId?: string;
    stationId?: string;
    projectId?: string;
  }
): T & {
  productionAuthorizationId?: string;
  productionAuthorization?: ProductionAuthorization;
  creativeStudioStackMode?: boolean;
  stackRunId?: string;
  stackSessionId?: string;
  org_id?: string;
  departmentId?: string;
  stationId?: string;
  projectId?: string;
} {
  if (!options.creativeStudioStackMode) return payload;

  const departmentId = String(options.departmentId ?? '').trim();
  const stationId = String(options.stationId ?? '').trim();
  const projectId = String(options.projectId ?? '').trim();
  const organizationId = String(options.organizationId ?? 'frontal-slayer').trim();
  if (!departmentId || !stationId || !projectId) return payload;

  const stackRunId = buildCreativeStudioStackRunId({ departmentId, projectId, stationId });
  const stackSessionId = buildCreativeStudioStackSessionId({
    organizationId,
    departmentId,
    projectId,
    stationId,
  });
  const grant = getActiveCreativeStudioStackAuthorization(stackRunId);
  if (!grant) {
    return {
      ...payload,
      creativeStudioStackMode: true,
      stackRunId,
      stackSessionId,
      org_id: organizationId,
      departmentId,
      stationId,
      projectId,
    };
  }

  return {
    ...payload,
    creativeStudioStackMode: true,
    stackRunId: grant.stackRunId,
    stackSessionId: grant.stackSessionId,
    org_id: grant.organizationId,
    departmentId: grant.departmentId,
    stationId: grant.stationId,
    projectId: grant.projectId,
    productionAuthorizationId: grant.productionAuthorizationId,
    productionAuthorization: grant.productionAuthorization,
  };
}
