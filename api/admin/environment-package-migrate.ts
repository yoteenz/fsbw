export const config = { maxDuration: 60 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { assertPackagePersistenceAvailable } from '../_lib/environmentPackage/config.js';
import { probeEnvironmentPackageTables } from '../_lib/environmentPackage/persistence.js';
import { migrateExperienceLabReceptionPackages } from '../_lib/environmentPackage/migration.js';

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

/** POST /api/admin/environment-package-migrate */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ ok: false, error, code });
  }

  const persistence = assertPackagePersistenceAvailable();
  if (!persistence.ok) {
    return res.status(503).json({ ok: false, error: persistence.message, code: persistence.code });
  }

  const tablesOk = await probeEnvironmentPackageTables();
  if (!tablesOk) {
    return res.status(503).json({ ok: false, error: 'Environment package tables missing', code: 'MIGRATION_REQUIRED' });
  }

  const body = parseBody(req);
  const lightPreviewUrl = String(body?.lightPreviewUrl ?? '').trim();
  const darkPreviewUrl = String(body?.darkPreviewUrl ?? '').trim();
  if (!lightPreviewUrl || !darkPreviewUrl) {
    return res.status(400).json({ ok: false, error: 'Preview URLs required', code: 'MISSING_PREVIEW_URLS' });
  }

  const result = await migrateExperienceLabReceptionPackages({ lightPreviewUrl, darkPreviewUrl });
  return res.status(200).json({ ok: true, ...result });
}
