/**
 * Studio World External Integration Contract v1 — test harness.
 * Safe offline tests — no SITE 00 dependency, no live HTTP required.
 */

import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  EXTERNAL_CONTRACT_VERSION,
  mapLifecycleToExternalStatus,
  validateProvisionRequest,
  validateReviewSubmission,
} from '../../../src/studio-os-core/virtual-production/external/contract-v1';
import {
  resolveOrgForExternalSystem,
  signExternalRequestForTest,
  verifyExternalRequest,
} from './external-auth.js';
import type { VercelRequest } from '@vercel/node';

const TEST_SECRET = 'test-studio-world-external-secret-v1';

function mockRequest(
  headers: Record<string, string>,
  body = ''
): VercelRequest {
  const normalized: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }
  return { headers: normalized, body } as VercelRequest;
}

describe('External contract v1 — validation', () => {
  it('rejects malformed provision payload', () => {
    expect(validateProvisionRequest(null)).toBeNull();
    expect(validateProvisionRequest({})).toBeNull();
    expect(validateProvisionRequest({ externalSystem: 'x' })).toBeNull();
  });

  it('accepts valid provision payload', () => {
    const req = validateProvisionRequest({
      externalSystem: 'studio-world-test',
      externalEngagementId: 'eng-001',
      campaignObjective: 'Social pilot',
      platforms: ['instagram_reels'],
      aspectRatios: ['9:16'],
    });
    expect(req?.externalEngagementId).toBe('eng-001');
    expect(req?.platforms).toEqual(['instagram_reels']);
  });

  it('rejects invalid review submission', () => {
    expect(validateReviewSubmission({ reviewId: 'r1', action: 'invalid' })).toBeNull();
    expect(validateReviewSubmission({ action: 'approve' })).toBeNull();
  });

  it('accepts valid review submission', () => {
    const sub = validateReviewSubmission({
      reviewId: 'review-uuid',
      action: 'request_revision',
      notes: 'Adjust hero framing',
    });
    expect(sub?.action).toBe('request_revision');
  });

  it('maps lifecycle to client-safe status', () => {
    expect(mapLifecycleToExternalStatus('production', 'draft', false, false)).toBe('production_started');
    expect(mapLifecycleToExternalStatus('brief', 'draft', true, false)).toBe('review_ready');
    expect(mapLifecycleToExternalStatus('delivered', 'approved', false, true)).toBe('deliverable_ready');
  });
});

describe('External contract v1 — authentication', () => {
  beforeEach(() => {
    process.env.STUDIO_WORLD_EXTERNAL_API_SECRET = TEST_SECRET;
  });

  afterEach(() => {
    delete process.env.STUDIO_WORLD_EXTERNAL_API_SECRET;
  });

  it('resolves known external systems to org', () => {
    expect(resolveOrgForExternalSystem('studio-world-test')).toBe('frontal-slayer');
    expect(resolveOrgForExternalSystem('unknown-consumer')).toBeNull();
  });

  it('rejects missing auth headers', () => {
    const result = verifyExternalRequest(mockRequest({}), '{}');
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.code).toBe('AUTH_REQUIRED');
    }
  });

  it('rejects unknown external system', () => {
    const body = JSON.stringify({ externalEngagementId: 'e1' });
    const headers = signExternalRequestForTest('unknown-system', body);
    const result = verifyExternalRequest(mockRequest(headers), body);
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.code).toBe('UNKNOWN_SYSTEM');
  });

  it('accepts valid HMAC signature', () => {
    const body = JSON.stringify({
      externalSystem: 'studio-world-test',
      externalEngagementId: 'eng-dup-test',
    });
    const headers = signExternalRequestForTest('studio-world-test', body);
    const result = verifyExternalRequest(mockRequest(headers), body);
    expect('externalSystem' in result).toBe(true);
    if ('externalSystem' in result) {
      expect(result.orgId).toBe('frontal-slayer');
      expect(result.externalSystem).toBe('studio-world-test');
    }
  });

  it('rejects tampered body', () => {
    const body = JSON.stringify({ externalEngagementId: 'eng-1' });
    const headers = signExternalRequestForTest('studio-world-test', body);
    const result = verifyExternalRequest(
      mockRequest(headers),
      JSON.stringify({ externalEngagementId: 'eng-2' })
    );
    expect('error' in result).toBe(true);
    if ('error' in result) expect(result.code).toBe('INVALID_SIGNATURE');
  });

  it('uses contract version constant', () => {
    expect(EXTERNAL_CONTRACT_VERSION).toBe('v1');
  });
});

describe('External contract v1 — idempotency key shape', () => {
  it('stable identity is externalSystem + externalEngagementId', () => {
    const a = validateProvisionRequest({
      externalSystem: 'studio-world-test',
      externalEngagementId: 'same-engagement',
    });
    const b = validateProvisionRequest({
      externalSystem: 'studio-world-test',
      externalEngagementId: 'same-engagement',
    });
    expect(a?.externalSystem).toBe(b?.externalSystem);
    expect(a?.externalEngagementId).toBe(b?.externalEngagementId);
  });
});
