import { describe, expect, it } from 'vitest';
import {
  classifyProviderFailure,
  normalizeGenerationError,
  publicMessageFromDiagnostic,
} from '../../../api/_lib/creativeProduction/generation-error-diagnostics.js';

describe('generation-error-diagnostics', () => {
  it('preserves FAL ApiError status and body preview', () => {
    const err = Object.assign(new Error('Forbidden'), {
      name: 'ApiError',
      status: 403,
      body: { detail: [{ msg: 'invalid image_urls' }] },
      requestId: 'req-abc',
    });
    const diag = normalizeGenerationError({
      err,
      stage: 'generateStudioBuilderAsset',
      traceId: 'trace-test',
      provider: 'fal',
      model: 'fal-ai/nano-banana-pro/edit',
    });
    expect(diag.category).toBe('PROVIDER_REJECTED');
    expect(diag.providerHttpStatus).toBe(403);
    expect(diag.providerResponsePreview).toContain('req-abc');
    expect(diag.providerResponsePreview).toContain('invalid image_urls');
  });

  it('classifies timeout provider failures', () => {
    expect(classifyProviderFailure(504)).toBe('GENERATION_TIMEOUT');
    expect(classifyProviderFailure(422)).toBe('PROVIDER_REJECTED');
  });

  it('returns sanitized public message without leaking stack', () => {
    const diag = normalizeGenerationError({
      err: new Error('secret-token=abc123 failed'),
      stage: 'studio-builder-generate.handler',
      traceId: 'trace-1',
      category: 'API_ROUTE_FAILED',
    });
    const msg = publicMessageFromDiagnostic(diag);
    expect(msg).not.toContain('abc123');
    expect(msg).toContain('[REDACTED]');
  });

  it('preserves nested cause chain', () => {
    const cause = new Error('Reference fetch failed (404)');
    const err = new Error('Marble brand anchor reference missing');
    (err as Error & { cause?: unknown }).cause = cause;
    const diag = normalizeGenerationError({
      err,
      stage: 'uploadLocalOrSiteRefToFal',
      traceId: 'trace-2',
    });
    expect(diag.causeMessage).toContain('404');
  });
});
