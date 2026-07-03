/** AI Studio demo config — generation form options (no AI backend). */

export const ADMIN_STUDIO_AI_PROMPT_PLACEHOLDER = 'WHAT DO YOU WANT TO CREATE TODAY?';

export const ADMIN_STUDIO_AI_PROMPT_EXAMPLE = 'CHERRY RED WILL TREND THIS FALL.';

export const ADMIN_STUDIO_AI_AUDIENCE_OPTIONS = [
  'ALL MEMBERS',
  'PREMIUM LOUNGE',
  'BLACK TIER',
  'NEW MEMBERS',
  'COLOR-CURIOUS SLAYERS',
  'INSTALL PROS',
] as const;

export const ADMIN_STUDIO_AI_MEMBERSHIP_TIER_OPTIONS = [
  'ALL MEMBERS',
  'PREMIUM',
  'BLACK',
  'PUBLIC + MEMBERS',
] as const;

export const ADMIN_STUDIO_AI_FEATURED_PRODUCTS = [
  'NOIR — OFF BLACK BASE',
  'SOFT WAVE — MOVEMENT TEXTURE',
  'BLANCO — PLATINUM BLONDE',
  'BEACH WAVE — SUMMER TEXTURE',
  'LACE SCISSORS KIT',
  'SLAY TICKETS BUNDLE',
] as const;

export const ADMIN_STUDIO_AI_REWARD_OPTIONS = [
  'SLAY CHALLENGE CHECK-IN',
  'MEMBER SPOTLIGHT',
  'BONUS SLAY TICKETS',
  'COURSE COMPLETION GIFT',
  'EARLY ACCESS DROP',
  'NONE',
] as const;

export const ADMIN_STUDIO_AI_DISTRIBUTION_TARGETS = [
  'LOUNGE TV',
  'EMAIL',
  'INSTAGRAM',
  'TIKTOK',
  'PINTEREST',
  'PUSH NOTIFICATIONS',
  'PSA CONCIERGE',
  'SHOP PDP',
] as const;

export const ADMIN_STUDIO_AI_DESIRED_OUTPUTS = [
  'LOUNGE TV EPISODE',
  'JOURNAL',
  'EMAIL',
  'INSTAGRAM CAROUSEL',
  'INSTAGRAM REEL',
  'TIKTOK',
  'PINTEREST',
  'PUSH NOTIFICATION',
  'THUMBNAIL',
  'PSA KNOWLEDGE',
] as const;

export type AdminStudioAiDesiredOutput = (typeof ADMIN_STUDIO_AI_DESIRED_OUTPUTS)[number];

export const ADMIN_STUDIO_AI_PIPELINE_STEPS = [
  { id: 'research', label: 'RESEARCH' },
  { id: 'outline', label: 'OUTLINE' },
  { id: 'script', label: 'SCRIPT' },
  { id: 'scene-prompts', label: 'SCENE PROMPTS' },
  { id: 'images', label: 'IMAGES' },
  { id: 'video', label: 'VIDEO' },
  { id: 'journal', label: 'JOURNAL' },
  { id: 'email', label: 'EMAIL' },
  { id: 'social', label: 'SOCIAL' },
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'packaging', label: 'PACKAGING' },
  { id: 'draft-complete', label: 'DRAFT COMPLETE' },
] as const;

export type AdminStudioAiPipelineStepId = (typeof ADMIN_STUDIO_AI_PIPELINE_STEPS)[number]['id'];

export type AdminStudioAiFormState = {
  prompt: string;
  showId: string;
  audience: string;
  membershipTier: string;
  featuredProducts: string[];
  reward: string;
  publishDate: string;
  distributionTargets: string[];
  desiredOutputs: string[];
};

export const ADMIN_STUDIO_AI_DEFAULT_FORM: AdminStudioAiFormState = {
  prompt: '',
  showId: 'the-slay-report',
  audience: 'ALL MEMBERS',
  membershipTier: 'ALL MEMBERS',
  featuredProducts: ['NOIR — OFF BLACK BASE', 'SOFT WAVE — MOVEMENT TEXTURE'],
  reward: 'SLAY CHALLENGE CHECK-IN',
  publishDate: '2026-10-15 · FRIDAY 7PM ET',
  distributionTargets: ['LOUNGE TV', 'EMAIL', 'INSTAGRAM', 'TIKTOK'],
  desiredOutputs: [
    'LOUNGE TV EPISODE',
    'JOURNAL',
    'EMAIL',
    'INSTAGRAM CAROUSEL',
    'THUMBNAIL',
    'PSA KNOWLEDGE',
  ],
};
