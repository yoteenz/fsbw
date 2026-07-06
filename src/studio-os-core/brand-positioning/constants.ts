/** Milestone 92 — Official Studio OS Brand Positioning V2.0 */

/** Permanent brand promise — treat with same importance as the Studio OS logo. */
export const STUDIO_OS_OFFICIAL_TAGLINE = 'PRESERVE EXPERTISE. BUILD LEGACY.';

export const STUDIO_OS_BRAND_PHILOSOPHY = [
  'Studio OS is not software. Studio OS is not another AI platform.',
  'Studio OS exists to preserve professional expertise before it is lost and transform that expertise into a lasting organizational legacy.',
  'Before introducing any new feature, ask: Does this preserve expertise? Does this help build legacy?',
] as const;

export type StudioOsBrandSystemId =
  | 'studio-os'
  | 'business-discovery-blueprint'
  | 'profession-brain'
  | 'studio-institute'
  | 'expert-marketplace'
  | 'knowledge-commerce'
  | 'professional-trust-framework'
  | 'organization-genome'
  | 'memory-engine'
  | 'company-health-index'
  | 'succession-mode'
  | 'executive-council'
  | 'expansion-center'
  | 'command-dock'
  | 'organization-inauguration';

/** Contextual voice — complements master tagline; never replaces it. */
export const STUDIO_OS_BRAND_VOICE: Record<StudioOsBrandSystemId, string> = {
  'studio-os': STUDIO_OS_OFFICIAL_TAGLINE,
  'business-discovery-blueprint': 'Today, we begin preserving your expertise.',
  'profession-brain': 'Your expertise is becoming legacy.',
  'studio-institute': 'Learn from expertise. Carry the legacy forward.',
  'expert-marketplace': 'Share expertise. Expand your legacy.',
  'knowledge-commerce': 'Monetize knowledge. Expand your legacy.',
  'professional-trust-framework': 'Guide responsibly. Preserve professional trust.',
  'organization-genome': 'Know who you are. Reflect it everywhere.',
  'memory-engine': 'Remember what worked. Prove it forever.',
  'company-health-index': 'Become healthier. Not simply larger.',
  'succession-mode': 'Preserve expertise. Survive transitions.',
  'executive-council': 'Many minds. One briefing.',
  'expansion-center': 'Grow your organization. Expand your legacy.',
  'command-dock': "Building today's decisions into tomorrow's legacy.",
  'organization-inauguration': 'Your Headquarters is ready. Your legacy begins now.',
};

export function getBrandVoice(systemId: StudioOsBrandSystemId): string {
  return STUDIO_OS_BRAND_VOICE[systemId];
}

/** Display block: master tagline + contextual line for module shells. */
export function formatBrandHeader(systemId: StudioOsBrandSystemId): {
  officialTagline: string;
  contextualVoice: string;
} {
  return {
    officialTagline: STUDIO_OS_OFFICIAL_TAGLINE,
    contextualVoice: STUDIO_OS_BRAND_VOICE[systemId],
  };
}
