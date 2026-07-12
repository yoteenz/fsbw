import { describe, expect, it } from 'vitest';
import {
  buildCreativeStudioStackRunId,
  issueCreativeStudioStackAuthorization,
  isCreativeStudioStackAuthorization,
  validateCreativeStudioStackAuthorization,
} from '../../../api/_lib/creativeProduction/creative-studio-stack-auth.js';

describe('creative studio stack authorization', () => {
  const input = {
    stackRunId: buildCreativeStudioStackRunId({
      departmentId: 'creative-direction',
      projectId: 'project-001',
      stationId: 'story-table',
    }),
    stackSessionId: 'frontal-slayer:creative-direction:project-001:story-table',
    organizationId: 'frontal-slayer',
    departmentId: 'creative-direction',
    stationId: 'story-table',
    projectId: 'project-001',
    actorId: 'actor-1',
    actorEmail: 'founder@example.com',
  };

  it('issues signed creative studio stack authorization', () => {
    const grant = issueCreativeStudioStackAuthorization(input);
    expect(grant.productionAuthorizationId).toMatch(/^auth-cds-/);
    expect(isCreativeStudioStackAuthorization(grant.productionAuthorization)).toBe(true);
  });

  it('validates scoped stack body', () => {
    const grant = issueCreativeStudioStackAuthorization(input);
    const ok = validateCreativeStudioStackAuthorization(grant.productionAuthorization, {
      creativeStudioStackMode: true,
      stackRunId: grant.stackRunId,
      org_id: grant.organizationId,
      departmentId: grant.departmentId,
      stationId: grant.stationId,
      projectId: grant.projectId,
    });
    expect(ok).toEqual({ ok: true });
  });

  it('rejects missing creativeStudioStackMode flag', () => {
    const grant = issueCreativeStudioStackAuthorization(input);
    const denied = validateCreativeStudioStackAuthorization(grant.productionAuthorization, {
      stackRunId: grant.stackRunId,
      org_id: grant.organizationId,
      departmentId: grant.departmentId,
      stationId: grant.stationId,
      projectId: grant.projectId,
    });
    expect(denied.ok).toBe(false);
  });
});
