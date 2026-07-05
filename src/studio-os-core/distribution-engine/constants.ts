import type { DistributionFormatId, DistributionHierarchyLevel } from './types';

export const DISTRIBUTION_ENGINE_STORAGE_KEY = 'studioOsDistributionEngine_v1';
export const DISTRIBUTION_ENGINE_VERSION = '1.0.0';
export const DISTRIBUTION_ENGINE_ID = 'distribution-engine';

export const DISTRIBUTION_PLATFORM_CHAIN = [
  { level: 'studio-os', label: 'STUDIO OS', description: 'Platform · knowledge compounds · distribution maximizes impact' },
  { level: 'distribution-engine', label: 'DISTRIBUTION ENGINE', description: 'Global nervous system · one asset → many platform experiences' },
  { level: 'knowledge-graph', label: 'INSTITUTIONAL LEARNING', description: 'Every publication strengthens future distribution decisions' },
] as const;

export const DISTRIBUTION_HIERARCHY_CHAIN: { level: DistributionHierarchyLevel; label: string; description: string }[] = [
  { level: 'knowledge-asset', label: 'KNOWLEDGE ASSET', description: 'Unified source of truth · page · video · article' },
  { level: 'campaign', label: 'CAMPAIGN', description: 'Strategic context for distribution' },
  { level: 'distribution-strategy', label: 'DISTRIBUTION STRATEGY', description: 'Founder approves · Studio OS executes' },
  { level: 'channel-selection', label: 'CHANNEL SELECTION', description: 'Where · when · why · confidence' },
  { level: 'platform-adaptation', label: 'PLATFORM ADAPTATION', description: 'Format-specific versions preserving knowledge' },
  { level: 'publishing', label: 'PUBLISHING', description: 'Scheduled · processing · completed' },
  { level: 'audience-engagement', label: 'AUDIENCE ENGAGEMENT', description: 'Reach · retention · interaction' },
  { level: 'performance', label: 'PERFORMANCE', description: 'Operational intelligence · not vanity metrics' },
  { level: 'institutional-learning', label: 'INSTITUTIONAL LEARNING', description: 'Feedback loop · future recommendations' },
];

export const DISTRIBUTION_FORMATS: { id: DistributionFormatId; label: string; channel: string }[] = [
  { id: 'instagram-reel', label: 'INSTAGRAM REEL', channel: 'Instagram' },
  { id: 'tiktok', label: 'TIKTOK', channel: 'TikTok' },
  { id: 'youtube-shorts', label: 'YOUTUBE SHORTS', channel: 'YouTube' },
  { id: 'youtube-long', label: 'YOUTUBE LONG-FORM', channel: 'YouTube' },
  { id: 'facebook', label: 'FACEBOOK', channel: 'Facebook' },
  { id: 'threads', label: 'THREADS', channel: 'Threads' },
  { id: 'x-thread', label: 'X THREAD', channel: 'X' },
  { id: 'linkedin-post', label: 'LINKEDIN POST', channel: 'LinkedIn' },
  { id: 'linkedin-carousel', label: 'LINKEDIN CAROUSEL', channel: 'LinkedIn' },
  { id: 'pinterest-pin', label: 'PINTEREST PIN', channel: 'Pinterest' },
  { id: 'newsletter', label: 'NEWSLETTER', channel: 'Email' },
  { id: 'blog-article', label: 'BLOG ARTICLE', channel: 'Web' },
  { id: 'podcast-outline', label: 'PODCAST OUTLINE', channel: 'Audio' },
  { id: 'podcast-episode', label: 'PODCAST EPISODE', channel: 'Audio' },
  { id: 'ebook-chapter', label: 'EBOOK CHAPTER', channel: 'Digital' },
  { id: 'course-lesson', label: 'COURSE LESSON', channel: 'Learning' },
  { id: 'community-discussion', label: 'COMMUNITY DISCUSSION', channel: 'Community' },
  { id: 'press-release', label: 'PRESS RELEASE', channel: 'PR' },
  { id: 'speaker-notes', label: 'SPEAKER NOTES', channel: 'Events' },
  { id: 'webinar', label: 'WEBINAR', channel: 'Live' },
];

export const DISTRIBUTION_CONNECTED_SYSTEMS = [
  'Strategy Engine',
  'Campaign Engine',
  'Newsroom',
  'Chief of Staff',
  'Studio Intelligence',
  'Creator Marketplace',
  'Growth Network',
  'Knowledge Graph',
  'Company DNA',
  'Creative DNA',
  'Writing DNA',
  'Operational DNA',
  'Leadership DNA',
  'Studio OS Labs',
  'Simulation Engine',
  'Work Orchestration',
] as const;

export const CHANNEL_OPTIMIZATION_FIELDS: Record<string, string[]> = {
  instagram: ['hook', 'caption', 'hashtags', 'thumbnail', 'reel timing'],
  tiktok: ['hook', 'pace', 'captions', 'sounds', 'timing'],
  youtube: ['title', 'description', 'thumbnail', 'chapters', 'seo'],
  linkedin: ['professional tone', 'carousel', 'long-form adaptation'],
  x: ['thread', 'reply strategy', 'engagement prompts'],
  newsletter: ['long-form narrative', 'call to action', 'summary'],
};

export const AUDIENCE_SEGMENTS = [
  'New readers',
  'Returning readers',
  'Customers',
  'Members',
  'Enterprise',
  'Founders',
  'Students',
  'Professionals',
] as const;
