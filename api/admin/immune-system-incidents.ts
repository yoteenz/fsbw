export const config = { maxDuration: 15 };

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveAdminAuth } from '../_lib/adminAuth.js';
import {
  listIncidents,
  redactIncidentForExport,
} from '../../src/studio-os-core/immune-system/incident-recorder.js';

/**
 * GET /api/admin/immune-system-incidents
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
    return res.status(status).json({ ok: false, error, code });
  }

  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 20));
  const incidents = listIncidents(limit).map(redactIncidentForExport);
  return res.status(200).json({ ok: true, incidents, count: incidents.length });
}
