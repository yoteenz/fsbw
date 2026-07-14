export const config = { maxDuration: 60 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { approvePackageForProductionServer } from '../_lib/environmentPackage/package-orchestration.js';
import { runPackageWorkerTick } from '../_lib/environmentPackage/package-orchestration.js';

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

/** POST /api/admin/environment-package-approve */
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

  const body = parseBody(req);
  const packageId = String(body?.packageId ?? '').trim();
  const acceptEstimate = body?.acceptEstimate === true;
  if (!packageId) {
    return res.status(400).json({ ok: false, error: 'packageId required', code: 'MISSING_PACKAGE_ID' });
  }

  const result = await approvePackageForProductionServer({
    packageId,
    approvedBy: auth.user.email,
    acceptEstimate,
  });

  if (!result.ok) {
    return res.status(422).json({ ok: false, error: result.message, code: result.code });
  }

  await runPackageWorkerTick(packageId);

  return res.status(202).json({
    ok: true,
    approvalId: result.approvalId,
    parentJobId: result.parentJobId,
    estimate: result.estimate,
    status: 'generating',
  });
}
