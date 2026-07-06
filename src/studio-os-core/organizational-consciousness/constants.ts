/** Milestone 115 — Organizational Consciousness™ V1.0 */

export const ORGANIZATIONAL_CONSCIOUSNESS_STORAGE_KEY = 'studioOsOrganizationalConsciousness_v1';
export const ORGANIZATIONAL_CONSCIOUSNESS_VERSION = '1.0.0';
export const STUDIO_OS_ORGANIZATIONAL_CONSCIOUSNESS_UPDATED = 'studio-os-organizational-consciousness-updated';

export const CONSCIOUSNESS_PHILOSOPHY = [
  'One continuously learning organizational intelligence — not dozens of independent features.',
  'One intelligence. Many capabilities. One memory. Many departments.',
  'PRESERVE EXPERTISE. BUILD LEGACY. — the living consciousness of the organization.',
] as const;

export const CONNECTED_SYSTEMS = [
  'business-discovery-blueprint',
  'profession-brain',
  'organization-genome',
  'memory-engine',
  'presence-engine',
  'ambient-awareness',
  'relationship-memory',
  'executive-council',
  'organization-pulse',
  'company-health-index',
  'predictive-organization',
  'autonomous-preparation',
  'knowledge-confidence',
  'command-dock',
  'legacy-vault',
] as const;

export const CONNECTED_SYSTEM_LABELS: Record<(typeof CONNECTED_SYSTEMS)[number], string> = {
  'business-discovery-blueprint': 'Business Discovery Blueprint™',
  'profession-brain': 'Profession Brain™',
  'organization-genome': 'Organization Genome™',
  'memory-engine': 'Memory Engine™',
  'presence-engine': 'Presence Engine™',
  'ambient-awareness': 'Ambient Awareness™',
  'relationship-memory': 'Relationship Memory™',
  'executive-council': 'Executive Council™',
  'organization-pulse': 'Organization Pulse™',
  'company-health-index': 'Company Health Index™',
  'predictive-organization': 'Predictive Organization™',
  'autonomous-preparation': 'Autonomous Preparation™',
  'knowledge-confidence': 'Knowledge Confidence™',
  'command-dock': 'Command Dock™',
  'legacy-vault': 'Legacy Vault™',
};

export const REASONING_FACTORS = [
  'organizational-history',
  'current-priorities',
  'founder-preferences',
  'profession-brain',
  'organization-genome',
  'relationship-memory',
  'executive-council',
  'knowledge-confidence',
  'current-workload',
  'long-term-goals',
] as const;

export const REASONING_FACTOR_LABELS: Record<(typeof REASONING_FACTORS)[number], string> = {
  'organizational-history': 'Organizational History',
  'current-priorities': 'Current Priorities',
  'founder-preferences': 'Founder Preferences',
  'profession-brain': 'Profession Brain™',
  'organization-genome': 'Organization Genome™',
  'relationship-memory': 'Relationship Memory™',
  'executive-council': 'Executive Council™',
  'knowledge-confidence': 'Knowledge Confidence™',
  'current-workload': 'Current Workload',
  'long-term-goals': 'Long-Term Goals',
};

export const LEARNING_CONTRIBUTION_TYPES = [
  'projects',
  'meetings',
  'lessons',
  'approvals',
  'customer-interactions',
  'campaigns',
  'training',
  'knowledge-updates',
  'profession-brain-improvements',
] as const;

export const LEARNING_CONTRIBUTION_LABELS: Record<(typeof LEARNING_CONTRIBUTION_TYPES)[number], string> = {
  projects: 'Projects',
  meetings: 'Meetings',
  lessons: 'Lessons',
  approvals: 'Approvals',
  'customer-interactions': 'Customer Interactions',
  campaigns: 'Campaigns',
  training: 'Training',
  'knowledge-updates': 'Knowledge Updates',
  'profession-brain-improvements': 'Profession Brain Improvements',
};

export const EXECUTIVE_IDENTITY_PILLARS = [
  'remembers',
  'learns',
  'predicts',
  'prepares',
  'collaborates',
  'preserves',
  'adapts',
  'protects',
  'teaches',
  'grows',
] as const;
