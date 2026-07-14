export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getPackageStatusServer } from '../_lib/environmentPackage/package-orchestration.js';

/** GET /api/admin/environment-package-status?packageId=... */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ ok: false, error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ ok: false, error, code });
  }

  const packageId = String(req.query.packageId ?? '').trim();
  if (!packageId) {
    return res.status(400).json({ ok: false, error: 'packageId required', code: 'MISSING_PACKAGE_ID' });
  }

  const status = await getPackageStatusServer(packageId);
  if (!status.ok) {
    return res.status(404).json({ ok: false, error: status.message, code: status.code });
  }

  return res.status(200).json({ ok: true, ...status });
}
