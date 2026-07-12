export const config = { maxDuration: 30 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  advanceGovernedGenerationJob,
  isWorkerSecretValid,
} from '../_lib/creativeProduction/async-governed-generation.js';

/**
 * POST /api/admin/studio-generation-worker
 * Best-effort background advance for async governed generation jobs.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Studio-Generation-Worker-Secret');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  if (!isWorkerSecretValid(req)) {
    return res.status(403).json({ ok: false, code: 'WORKER_FORBIDDEN', error: 'Invalid worker secret' });
  }

  const body =
    typeof req.body === 'object' && req.body !== null && !Array.isArray(req.body)
      ? (req.body as Record<string, unknown>)
      : {};
  const jobId = typeof body.jobId === 'string' ? body.jobId.trim() : '';
  if (!jobId) return res.status(400).json({ ok: false, error: 'jobId is required' });

  try {
    const status = await advanceGovernedGenerationJob(jobId);
    if (!status) return res.status(404).json({ ok: false, error: 'Job not found' });
    return res.status(200).json({ ok: true, advanced: true, ...status });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : 'Worker advance failed',
      errorCategory: 'provider-status-unavailable',
    });
  }
}
