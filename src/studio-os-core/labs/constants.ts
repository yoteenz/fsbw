/** Studio OS Labs v1.0 — constants. */

import type { ContentPillar, PublishingPlatform } from './types';

export const LABS_STORAGE_KEY = 'studioOsLabs_v1';
export const LABS_VERSION = '1.0.0';

export const CONTENT_PILLARS: ContentPillar[] = [
  'money',
  'health',
  'psychology',
  'ai',
  'consumer-protection',
  'home',
  'technology',
  'other',
];

export const PILLAR_LABELS: Record<ContentPillar, string> = {
  money: 'MONEY',
  health: 'HEALTH',
  psychology: 'PSYCHOLOGY',
  ai: 'AI',
  'consumer-protection': 'CONSUMER PROTECTION',
  home: 'HOME',
  technology: 'TECHNOLOGY',
  other: 'OTHER',
};

export const PUBLISHING_PLATFORMS: PublishingPlatform[] = [
  'tiktok',
  'instagram-reels',
  'youtube-shorts',
  'youtube-long',
  'facebook',
  'linkedin',
  'twitter',
  'pinterest',
  'snapchat',
  'other',
];

export const PLATFORM_LABELS: Record<PublishingPlatform, string> = {
  tiktok: 'TIKTOK',
  'instagram-reels': 'INSTAGRAM REELS',
  'youtube-shorts': 'YOUTUBE SHORTS',
  'youtube-long': 'YOUTUBE LONG',
  facebook: 'FACEBOOK',
  linkedin: 'LINKEDIN',
  twitter: 'X / TWITTER',
  pinterest: 'PINTEREST',
  snapchat: 'SNAPCHAT',
  other: 'OTHER',
};

export const EXPERIMENT_STATUS_LABELS = {
  active: 'ACTIVE',
  collecting: 'COLLECTING DATA',
  completed: 'COMPLETED',
  promoted: 'PROMOTED',
  archived: 'ARCHIVED',
} as const;

export const PROMOTION_TARGET_LABELS = {
  'creative-dna': 'CREATIVE DNA',
  'writing-bible': 'WRITING BIBLE',
  'company-dna': 'COMPANY DNA',
  'content-templates': 'CONTENT TEMPLATES',
  'thumbnail-templates': 'THUMBNAIL TEMPLATES',
  'hook-library': 'HOOK LIBRARY',
  'automation-rules': 'AUTOMATION RULES',
  'future-campaigns': 'FUTURE CAMPAIGNS',
} as const;

export const DEMO_SERIES_NAMES = [
  'MONEY MYTHS',
  'HEALTH MYTHS',
  'AI TOOLS',
  'CREDIT SECRETS',
  'PSYCHOLOGY FACTS',
] as const;

export const MIN_DATA_COLLECTION_DAYS = 7;
