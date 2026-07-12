import { describe, expect, it } from 'vitest';
import {
  adaptLegacyBuilderRequest,
  ensureValidationEphemeralAuth,
} from '../../../api/_lib/creativeProduction/legacy-adapters.js';
import { executeGovernedGeneration } from '../../../api/_lib/creativeProduction/generation-gateway.js';

const COMPLETE_CTX = {
  validationMode: true as const,
  compileRunId: 'run-layer1-regression-001',
  previewSessionId: 'frontal-slayer:a:creative-direction:station-a:proj-1',
  organizationId: 'frontal-slayer',
  departmentId: 'creative-direction',
  stationId: 'station-a',
  projectId: 'proj-1',
};

const LAYER1_BODY = {
  departmentId: 'creative-direction',
  packageId: 'pkg-creative-direction-golden-v1',
  projectId: 'proj-1',
  productionGroupId: 'scene-stack-station-a-signature-landmark',
  heroAssetId: 'hero-landmark',
  prompt: 'Signature landmark layer',
  aspectRatio: '16:9',
  outputFormat: 'png',
  forceGenerate: true,
  org_id: 'frontal-slayer',
  stationId: 'station-a',
};

describe('Layer 1 governed generation diagnostics', () => {
  it('Creative Studio and Experience Engine share the same adapted governed request path', () => {
    const governed = ensureValidationEphemeralAuth(
      { ...LAYER1_BODY, ...COMPLETE_CTX },
      { id: 'founder-user', email: 'founder@example.com' }
    );
    const adapted = adaptLegacyBuilderRequest(governed, '/api/admin/studio-builder-generate');
    expect('error' in adapted).toBe(false);
    if ('error' in adapted) return;
    expect(adapted.sourceSystem).toBe('studio-builder');
    expect(adapted.execution.stationId).toBe('station-a');
    expect(adapted.execution.productionGroupId).toContain('signature-landmark');
    expect(adapted.validationMode).toBe(true);
  });

  it('returns structured JSON failure with traceId when provider is unavailable', async () => {
    const prev = process.env.FAL_KEY;
    process.env.FAL_KEY = '';
    try {
      const governed = ensureValidationEphemeralAuth(
        { ...LAYER1_BODY, ...COMPLETE_CTX },
        { id: 'founder-user', email: 'founder@example.com' }
      );
      const adapted = adaptLegacyBuilderRequest(governed, '/api/admin/studio-builder-generate');
      expect('error' in adapted).toBe(false);
      if ('error' in adapted) return;
      const result = await executeGovernedGeneration(adapted, {
        sourceRoute: '/api/admin/studio-builder-generate',
      });
      expect(result.ok).toBe(false);
      if (result.ok) return;
      expect(result.code).toBe('GENERATION_FAILED');
      expect(result.traceId).toBeTruthy();
      expect(result.error).toContain('Image generation provider is not configured');
    } finally {
      if (prev === undefined) delete process.env.FAL_KEY;
      else process.env.FAL_KEY = prev;
    }
  });
});
