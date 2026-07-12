/**
 * Production Authorization HMAC signing — server only.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { ProductionAuthorization } from '../../../src/studio-os-core/creative-production/types.js';
import { buildAuthorizationPayloadForSigning } from './studio-os-server.js';

function signingSecret(): string {
  const explicit = process.env.CREATIVE_PRODUCTION_AUTH_SECRET?.trim();
  if (explicit) return explicit;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (service) return service.slice(0, 64);
  return 'creative-production-phase1-dev-secret';
}

export function signProductionAuthorization(
  payload: Omit<ProductionAuthorization, 'signature'>
): ProductionAuthorization {
  const body = buildAuthorizationPayloadForSigning(payload);
  const signature = createHmac('sha256', signingSecret()).update(body).digest('hex');
  return { ...payload, signature };
}

export function verifyProductionAuthorizationSignature(
  authorization: ProductionAuthorization
): boolean {
  const { signature: _ignored, ...unsigned } = authorization;
  const expected = signProductionAuthorization(unsigned).signature;
  try {
    const a = Buffer.from(authorization.signature, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function issueDemoProductionAuthorization(
  payload: Omit<ProductionAuthorization, 'signature'>
): ProductionAuthorization {
  return signProductionAuthorization(payload);
}
