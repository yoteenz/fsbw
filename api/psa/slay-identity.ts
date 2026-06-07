/**
 * POST /api/psa/slay-identity — save Slay Archetype from quiz (premium members).
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import { setSlayArchetype } from '../_lib/psaMemberMemories.js';
import { refreshPsaMemberContext } from '../_lib/psaMemberContext.js';
import { sanitizePsaMemberContextForClient } from '../_lib/psaMemberContextClient.js';
import { ARCHETYPE_DNA_HINTS } from '../_lib/psaSlayArchetype.js';

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

  const body = (req.body ?? {}) as { archetype?: string };
  const archetype = typeof body.archetype === 'string' ? body.archetype.trim() : '';
  if (!archetype) {
    return res.status(400).json({ error: 'archetype required' });
  }

  const saved = await setSlayArchetype(user.id, archetype);
  if (!saved) {
    return res.status(400).json({ error: 'Invalid archetype' });
  }

  let memberContext = null;
  try {
    memberContext = await refreshPsaMemberContext({
      userId: user.id,
      accessToken: user.accessToken,
      premium,
    });
  } catch (err) {
    console.warn('[psa/slay-identity] context refresh', err);
  }

  const hints = ARCHETYPE_DNA_HINTS[saved];
  return res.status(200).json({
    ok: true,
    slayArchetype: saved,
    recommendedUnits: hints.recommendedUnits,
    vibeLine: hints.vibeLine,
    memberContext: sanitizePsaMemberContextForClient(memberContext),
  });
}
