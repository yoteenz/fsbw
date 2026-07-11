import { describe, expect, it } from 'vitest';
import {
  hasCompleteValidationCompileContext,
  resolveValidationCompileMode,
} from './validation-compile-context';
import {
  adaptLegacyBuilderRequest,
  ensureValidationEphemeralAuth,
  legacyCompatEnabled,
  resolveLegacyCompatAuthorization,
} from '../../../api/_lib/creativeProduction/legacy-adapters.js';

const COMPLETE_CTX = {
  validationMode: true as const,
  compileRunId: 'run-creative-studio-001',
  previewSessionId: 'frontal-slayer:a:creative-direction:station-a:proj-1',
  organizationId: 'frontal-slayer',
  departmentId: 'creative-direction',
  stationId: 'station-a',
  projectId: 'proj-1',
};

const BASE_GENERATE_BODY = {
  departmentId: 'creative-direction',
  packageId: 'pkg-creative-direction-golden-v1',
  projectId: 'proj-1',
  productionGroupId: 'scene-stack-station-a-signature-landmark',
  heroAssetId: 'hero-landmark',
  prompt: 'Signature landmark layer',
  aspectRatio: '16:9',
  outputFormat: 'png',
  org_id: 'frontal-slayer',
  stationId: 'station-a',
};

describe('validation compile context gating', () => {
  it('requires all scope fields for complete validation context', () => {
    expect(hasCompleteValidationCompileContext(COMPLETE_CTX)).toBe(true);
    expect(
      hasCompleteValidationCompileContext({
        ...COMPLETE_CTX,
        stationId: '',
      })
    ).toBe(false);
  });

  it('resolveValidationCompileMode rejects global mode without complete scope', () => {
    expect(
      resolveValidationCompileMode(true, {
        compileRunId: 'run-1',
        previewSessionId: 'sess-1',
        organizationId: null,
        departmentId: null,
        stationId: null,
        projectId: null,
      })
    ).toBe(false);
  });

  it('resolveValidationCompileMode accepts explicit mode with complete scope', () => {
    expect(
      resolveValidationCompileMode(true, {
        compileRunId: COMPLETE_CTX.compileRunId,
        previewSessionId: COMPLETE_CTX.previewSessionId,
        organizationId: COMPLETE_CTX.organizationId,
        departmentId: COMPLETE_CTX.departmentId,
        stationId: COMPLETE_CTX.stationId,
        projectId: COMPLETE_CTX.projectId,
      })
    ).toBe(true);
  });
});

describe('shared generation pipeline regression', () => {
  it('Creative Studio normal generation without validation fields requires auth in production', () => {
    const prevNodeEnv = process.env.NODE_ENV;
    const prevVercelEnv = process.env.VERCEL_ENV;
    process.env.NODE_ENV = 'production';
    process.env.VERCEL_ENV = 'production';

    try {
      expect(legacyCompatEnabled()).toBe(false);
      const auth = resolveLegacyCompatAuthorization({ ...BASE_GENERATE_BODY });
      expect('error' in auth).toBe(true);
      if ('error' in auth) expect(auth.code).toBe('AUTH_REQUIRED');
    } finally {
      process.env.NODE_ENV = prevNodeEnv;
      process.env.VERCEL_ENV = prevVercelEnv;
    }
  });

  it('Experience Lab validation with complete context receives lazy server authorization', () => {
    const governed = ensureValidationEphemeralAuth(
      { ...BASE_GENERATE_BODY, ...COMPLETE_CTX },
      { id: 'founder-user', email: 'founder@example.com' }
    );
    expect(governed.productionAuthorizationId).toMatch(/^auth-xelab-/);
    expect(governed.productionAuthorization).toBeDefined();

    const adapted = adaptLegacyBuilderRequest(governed, '/api/admin/studio-builder-generate');
    expect('error' in adapted).toBe(false);
    if (!('error' in adapted)) {
      expect(adapted.validationMode).toBe(true);
      expect(adapted.assetIntent.outputClass).toBe('exploratory_draft');
      expect(adapted.execution.previewSessionId).toBe(COMPLETE_CTX.previewSessionId);
      expect(adapted.execution.stationId).toBe(COMPLETE_CTX.stationId);
      expect(adapted.execution.compileRunId).toBe(COMPLETE_CTX.compileRunId);
    }
  });

  it('incomplete validationMode does not receive lazy authorization', () => {
    const governed = ensureValidationEphemeralAuth(
      {
        validationMode: true,
        compileRunId: 'run-incomplete',
        previewSessionId: 'sess-only',
        org_id: 'frontal-slayer',
        departmentId: 'creative-direction',
        projectId: 'proj-1',
        prompt: 'test',
      },
      { id: 'founder-user', email: 'founder@example.com' }
    );
    expect(governed.productionAuthorizationId).toBeUndefined();
  });

  it('validationMode false does not classify request as experience-lab-validation', () => {
    const grantBody = ensureValidationEphemeralAuth(
      { ...BASE_GENERATE_BODY, ...COMPLETE_CTX },
      { id: 'u', email: 'a@b.com' }
    );
    const check = resolveLegacyCompatAuthorization({
      ...grantBody,
      validationMode: false,
    });
    expect('error' in check).toBe(true);
    if ('error' in check) expect(check.code).toBe('AUTH_VALIDATION_SCOPE');
  });
});
