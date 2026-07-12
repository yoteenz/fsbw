export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import { getGovernedGenerationJobStatus } from '../_lib/creativeProduction/async-governed-generation.js';

/**
 * GET /api/admin/studio-generation-status?jobId=
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const auth = await resolveAdminAuth(req);
  if (!auth.ok) {
    const { status, error, code } = auth.failure;
    return res.status(status).json({ ok: false, error, code, errorCategory: 'authorization-failed' });
  }

  const jobId = typeof req.query.jobId === 'string' ? req.query.jobId.trim() : '';
  if (!jobId) {
    return res.status(400).json({ ok: false, error: 'jobId is required', errorCategory: 'client-status-fetch-failed' });
  }

  try {
    const status = await getGovernedGenerationJobStatus(jobId, {
      actorId: auth.user.id,
      orgId: typeof req.query.orgId === 'string' ? req.query.orgId : undefined,
    });
    if (!status) {
      return res.status(404).json({
        ok: false,
        error: 'Job not found or not authorized',
        errorCategory: 'client-status-fetch-failed',
      });
    }
    return res.status(200).json(status);
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Status fetch failed',
      errorCategory: 'client-status-fetch-failed',
    });
  }
}
