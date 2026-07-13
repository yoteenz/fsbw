export const config = {
  maxDuration: 30,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { assertCanonicalGenerationRequest } from '../_lib/studioWorldAdminAccess.js';
import {
  planCanonicalDepartmentGeneration,
  planCanonicalBatchGeneration,
  listCanonicalDepartmentTree,
  listMissingCanonicalDepartments,
  CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY,
} from '../../src/studio-os-core/canonical-studio-world/canonical-department-generation.js';
import type { CanonicalMainDepartmentId } from '../../src/studio-os-core/canonical-studio-world/canonical-department-registry.js';

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
 * POST /api/admin/canonical-department-generation
 * Server-enforced canonical Studio World department generation (admin only).
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    return res.status(auth.failure.status).json({ error: auth.failure.error, code: auth.failure.code });
  }

  const email = auth.user.email;

  if (req.method === 'GET') {
    const access = assertCanonicalGenerationRequest({ email, operation: 'list' });
    if (!access.ok) return res.status(403).json({ ok: false, code: access.code, message: access.message });

    return res.status(200).json({
      ok: true,
      registryVersion: 'canonical-department-registry.v1',
      departmentCount: CANONICAL_STUDIO_WORLD_DEPARTMENT_REGISTRY.length,
      tree: listCanonicalDepartmentTree(),
      missing: listMissingCanonicalDepartments().map((d) => d.departmentId),
    });
  }

  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const body = parseBody(req) ?? {};
  const action = String(body.action ?? 'plan').trim();
  const organizationId = body.organizationId != null ? String(body.organizationId) : null;

  const access = assertCanonicalGenerationRequest({
    email,
    operation: action === 'batch' ? 'batch' : 'generate',
    organizationId,
  });
  if (!access.ok) return res.status(403).json({ ok: false, code: access.code, message: access.message });

  if (action === 'batch') {
    const departmentIds = Array.isArray(body.departmentIds)
      ? (body.departmentIds as string[]).filter(Boolean)
      : listMissingCanonicalDepartments().map((d) => d.departmentId);
    const confirmed = Boolean(body.confirmed);
    const plan = planCanonicalBatchGeneration({
      departmentIds: departmentIds as CanonicalMainDepartmentId[],
      confirmed,
    });
    if ('ok' in plan && plan.ok === false) {
      return res.status(400).json(plan);
    }
    return res.status(200).json({ ok: true, plan });
  }

  const departmentId = String(body.departmentId ?? '').trim() as CanonicalMainDepartmentId;
  if (!departmentId) {
    return res.status(400).json({ ok: false, code: 'MISSING_DEPARTMENT_ID', message: 'departmentId is required.' });
  }

  const plan = planCanonicalDepartmentGeneration(departmentId);
  if (!plan.ok) {
    return res.status(plan.code === 'EXPERIENCE_LAB_ADMIN_ONLY' ? 403 : 400).json(plan);
  }

  return res.status(200).json({ ok: true, plan });
}
