/** Milestone 106 — Legacy Vault™ V2.0 */

export const LEGACY_VAULT_STORAGE_KEY = 'studioOsLegacyVault_v2';
export const LEGACY_VAULT_VERSION = '2.0.0';
export const STUDIO_OS_LEGACY_VAULT_UPDATED = 'studio-os-legacy-vault-updated';

export const LEGACY_VAULT_PHILOSOPHY = [
  'Businesses should preserve more than files — they should preserve history.',
  'The Legacy Vault™ exists so organizations never lose the story of how they were built.',
  'Never overwrite history — preserve versions and tell the complete story of evolution.',
  'PRESERVE EXPERTISE. BUILD LEGACY. — future generations inherit the story, not just the business.',
] as const;

export const PRESERVE_CATEGORIES = [
  'business-discovery-blueprint',
  'organization-charter',
  'founder-letters',
  'mission-vision-values',
  'historic-milestones',
  'executive-decisions',
  'awards',
  'major-announcements',
  'original-branding',
  'historic-media',
  'launch-campaigns',
  'press-releases',
  'important-documents',
  'organization-timeline',
  'headquarters-evolution',
  'profession-brain-milestones',
  'studio-institute-milestones',
  'knowledge-commerce-milestones',
] as const;

export const PRESERVE_CATEGORY_LABELS: Record<(typeof PRESERVE_CATEGORIES)[number], string> = {
  'business-discovery-blueprint': 'Original Business Discovery Blueprint™',
  'organization-charter': 'Original Organization Charter',
  'founder-letters': 'Founder Letters',
  'mission-vision-values': 'Mission · Vision · Core Values',
  'historic-milestones': 'Historic Milestones',
  'executive-decisions': 'Executive Decisions',
  awards: 'Awards',
  'major-announcements': 'Major Announcements',
  'original-branding': 'Original Branding · Historic Logos',
  'historic-media': 'Videos · Photographs',
  'launch-campaigns': 'Launch Campaigns',
  'press-releases': 'Press Releases',
  'important-documents': 'Important Documents',
  'organization-timeline': 'Organization Timelines',
  'headquarters-evolution': 'Headquarters Evolutions',
  'profession-brain-milestones': 'Profession Brain™ Milestones',
  'studio-institute-milestones': 'Studio Institute™ Milestones',
  'knowledge-commerce-milestones': 'Knowledge Commerce™ Milestones',
};

export const VERSION_HISTORY_TYPES = [
  'mission',
  'vision',
  'headquarters',
  'profession-brain',
  'organization-genome',
  'sop',
  'branding',
  'org-structure',
  'department-pack',
  'knowledge-product',
] as const;

export const LEGACY_EXPERIENCE_TYPES = [
  'founding-timeline',
  'growth-timeline',
  'milestone-gallery',
  'historic-headquarters',
  'evolution-map',
  'anniversary-celebration',
  'founder-archive',
  'knowledge-timeline',
  'interactive-history',
] as const;

export const FOUNDER_ARCHIVE_TYPES = [
  'reflection',
  'voice-recording',
  'letter-future-employees',
  'letter-future-owners',
  'leadership-lesson',
  'decision-story',
  'historic-interview',
  'vision-update',
  'personal-note',
] as const;

export const FAMILY_LEGACY_TYPES = [
  'letter-children',
  'family-history',
  'company-tradition',
  'lesson-learned',
  'founder-story',
  'vision-future-generations',
  'message-future-leadership',
] as const;

export const TIME_CAPSULE_TRIGGERS = [
  'open-in-5-years',
  'open-10th-anniversary',
  'open-after-retirement',
  'open-after-succession',
  'open-upon-company-sale',
  'custom-date',
] as const;

export const TIME_CAPSULE_TRIGGER_LABELS: Record<(typeof TIME_CAPSULE_TRIGGERS)[number], string> = {
  'open-in-5-years': 'Open in 5 Years',
  'open-10th-anniversary': 'Open on 10th Anniversary',
  'open-after-retirement': 'Open After Retirement',
  'open-after-succession': 'Open After Succession',
  'open-upon-company-sale': 'Open Upon Company Sale',
  'custom-date': 'Custom Date',
};

export const PRESERVE_MOMENT_PATTERNS = [
  { pattern: /first employee|hired our first|first hire/i, message: 'You hired your first employee today — a founding moment worth preserving.' },
  { pattern: /100th customer|hundredth customer/i, message: 'This is your organization\'s 100th customer — a milestone worth the Legacy Vault™.' },
  { pattern: /first million|million in revenue|reached \$1/i, message: 'Congratulations on your first million in revenue — preserve this breakthrough in the Legacy Vault™.' },
  { pattern: /launch|launched today|go live/i, message: 'Would you like to preserve today\'s launch in the Legacy Vault™?' },
  { pattern: /milestone|anniversary|breakthrough|setback|first customer/i, message: 'Today\'s milestone may be worth preserving in the Legacy Vault™.' },
] as const;
