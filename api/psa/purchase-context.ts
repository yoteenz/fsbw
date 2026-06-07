/**
 * POST /api/psa/purchase-context — save purchase occasion (Don't Forget Why).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import { addPurchaseContextNote } from '../_lib/psaMemberMemories.js';
import { refreshPsaMemberContext } from '../_lib/psaMemberContext.js';
import { sanitizePsaMemberContextForClient } from '../_lib/psaMemberContextClient.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', code: 'SIGN_IN_REQUIRED' });
  }

  const premium = await getPsaPremiumProfile(user.id, user.accessToken, user.email);
  if (!premium?.isPremium) {
    return res.status(403).json({ error: 'Premium membership required.', code: 'PREMIUM_REQUIRED' });
  }

  const body = (req.body ?? {}) as {
    occasion?: string;
    monthYear?: string;
    orderNumber?: string;
    unitName?: string;
    unitId?: string;
  };

  const occasion = typeof body.occasion === 'string' ? body.occasion.trim() : '';
  if (!occasion) {
    return res.status(400).json({ error: 'occasion required' });
  }

  await addPurchaseContextNote(user.id, {
    occasion,
    monthYear: typeof body.monthYear === 'string' ? body.monthYear : undefined,
    orderNumber: typeof body.orderNumber === 'string' ? body.orderNumber : undefined,
    unitName: typeof body.unitName === 'string' ? body.unitName : undefined,
    unitId: typeof body.unitId === 'string' ? body.unitId : undefined,
  });

  let memberContext = null;
  try {
    memberContext = await refreshPsaMemberContext({
      userId: user.id,
      accessToken: user.accessToken,
      premium,
    });
  } catch (err) {
    console.warn('[psa/purchase-context] context refresh', err);
  }

  return res.status(200).json({
    ok: true,
    occasion,
    memberContext: sanitizePsaMemberContextForClient(memberContext),
  });
}
