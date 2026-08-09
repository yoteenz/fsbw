/**
 * Care Guide vs Care Mastery entitlement policy.
 *
 * Qualifying hair purchases grant applicable **Care Guides** (owner support) —
 * NOT Care Mastery (paid PSA Today education), NOT generic Slay Ticket bonuses.
 *
 * Existing complimentary season passes and historical ticket balances are preserved.
 */
export const QUALIFYING_PRODUCT_GRANTS_FULL_CARE_SEASON_PASS = false;

export const QUALIFYING_PRODUCT_USES_RULE_BASED_CARE_GUIDES = true;

/** Care Mastery is never auto-unlocked from product ownership under current policy. */
export const QUALIFYING_PRODUCT_GRANTS_CARE_MASTERY = false;

/** Care-of-result vs paid-mastery boundary (documentation constant for tooling). */
export const CARE_GUIDE_VS_MASTERY_BOUNDARY = {
  careGuide: 'HOW TO PROTECT WHAT THE CUSTOMER PURCHASED',
  careMastery: 'HOW TO PERFORM NEW TECHNIQUES / TRANSFORMATIONS / SKILLS',
} as const;

/** @deprecated Use CARE_GUIDE_VS_MASTERY_BOUNDARY */
export const CARE_VS_MASTERY_BOUNDARY = {
  complimentary: CARE_GUIDE_VS_MASTERY_BOUNDARY.careGuide,
  paidMastery: CARE_GUIDE_VS_MASTERY_BOUNDARY.careMastery,
} as const;

export const PRODUCT_CARE_ENTITLEMENT_MIGRATION_NOTE =
  'Prospective-only: qualifying hair purchases unlock rule-based Care Guides instead of generic Slay Ticket earning or Care Mastery. Historical ticket balances and prior season passes are preserved.';

/**
 * Refund / revocation: when care_purchase_entitlements.status becomes revoked/refunded,
 * resolveCareGuideEntitlementsFromProfiles excludes inactive units — Library entries
 * should reflect locked state on next sync. Historical watch progress is retained locally.
 */
export const CARE_GUIDE_REFUND_BEHAVIOR =
  'Revoked qualifying purchases remove Care Guide entitlements on next resolver sync; local progress may remain for audit but access gates deny playback.';
