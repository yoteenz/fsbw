import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth.js';
import { liveTryOnNoirBatchManifest } from '../_lib/liveTryOnBatchManifest.js';

export const config = { maxDuration: 30 };

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const admin = await requireAdmin(req);
  if (!admin) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  res.status(200).json({
    ok: true,
    rows: liveTryOnNoirBatchManifest(),
    note: 'Pre-generate color WebPs (BAW live color) then portrait + overlay steps per row. Shoppers load from Storage only.',
  });
}
