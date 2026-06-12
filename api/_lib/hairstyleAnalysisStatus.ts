import { isAdminEmail } from './adminAuth.js';
import { resolveHairstyleAnalysisEntitlement } from './hairstyleAnalysisEntitlement.js';
import {
  getHairstyleAnalysisUsage,
  hairstyleAnalysisPurchaseOptions,
} from './hairstyleAnalysisUsage.js';
import type { PsaPremiumProfile } from './psaPremiumCheck.js';

export async function buildHairstyleAnalysisMemberStatus(
  userId: string,
  premium: PsaPremiumProfile | null | undefined,
  email?: string | null
) {
  const entitlement = resolveHairstyleAnalysisEntitlement(premium, email);
  const isAdmin = isAdminEmail(email);

  if (!entitlement.eligible && !isAdmin) {
    return {
      eligible: false,
      subscriptionTier: entitlement.subscriptionTier,
      analysisTier: null,
      unlimited: false,
      monthRemaining: 0,
      paidCreditsRemaining: 0,
      canGenerate: false,
      purchaseRequired: false,
      purchaseOptions: hairstyleAnalysisPurchaseOptions(),
      guidance:
        'Hairstyle analysis template cards require a 3, 6, or 12 month premium subscription.',
    };
  }

  if (entitlement.unlimited || isAdmin) {
    return {
      eligible: true,
      subscriptionTier: entitlement.subscriptionTier,
      analysisTier: entitlement.analysisTier,
      unlimited: true,
      monthRemaining: entitlement.monthlyLimit,
      paidCreditsRemaining: 0,
      canGenerate: true,
      purchaseRequired: false,
      purchaseOptions: hairstyleAnalysisPurchaseOptions(),
      guidance: 'Admin or unlimited test access.',
    };
  }

  const usage = await getHairstyleAnalysisUsage(userId);
  const purchaseRequired = !usage.canGenerate;

  return {
    eligible: true,
    subscriptionTier: entitlement.subscriptionTier,
    analysisTier: entitlement.analysisTier,
    unlimited: false,
    monthRemaining: usage.monthRemaining,
    paidCreditsRemaining: usage.paidCreditsRemaining,
    canGenerate: usage.canGenerate,
    purchaseRequired,
    purchaseOptions: hairstyleAnalysisPurchaseOptions(),
    guidance: purchaseRequired
      ? 'Monthly free analysis used. Offer purchase at consult style analysis add-on prices: 1 comparison $20, 3 comparisons $40, 6 comparisons $60. Use purchase_hairstyle_analysis then send them to checkout.'
      : usage.monthRemaining > 0
        ? `${usage.monthRemaining} free hairstyle analysis remaining this UTC month.`
        : `${usage.paidCreditsRemaining} paid hairstyle analysis credit(s) available.`,
  };
}
