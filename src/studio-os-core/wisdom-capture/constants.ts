/** Milestone 101 — Wisdom Capture™ V1.0 */

export const WISDOM_CAPTURE_STORAGE_KEY = 'studioOsWisdomCapture_v1';
export const WISDOM_CAPTURE_VERSION = '1.0.0';
export const STUDIO_OS_WISDOM_CAPTURE_UPDATED = 'studio-os-wisdom-capture-updated';

export const WISDOM_CAPTURE_PHILOSOPHY = [
  'Processes explain what happened. Wisdom explains why.',
  'Organizations gain thousands of valuable insights every year — most disappear because nobody records them.',
  'Studio OS preserves small lessons, observations, decisions, and discoveries before they are forgotten.',
  'No important lesson should ever be forgotten.',
] as const;

/** Phrases that signal potential organizational wisdom. */
export const WISDOM_TRIGGER_PATTERNS = [
  /\bi learned\b/i,
  /\bnext time\b/i,
  /\bwe should always\b/i,
  /\bwe'll never do that again\b/i,
  /\bwe will never do that again\b/i,
  /\bi finally figured out\b/i,
  /\bthis works much better\b/i,
  /\bi wish i knew this sooner\b/i,
  /\bnever again\b/i,
  /\balways remember to\b/i,
  /\bthe lesson is\b/i,
  /\bkey takeaway\b/i,
] as const;

export const WISDOM_LIBRARY_CATEGORIES = [
  'department',
  'profession-brain',
  'projects',
  'customers',
  'industry',
  'lessons-learned',
  'leadership',
  'operations',
  'marketing',
  'customer-experience',
  'growth',
] as const;

export const WISDOM_CAPTURE_PROMPT =
  'Would you like to preserve this as Organizational Wisdom?';

export const WISDOM_LEARNING_TARGETS = [
  'profession-brain',
  'digital-concierges',
  'studio-institute',
  'automation',
  'executive-council',
  'future-recommendations',
] as const;
