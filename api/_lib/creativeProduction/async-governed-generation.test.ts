import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { GovernedGenerationRequest } from '../../../src/studio-os-core/creative-production/types.js';

vi.mock('../supabase.js', () => ({
  getSupabaseAdminServiceRole: vi.fn(),
}));

import {
  buildGovernedGenerationIdempotencyKey,
  isAsyncGovernedGenerationEnabledForRequest,
  isAsyncGovernedGenerationV1Enabled,
} from './async-governed-generation.js';

function sampleRequest(overrides?: Partial<GovernedGenerationRequest>): GovernedGenerationRequest {
  return {
    productionAuthorizationId: 'auth-1',
    orgId: 'frontal-slayer',
    sourceRoute: '/api/admin/studio-builder-generate',
    sourceSystem: 'studio-builder',
    assetIntent: {
      initiativeId: 'init-1',
      touchpoint: 'web-experience',
      discipline: 'experience-compile',
      recipeSlug: 'shell',
      inputRefs: [],
      rightsRequirements: [],
      qualityGates: [],
      expressionLineage: { kind: 'source', initiativeId: 'init-1' },
      outputClass: 'material',
    },
    execution: {
      departmentId: 'creative-direction',
      packageId: 'pkg-1',
      projectId: 'proj-1',
      productionGroupId: 'scene-stack-arrival-signature-landmark',
      heroAssetId: 'hero-1',
      prompt: 'test prompt',
      aspectRatio: '16:9',
      outputFormat: 'png',
      stationId: 'arrival',
    },
    validationMode: true,
    compileRunId: 'compile-run-1',
    ...overrides,
  };
}

describe('async governed generation flags', () => {
  const prevAsync = process.env.ASYNC_GOVERNED_GENERATION_V1;
  const prevCs = process.env.ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO;

  afterEach(() => {
    if (prevAsync === undefined) delete process.env.ASYNC_GOVERNED_GENERATION_V1;
    else process.env.ASYNC_GOVERNED_GENERATION_V1 = prevAsync;
    if (prevCs === undefined) delete process.env.ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO;
    else process.env.ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO = prevCs;
  });

  it('enables validation async by default when flag unset', () => {
    delete process.env.ASYNC_GOVERNED_GENERATION_V1;
    expect(isAsyncGovernedGenerationEnabledForRequest(sampleRequest())).toBe(true);
  });

  it('disables when ASYNC_GOVERNED_GENERATION_V1=0', () => {
    process.env.ASYNC_GOVERNED_GENERATION_V1 = '0';
    expect(isAsyncGovernedGenerationEnabledForRequest(sampleRequest())).toBe(false);
  });

  it('requires creative studio flag for non-validation', () => {
    process.env.ASYNC_GOVERNED_GENERATION_V1 = '1';
    delete process.env.ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO;
    expect(isAsyncGovernedGenerationEnabledForRequest(sampleRequest({ validationMode: false }))).toBe(false);
    process.env.ASYNC_GOVERNED_GENERATION_CREATIVE_STUDIO = '1';
    expect(isAsyncGovernedGenerationEnabledForRequest(sampleRequest({ validationMode: false }))).toBe(true);
  });

  it('builds stable idempotency keys', () => {
    const a = buildGovernedGenerationIdempotencyKey(sampleRequest());
    const b = buildGovernedGenerationIdempotencyKey(sampleRequest());
    const c = buildGovernedGenerationIdempotencyKey(sampleRequest({ compileRunId: 'other-run' }));
    expect(a).toBe(b);
    expect(a).not.toBe(c);
  });

  it('isAsyncGovernedGenerationV1Enabled respects explicit flag', () => {
    process.env.ASYNC_GOVERNED_GENERATION_V1 = '1';
    expect(isAsyncGovernedGenerationV1Enabled()).toBe(true);
    process.env.ASYNC_GOVERNED_GENERATION_V1 = 'false';
    expect(isAsyncGovernedGenerationV1Enabled()).toBe(false);
  });
});
