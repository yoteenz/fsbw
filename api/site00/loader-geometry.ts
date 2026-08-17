import type { VercelRequest, VercelResponse } from '@vercel/node';
import { resolveProductionAsset } from '../_lib/site00Assts/slots.js';
import { LOADER_GEOMETRY_PRODUCTION_SLOT } from '../_lib/site00Assts/postProcess/types.js';

/**
 * Public read-only resolver for SITE 00 loader geometry production slot.
 * Boot-critical loader may fall back to same-origin static alpha when slot is locked.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=300');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const slotKey = String(req.query.slot ?? LOADER_GEOMETRY_PRODUCTION_SLOT).trim();
    const resolved = await resolveProductionAsset(slotKey);
    const hasLockedAlpha = resolved.source === 'locked' && Boolean(resolved.url);

    return res.status(200).json({
      ok: true,
      slotKey,
      mode: hasLockedAlpha ? 'alpha' : 'screen',
      resolved,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return res.status(500).json({ ok: false, error: message, mode: 'screen' });
  }
}
