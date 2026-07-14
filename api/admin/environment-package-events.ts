export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  getLatestPackageEventSequence,
  listPackageAuditEvents,
} from '../_lib/environmentPackage/persistence.js';

/** GET /api/admin/environment-package-events?packageId=...&afterSequence=0 */
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

  const afterSequence = Number(req.query.afterSequence ?? 0);
  const limit = Math.min(Number(req.query.limit ?? 200), 500);

  const [rows, latestSequence] = await Promise.all([
    listPackageAuditEvents(packageId, afterSequence, limit),
    getLatestPackageEventSequence(packageId),
  ]);

  return res.status(200).json({
    ok: true,
    packageId,
    afterSequence,
    latestSequence,
    events: rows,
    count: rows.length,
  });
}
