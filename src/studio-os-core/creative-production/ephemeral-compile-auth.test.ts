import { describe, expect, it, beforeEach } from 'vitest';
import {
  attachEphemeralCompileAuth,
  clearActiveEphemeralCompileAuthorization,
  getActiveEphemeralCompileAuthorization,
  setActiveEphemeralCompileAuthorization,
  type EphemeralCompileAuthGrant,
} from './ephemeral-compile-auth-session';
import {
  issueEphemeralValidationAuthorization,
  validateEphemeralValidationAuthorization,
} from '../../../api/_lib/creativeProduction/ephemeral-validation-auth.js';

function sampleGrant(compileRunId: string): EphemeralCompileAuthGrant {
  const issued = issueEphemeralValidationAuthorization({
    compileRunId,
    previewSessionId: 'studio-os:a:creative-direction:station-a:proj-1',
    organizationId: 'studio-os',
    departmentId: 'creative-direction',
    stationId: 'station-a',
    projectId: 'proj-1',
    actorId: 'user-test',
    actorEmail: 'test@example.com',
  });
  return {
    productionAuthorizationId: issued.productionAuthorizationId,
    productionAuthorization: issued.productionAuthorization,
    compileRunId: issued.compileRunId,
    previewSessionId: issued.previewSessionId,
    organizationId: issued.organizationId,
    expiresAt: issued.expiresAt,
    issuedAt: issued.issuedAt,
    pipeline: 'experience-lab-validation',
  };
}

describe('ephemeral compile auth session', () => {
  beforeEach(() => {
    clearActiveEphemeralCompileAuthorization();
  });

  it('attaches server-issued authorization to governed generation payload', () => {
    const compileRunId = 'run-test-001';
    setActiveEphemeralCompileAuthorization(sampleGrant(compileRunId));

    const payload = attachEphemeralCompileAuth(
      { prompt: 'landmark' },
      {
        validationMode: true,
        compileRunId,
        previewSessionId: 'studio-os:a:creative-direction:station-a:proj-1',
        organizationId: 'studio-os',
        departmentId: 'creative-direction',
        stationId: 'station-a',
        projectId: 'proj-1',
      }
    );

    expect(payload.productionAuthorizationId).toBe(`auth-xelab-${compileRunId}`);
    expect(payload.productionAuthorization).toBeDefined();
    expect(payload.validationMode).toBe(true);
    expect(payload.compileRunId).toBe(compileRunId);
  });

  it('does not attach authorization when compileRunId mismatches', () => {
    setActiveEphemeralCompileAuthorization(sampleGrant('run-a'));
    const payload = attachEphemeralCompileAuth(
      { prompt: 'landmark' },
      { validationMode: true, compileRunId: 'run-b' }
    );
    expect(payload.productionAuthorizationId).toBeUndefined();
  });

  it('clears authorization after compile completes', () => {
    const compileRunId = 'run-clear-001';
    setActiveEphemeralCompileAuthorization(sampleGrant(compileRunId));
    expect(getActiveEphemeralCompileAuthorization(compileRunId)).not.toBeNull();
    clearActiveEphemeralCompileAuthorization(compileRunId);
    expect(getActiveEphemeralCompileAuthorization(compileRunId)).toBeNull();
  });

  it('expires stale authorization by expiresAt', () => {
    const grant = sampleGrant('run-expired');
    grant.expiresAt = new Date(Date.now() - 1000).toISOString();
    setActiveEphemeralCompileAuthorization(grant);
    expect(getActiveEphemeralCompileAuthorization('run-expired')).toBeNull();
  });
});

describe('ephemeral validation authorization (server)', () => {
  it('issues unique authorization per compile run', () => {
    const a = issueEphemeralValidationAuthorization({
      compileRunId: 'run-1',
      previewSessionId: 'sess-1',
      organizationId: 'studio-os',
      departmentId: 'creative-direction',
      stationId: 'station-a',
      projectId: 'proj-1',
      actorId: 'user-1',
      actorEmail: 'a@example.com',
    });
    const b = issueEphemeralValidationAuthorization({
      compileRunId: 'run-2',
      previewSessionId: 'sess-1',
      organizationId: 'studio-os',
      departmentId: 'creative-direction',
      stationId: 'station-a',
      projectId: 'proj-1',
      actorId: 'user-1',
      actorEmail: 'a@example.com',
    });
    expect(a.productionAuthorizationId).not.toBe(b.productionAuthorizationId);
  });

  it('rejects authorization when validationMode is false', () => {
    const grant = issueEphemeralValidationAuthorization({
      compileRunId: 'run-scope',
      previewSessionId: 'sess-scope',
      organizationId: 'studio-os',
      departmentId: 'creative-direction',
      stationId: 'station-a',
      projectId: 'proj-1',
      actorId: 'user-1',
      actorEmail: 'a@example.com',
    });
    const result = validateEphemeralValidationAuthorization(grant.productionAuthorization, {
      productionAuthorizationId: grant.productionAuthorizationId,
      productionAuthorization: grant.productionAuthorization,
      compileRunId: 'run-scope',
      org_id: 'studio-os',
      previewSessionId: 'sess-scope',
      validationMode: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('AUTH_VALIDATION_SCOPE');
  });

  it('rejects authorization when compileRunId mismatches', () => {
    const grant = issueEphemeralValidationAuthorization({
      compileRunId: 'run-scope',
      previewSessionId: 'sess-scope',
      organizationId: 'studio-os',
      departmentId: 'creative-direction',
      stationId: 'station-a',
      projectId: 'proj-1',
      actorId: 'user-1',
      actorEmail: 'a@example.com',
    });
    const result = validateEphemeralValidationAuthorization(grant.productionAuthorization, {
      compileRunId: 'other-run',
      validationMode: true,
      org_id: 'studio-os',
      previewSessionId: 'sess-scope',
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('AUTH_COMPILE_SCOPE');
  });
});
