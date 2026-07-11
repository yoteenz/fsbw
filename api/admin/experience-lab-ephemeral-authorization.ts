export const config = {
  maxDuration: 30,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  auditEphemeralAuthEvent,
  issueEphemeralValidationAuthorization,
} from '../_lib/creativeProduction/ephemeral-validation-auth.js';

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
 * POST /api/admin/experience-lab-ephemeral-authorization
 * Issues a compile-scoped ephemeral ProductionAuthorization for Experience Lab validation only.
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

  const body = parseBody(req) ?? {};
  const compileRunId = String(body.compileRunId ?? '').trim();
  const previewSessionId = String(body.previewSessionId ?? '').trim();
  const organizationId = String(body.organizationId ?? body.org_id ?? 'frontal-slayer').trim();
  const departmentId = String(body.departmentId ?? '').trim();
  const stationId = String(body.stationId ?? '').trim();
  const projectId = String(body.projectId ?? '').trim();

  if (!compileRunId || !previewSessionId || !departmentId || !stationId || !projectId) {
    return res.status(400).json({
      ok: false,
      code: 'MISSING_COMPILE_CONTEXT',
      error: 'Missing compileRunId, previewSessionId, departmentId, stationId, or projectId',
    });
  }

  const grant = issueEphemeralValidationAuthorization({
    compileRunId,
    previewSessionId,
    organizationId,
    departmentId,
    stationId,
    projectId,
    actorId: auth.user.id,
    actorEmail: auth.user.email,
  });

  auditEphemeralAuthEvent('issued', {
    productionAuthorizationId: grant.productionAuthorizationId,
    compileRunId: grant.compileRunId,
    previewSessionId: grant.previewSessionId,
    organizationId: grant.organizationId,
    actorEmail: auth.user.email,
    expiresAt: grant.expiresAt,
  });

  return res.status(200).json({ ok: true, grant });
}
