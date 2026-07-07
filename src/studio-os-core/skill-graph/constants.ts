/** Milestone 165 — Skill Graph™ · Organizational capability intelligence */

export const SKILL_GRAPH_STORAGE_KEY = 'studioOsSkillGraph_v1';
export const SKILL_GRAPH_VERSION = '1.0.0';
export const STUDIO_OS_SKILL_GRAPH_UPDATED = 'studio-os-skill-graph-updated';

export const SKILL_GRAPH_ACCENT = '#E11D48';

export const SKILL_GRAPH_PHILOSOPHY = [
  'Skills become searchable organizational assets — knowledge should no longer remain invisible.',
  'Studio OS knows who knows what, who can teach it, who needs help, and who should collaborate.',
  'The Skill Graph™ maps every capability across the organization — technical, creative, operational, and leadership.',
  'Studio Intelligence™ surfaces gaps, mentorship opportunities, and demand before problems become crises.',
] as const;

export const SKILL_CATEGORIES = [
  'technical',
  'industry',
  'leadership',
  'creative',
  'operational',
  'ai',
  'communication',
  'management',
  'sales',
  'marketing',
  'finance',
  'compliance',
  'languages',
  'software',
  'equipment',
  'certifications',
] as const;

export const SKILL_CATEGORY_LABELS: Record<(typeof SKILL_CATEGORIES)[number], string> = {
  technical: 'Technical Skills',
  industry: 'Industry Skills',
  leadership: 'Leadership Skills',
  creative: 'Creative Skills',
  operational: 'Operational Skills',
  ai: 'AI Skills',
  communication: 'Communication',
  management: 'Management',
  sales: 'Sales',
  marketing: 'Marketing',
  finance: 'Finance',
  compliance: 'Compliance',
  languages: 'Languages',
  software: 'Software',
  equipment: 'Equipment',
  certifications: 'Certifications',
};

export const SKILL_RELATIONSHIP_TYPES = [
  'complements',
  'requires',
  'becoming-outdated',
  'highly-demanded',
] as const;

export const SKILL_RELATIONSHIP_LABELS: Record<(typeof SKILL_RELATIONSHIP_TYPES)[number], string> = {
  complements: 'Complements',
  requires: 'Requires',
  'becoming-outdated': 'Becoming Outdated',
  'highly-demanded': 'Highly Demanded',
};

export const SKILL_GRAPH_DOMAINS = [
  'coverage',
  'mentorship',
  'gaps',
  'demand',
  'collaboration',
  'visibility',
] as const;

export const SKILL_GRAPH_DOMAIN_LABELS: Record<(typeof SKILL_GRAPH_DOMAINS)[number], string> = {
  coverage: 'Skill Coverage',
  mentorship: 'Mentorship Capacity',
  gaps: 'Gap Detection',
  demand: 'Demand Signals',
  collaboration: 'Collaboration Matches',
  visibility: 'Knowledge Visibility',
};

export const PROFICIENCY_LEVELS = ['expert', 'proficient', 'developing', 'learning'] as const;
