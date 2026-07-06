/** Milestone 112 — Relationship Memory™ V1.0 */

export const RELATIONSHIP_MEMORY_STORAGE_KEY = 'studioOsRelationshipMemory_v1';
export const RELATIONSHIP_MEMORY_VERSION = '1.0.0';
export const STUDIO_OS_RELATIONSHIP_MEMORY_UPDATED = 'studio-os-relationship-memory-updated';

export const RELATIONSHIP_MEMORY_PHILOSOPHY = [
  'Relationships improve through memory — familiarity, not intrusive personalization.',
  'Studio OS remembers professional preferences so people never repeatedly explain themselves.',
  'The best executive assistants remember how leaders work — Studio OS should do the same.',
] as const;

export const FOUNDER_PREFERENCE_TYPES = [
  'communication-style',
  'approval-habits',
  'creative-workflow',
  'decision-making',
  'meeting-preferences',
  'review-preferences',
  'working-hours',
  'leadership-philosophy',
  'reporting-formats',
  'presentation-style',
] as const;

export const FOUNDER_PREFERENCE_LABELS: Record<(typeof FOUNDER_PREFERENCE_TYPES)[number], string> = {
  'communication-style': 'Communication Style',
  'approval-habits': 'Approval Habits',
  'creative-workflow': 'Creative Workflow',
  'decision-making': 'Decision-Making Style',
  'meeting-preferences': 'Meeting Preferences',
  'review-preferences': 'Review Preferences',
  'working-hours': 'Working Hours',
  'leadership-philosophy': 'Leadership Philosophy',
  'reporting-formats': 'Reporting Formats',
  'presentation-style': 'Presentation Style',
};

export const RELATIONSHIP_ENTITY_TYPES = [
  'clients',
  'partners',
  'suppliers',
  'employees',
  'departments',
] as const;

export const RELATIONSHIP_ENTITY_LABELS: Record<(typeof RELATIONSHIP_ENTITY_TYPES)[number], string> = {
  clients: 'Clients',
  partners: 'Partners',
  suppliers: 'Suppliers',
  employees: 'Employees',
  departments: 'Departments',
};
