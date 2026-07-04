import type { VisionModeKind } from './types';

export const VISION_ENGINE_VERSION = '1.0';
export const VISION_ENGINE_STORAGE_KEY = 'studioOs_visionEngine_v1';

export const VISION_SESSION_KEY = 'studioOs_visionSession_v1';
export const VISION_PARTNER_KEY = 'studioOs_visionPartner_v1';
export const VISION_RECORD_KEY = 'studioOs_visionRecord_v1';
export const VISION_AUDIO_KEY = 'studioOs_visionAudio_v1';
export const VISION_SHARE_SESSION_KEY = 'studioOs_visionShareSession_v1';
export const VISION_CHANGED_EVENT = 'studioOsVisionChanged';

export const VISION_DEFAULT_DWELL_MS = 7000;
export const VISION_SLOW_DWELL_MS = 8500;
export const VISION_OPENING_MS = 9000;
export const VISION_ENDING_HOLD_MS = 5000;

export const VISION_MODE_LABELS: Record<VisionModeKind, string> = {
  'creative-partner': 'Creative Partner',
  investor: 'Investor',
  'brand-story': 'Brand Story',
  'product-showcase': 'Product Showcase',
  'product-launch': 'Product Launch',
  'employee-onboarding': 'Employee Onboarding',
  'agency-presentation': 'Agency Presentation',
  'press-tour': 'Press Tour',
  'sales-demo': 'Sales Demo',
  'franchise-demo': 'Franchise Demo',
  'self-guided': 'Self Guided',
};

export const VISION_ENGINE_ROLES = [
  'owner',
  'administrator',
  'creative-director',
  'marketing',
  'investor-relations',
  'internal-team',
] as const;
