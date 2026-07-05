/** Production Studio — cinematic content production headquarters. */

export const PRODUCTION_STUDIO_STORAGE_KEY = 'studioOsProductionStudio_v1';
export const PRODUCTION_STUDIO_VERSION = '1.0.0';
export const PRODUCTION_STUDIO_ID = 'production-studio';

export const PRODUCTION_STUDIO_PHILOSOPHY = [
  'Every approved page becomes production-ready media — not a traditional video editor.',
  'AI production teams are already working when you enter the studio.',
  'Founders override any AI decision — luxury creative control without complexity.',
  'Pixar craft meets Apple Pro Studio — cinematic, calm, never Adobe Premiere.',
] as const;

export const PRODUCTION_PIPELINE_STAGES = [
  { id: 'page-ready', label: 'PAGE READY' },
  { id: 'production-brief', label: 'PRODUCTION BRIEF' },
  { id: 'voice-generation', label: 'VOICE GENERATION' },
  { id: 'host-assignment', label: 'HOST ASSIGNMENT' },
  { id: 'visual-generation', label: 'VISUAL GENERATION' },
  { id: 'motion-graphics', label: 'MOTION GRAPHICS' },
  { id: 'captions', label: 'CAPTIONS' },
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'platform-optimization', label: 'PLATFORM OPTIMIZATION' },
  { id: 'preview', label: 'PREVIEW' },
  { id: 'render-queue', label: 'RENDER QUEUE' },
] as const;

export const PRODUCTION_ASSET_TYPES = [
  { id: 'script', label: 'SCRIPT' },
  { id: 'voice', label: 'VOICE' },
  { id: 'host', label: 'HOST' },
  { id: 'b-roll', label: 'B-ROLL' },
  { id: 'motion-graphics', label: 'MOTION GRAPHICS' },
  { id: 'charts', label: 'CHARTS' },
  { id: 'captions', label: 'CAPTIONS' },
  { id: 'thumbnail', label: 'THUMBNAIL' },
  { id: 'title', label: 'TITLE' },
  { id: 'description', label: 'DESCRIPTION' },
  { id: 'hashtags', label: 'HASHTAGS' },
  { id: 'seo-metadata', label: 'SEO METADATA' },
  { id: 'platform-variations', label: 'PLATFORM VARIATIONS' },
] as const;

export const PRODUCTION_QUEUE_STATUSES = [
  { id: 'ready', label: 'READY' },
  { id: 'in-production', label: 'IN PRODUCTION' },
  { id: 'rendering', label: 'RENDERING' },
  { id: 'needs-review', label: 'NEEDS REVIEW' },
  { id: 'completed', label: 'COMPLETED' },
] as const;

export const PRODUCTION_STUDIO_CONNECTED_SYSTEMS = [
  'MISSION CONTROL',
  'NEWSROOM',
  'PUBLISHING',
  'LIBRARY',
  'STUDIO INTELLIGENCE',
  'KNOWLEDGE GRAPH',
  'TALENT NETWORK',
  'BRAND CONCIERGE',
  'EXPERIENCE CONCIERGE',
  'DIGITAL CONCIERGE',
  'TECHNOLOGY CONCIERGE',
  'GROWTH CONCIERGE',
  'CHIEF CONCIERGE',
] as const;
