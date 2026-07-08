/** Studio Exchange™ — professional economy foundation (ARTICLE-E05). */

export const STUDIO_EXCHANGE_ENGINE_VERSION = '1.0.0';
export const STUDIO_EXCHANGE_STORAGE_KEY = 'studioExchange_v1';
export const STUDIO_EXCHANGE_UPDATED_EVENT = 'studio-exchange-updated';

export const EXCHANGE_ASSET_CLASSES = [
  'professional-license',
  'career-expansion',
  'certification',
  'mentorship',
  'legacy-business',
  'knowledge',
  'hero-object',
  'opportunity',
  'headquarters-package',
  'living-set',
] as const;

export const LICENSE_STATUSES = [
  'draft',
  'pending',
  'active',
  'suspended',
  'renewal-required',
  'expired',
  'revoked',
] as const;

export const CEREMONY_STAGES = [
  'graduation-stage',
  'mentor-dialogue',
  'crystal-credential',
  'community-celebration',
  'achievement-recording',
  'professional-memory',
] as const;
