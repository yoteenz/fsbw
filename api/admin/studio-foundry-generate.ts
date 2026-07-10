export const config = {
  maxDuration: 120,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { adaptLegacyFoundryRequest } from '../_lib/creativeProduction/legacy-adapters.js';
import { executeGovernedGeneration } from '../_lib/creativeProduction/generation-gateway.js';

function parseBody(req: VercelRequest): Record<string, unknown> | null {
  if (typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)) {
    return req.body as Record<string, unknown>;
  }
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      const o = JSON.parse(req.body) as unknown;
      if (o && typeof o === 'object' && !Array.isArray(o)) return o as Record<string, unknown>;
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * POST /api/admin/studio-foundry-generate
 * Governed Studio Foundry™ generation — routes through Creative Production Gateway™.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ error, code });
  }

  const body = parseBody(req);
  const slug = String(body?.slug || '').trim();
  if (!slug) return res.status(400).json({ ok: false, error: 'Missing slug' });

  const adapted = adaptLegacyFoundryRequest(body ?? {}, '/api/admin/studio-foundry-generate');
  if ('error' in adapted) {
    return res.status(adapted.code === 'AUTH_REQUIRED' ? 403 : 400).json({
      ok: false,
      code: adapted.code,
      error: adapted.error,
    });
  }

  const result = await executeGovernedGeneration(adapted, {
    sourceRoute: '/api/admin/studio-foundry-generate',
  });

  if (!result.ok) {
    const status =
      result.code.startsWith('AUTH_') ? 403 : result.error?.includes('FAL_KEY') ? 503 : 500;
    return res.status(status).json(result);
  }

  return res.status(200).json({
    ok: true,
    publicUrl: result.publicUrl,
    storagePath: result.storagePath,
    model: result.model,
    slug,
    productionAuthorizationId: result.audit.productionAuthorizationId,
    assetRegistryId: result.assetRegistryId,
    audit: result.audit,
    legacyCompat: result.audit.legacyCompat ?? false,
  });
}
