export const RESIDENT_LIFE_OS_VERSION = 'foundation2-v1';

export const STUDIO_WORLD_DEFAULT_WORLD_ID = 'studio-world-hq-v1';

export const STUDIO_WORLD_DEFAULT_ORG_SLUG = 'frontal-slayer';

/** Founder-gated action categories — simulation must not execute without authority. */
export const FOUNDER_GATED_ACTION_KINDS = [
  'SPEND_MONEY',
  'PUBLIC_PUBLISH',
  'MAJOR_BRAND_CHANGE',
  'HIRE_HUMAN',
  'FIRE_HUMAN',
  'LEGAL_COMMITMENT',
  'SECURITY_CHANGE',
  'HIGH_RISK_COMPLIANCE',
  'BILLING_CHANGE',
  'EXTERNAL_CONTRACT',
  'LIVE_INFRA_CHANGE',
] as const;
