/**
 * External API authentication — HMAC v1.
 * External systems authenticate with X-Studio-World-System + X-Studio-World-Signature.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import type { VercelRequest } from '@vercel/node';

export type ExternalAuthContext = {
  externalSystem: string;
  orgId: string;
};

function externalSecret(): string {
  const secret = process.env.STUDIO_WORLD_EXTERNAL_API_SECRET?.trim();
  if (!secret) {
    throw new Error('STUDIO_WORLD_EXTERNAL_API_NOT_CONFIGURED');
  }
  return secret;
}

/** Map external system id → org_id (tenant). Extend without hardcoding SITE 00. */
export function resolveOrgForExternalSystem(externalSystem: string): string | null {
  const normalized = externalSystem.trim().toLowerCase();
  const map: Record<string, string> = {
    'frontal-slayer': 'frontal-slayer',
    'fs-internal': 'frontal-slayer',
    'studio-world-test': 'frontal-slayer',
  };
  return map[normalized] ?? null;
}

function buildSignaturePayload(system: string, timestamp: string, body: string): string {
  return `${system}.${timestamp}.${body}`;
}

export function verifyExternalRequest(
  req: VercelRequest,
  rawBody: string
): ExternalAuthContext | { error: string; code: string; status: number } {
  try {
    externalSecret();
  } catch {
    return { error: 'External API not configured', code: 'EXTERNAL_API_NOT_CONFIGURED', status: 503 };
  }

  const system = (req.headers['x-studio-world-system'] as string | undefined)?.trim();
  const timestamp = (req.headers['x-studio-world-timestamp'] as string | undefined)?.trim();
  const signature = (req.headers['x-studio-world-signature'] as string | undefined)?.trim();

  if (!system || !timestamp || !signature) {
    return { error: 'Missing authentication headers', code: 'AUTH_REQUIRED', status: 401 };
  }

  const orgId = resolveOrgForExternalSystem(system);
  if (!orgId) {
    return { error: 'Unknown external system', code: 'UNKNOWN_SYSTEM', status: 403 };
  }

  const ts = Number(timestamp);
  if (!Number.isFinite(ts) || Math.abs(Date.now() - ts) > 5 * 60 * 1000) {
    return { error: 'Request timestamp expired', code: 'TIMESTAMP_EXPIRED', status: 401 };
  }

  const expected = createHmac('sha256', externalSecret())
    .update(buildSignaturePayload(system, timestamp, rawBody))
    .digest('hex');

  try {
    const a = Buffer.from(signature, 'utf8');
    const b = Buffer.from(expected, 'utf8');
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      return { error: 'Invalid signature', code: 'INVALID_SIGNATURE', status: 401 };
    }
  } catch {
    return { error: 'Invalid signature', code: 'INVALID_SIGNATURE', status: 401 };
  }

  return { externalSystem: system, orgId };
}

export function signExternalRequestForTest(
  system: string,
  body: string,
  timestamp = Date.now()
): Record<string, string> {
  const ts = String(timestamp);
  const signature = createHmac('sha256', externalSecret())
    .update(buildSignaturePayload(system, ts, body))
    .digest('hex');
  return {
    'X-Studio-World-System': system,
    'X-Studio-World-Timestamp': ts,
    'X-Studio-World-Signature': signature,
  };
}
