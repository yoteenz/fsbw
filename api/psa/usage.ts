/**
 * GET /api/psa/usage — remaining PSA chat allowance for the signed-in premium member.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getAuthUser } from '../_lib/auth.js';
import { getPsaPremiumProfile } from '../_lib/psaPremiumCheck.js';
import {
  getPsaEngagementLimits,
  isPsaEngagementUnlimited,
} from '../_lib/psaEngagementLimits.js';
import { getPsaUsage } from '../_lib/psaUsageLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.status(204).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const user = await getAuthUser(req);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized', code: 'SIGN_IN_REQUIRED' });
  }

  const premium = await getPsaPremiumProfile(user.id, user.accessToken, user.email);
  if (!premium?.isPremium) {
    return res.status(403).json({
      error: 'Premium membership required for PSA.',
      code: 'PREMIUM_REQUIRED',
    });
  }

  const limits = getPsaEngagementLimits(premium);
  const unlimited = isPsaEngagementUnlimited(user.email);
  const usage = unlimited
    ? {
        monthKey: '',
        dayKey: '',
        monthCount: 0,
        monthLimit: limits.monthlyLimit,
        dayCount: 0,
        dayLimit: limits.dailyLimit,
        tierKey: limits.tierKey,
        tierLabel: limits.tierLabel,
        unlimited: true,
      }
    : { ...(await getPsaUsage(user.id, limits)), unlimited: false };

  return res.status(200).json({
    usage,
    monthRemaining: Math.max(0, usage.monthLimit - usage.monthCount),
    dayRemaining: Math.max(0, usage.dayLimit - usage.dayCount),
  });
}
