/**
 * GET /api/hairstyle-analysis-usage — monthly allowance for premium subscribers.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAdminEmail } from './_lib/adminAuth.js';
import { getAuthUser } from './_lib/auth.js';
import { resolveHairstyleAnalysisEntitlement } from './_lib/hairstyleAnalysisEntitlement.js';
import { getPsaPremiumProfile } from './_lib/psaPremiumCheck.js';
import { getHairstyleAnalysisUsage } from './_lib/hairstyleAnalysisUsage.js';

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

  const user = await getAuthUser(req);
  if (!user?.id) {
    res.status(401).json({ error: 'Sign in required', code: 'SIGN_IN_REQUIRED' });
    return;
  }

  const premium = await getPsaPremiumProfile(user.id, user.accessToken, user.email);
  const entitlement = resolveHairstyleAnalysisEntitlement(premium, user.email);
  const isAdmin = isAdminEmail(user.email);

  if (!entitlement.eligible && !isAdmin) {
    res.status(200).json({
      eligible: false,
      analysisTier: null,
      templateUrl: null,
      subscriptionTier: entitlement.subscriptionTier,
      unlimited: false,
      usage: {
        monthKey: '',
        monthCount: 0,
        monthLimit: entitlement.monthlyLimit,
        monthRemaining: 0,
      },
    });
    return;
  }

  const usage = entitlement.unlimited
    ? {
        monthKey: '',
        monthCount: 0,
        monthLimit: entitlement.monthlyLimit,
        monthRemaining: entitlement.monthlyLimit,
      }
    : await getHairstyleAnalysisUsage(user.id);

  res.status(200).json({
    eligible: true,
    analysisTier: entitlement.analysisTier,
    templateUrl: entitlement.templateUrl,
    subscriptionTier: entitlement.subscriptionTier,
    unlimited: entitlement.unlimited,
    usage,
    monthRemaining: entitlement.unlimited ? entitlement.monthlyLimit : usage.monthRemaining,
  });
}
