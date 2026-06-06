export const config = {
  maxDuration: 10,
};

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from './_lib/auth.js';

/**
 * Shoppers must use **pre-generated** try-on overlays from Supabase Storage.
 * Generation runs in **Admin → Backend → LIVE TRY-ON** (founder) or CLI batch — not on open.
 */
export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const user = await getAuthUser(req);
  if (!user) {
    res.status(401).json({ error: 'Sign in required' });
    return;
  }

  res.status(410).json({
    error: 'TRYON_PRE_GENERATED_ONLY',
    message:
      'Live try-on layers are prepared in studio ahead of time. If you see this, your color may not be batch-generated yet — check back soon or contact support.',
  });
}
