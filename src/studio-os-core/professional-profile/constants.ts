/** Milestone 164 — Professional Profile™ · Living career identities */

export const PROFESSIONAL_PROFILE_STORAGE_KEY = 'studioOsProfessionalProfile_v1';
export const PROFESSIONAL_PROFILE_VERSION = '1.0.0';
export const STUDIO_OS_PROFESSIONAL_PROFILE_UPDATED = 'studio-os-professional-profile-updated';

export const PROFESSIONAL_PROFILE_ACCENT = '#0D9488';

export const PROFESSIONAL_PROFILE_PHILOSOPHY = [
  'Professional Profiles™ evolve alongside each person throughout their career — dynamic representations, not snapshots frozen in time.',
  'A living professional identity grows with every project, certification, Profession Brain™, and knowledge contribution.',
  'Professional Timeline™ shows professional growth over time — promotions, awards, leadership, skills, and marketplace achievements.',
  'Studio OS remembers how careers develop — so people never rebuild the same resume twice.',
] as const;

export const TIMELINE_EVENT_TYPES = [
  'promotion',
  'project',
  'award',
  'certification',
  'leadership-role',
  'skill-learned',
  'business-founded',
  'profession-brain-created',
  'marketplace-product-published',
  'mentorship',
  'course-completed',
  'knowledge-contribution',
] as const;

export const TIMELINE_EVENT_LABELS: Record<(typeof TIMELINE_EVENT_TYPES)[number], string> = {
  promotion: 'Promotion',
  project: 'Project',
  award: 'Award',
  certification: 'Certification',
  'leadership-role': 'Leadership Role',
  'skill-learned': 'Skill Learned',
  'business-founded': 'Business Founded',
  'profession-brain-created': 'Profession Brain™ Created',
  'marketplace-product-published': 'Marketplace Product Published',
  mentorship: 'Mentorship',
  'course-completed': 'Course Completed',
  'knowledge-contribution': 'Knowledge Contribution',
};

export const PROFILE_DOMAINS = [
  'experience',
  'skills',
  'learning',
  'leadership',
  'portfolio',
  'marketplace',
] as const;

export const PROFILE_DOMAIN_LABELS: Record<(typeof PROFILE_DOMAINS)[number], string> = {
  experience: 'Experience',
  skills: 'Skills & Certifications',
  learning: 'Learning & Academy',
  leadership: 'Leadership & Mentorship',
  portfolio: 'Portfolio & Projects',
  marketplace: 'Marketplace & Brains',
};
