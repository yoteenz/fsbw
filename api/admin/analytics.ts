import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../_lib/adminAuth';

/** GET /api/admin/analytics – analytics summary (admin only). Server has no storage yet; returns empty. */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const admin = await requireAdmin(req);
  if (!admin) return res.status(403).json({ error: 'Forbidden' });

  return res.status(200).json({
    total: 0,
    bySource: { menu: 0, more_ways_to_earn: 0 },
    byPlatform: { instagram: 0, twitter: 0, facebook: 0, tiktok: 0 },
    byPlatformAndSource: {
      instagram: { menu: 0, more_ways_to_earn: 0 },
      twitter: { menu: 0, more_ways_to_earn: 0 },
      facebook: { menu: 0, more_ways_to_earn: 0 },
      tiktok: { menu: 0, more_ways_to_earn: 0 },
    },
  });
}
