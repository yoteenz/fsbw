/** Milestone 120 — Organization Operating Manual™ V1.0 */

export const ORGANIZATION_OPERATING_MANUAL_STORAGE_KEY = 'studioOsOrganizationOperatingManual_v1';
export const ORGANIZATION_OPERATING_MANUAL_VERSION = '1.0.0';
export const STUDIO_OS_ORGANIZATION_OPERATING_MANUAL_UPDATED = 'studio-os-organization-operating-manual-updated';

export const OPERATING_MANUAL_PHILOSOPHY = [
  'Organizations should never have to manually maintain documentation — Studio OS generates, organizes, and continuously updates the operating manual.',
  'One organization. One handbook. Always current.',
  'Every employee, department, Digital Concierge, and future leader learns from the same continuously evolving handbook.',
] as const;

export const MANUAL_DOCUMENT_TYPES = [
  'organization-charter',
  'mission',
  'vision',
  'core-values',
  'business-discovery-blueprint',
  'organization-genome',
  'profession-brain-summaries',
  'department-guides',
  'employee-handbook',
  'leadership-principles',
  'customer-experience-standards',
  'approval-workflows',
  'standard-operating-procedures',
  'automation-documentation',
  'knowledge-articles',
  'training-paths',
  'command-dock-reference',
  'executive-council-procedures',
  'emergency-procedures',
  'glossary',
  'policy-library',
] as const;

export const MANUAL_DOCUMENT_LABELS: Record<(typeof MANUAL_DOCUMENT_TYPES)[number], string> = {
  'organization-charter': 'Organization Charter',
  mission: 'Mission',
  vision: 'Vision',
  'core-values': 'Core Values',
  'business-discovery-blueprint': 'Business Discovery Blueprint™',
  'organization-genome': 'Organization Genome™',
  'profession-brain-summaries': 'Profession Brain™ Summaries',
  'department-guides': 'Department Guides',
  'employee-handbook': 'Employee Handbook',
  'leadership-principles': 'Leadership Principles',
  'customer-experience-standards': 'Customer Experience Standards',
  'approval-workflows': 'Approval Workflows',
  'standard-operating-procedures': 'Standard Operating Procedures',
  'automation-documentation': 'Automation Documentation',
  'knowledge-articles': 'Knowledge Articles',
  'training-paths': 'Training Paths',
  'command-dock-reference': 'Command Dock Reference',
  'executive-council-procedures': 'Executive Council Procedures',
  'emergency-procedures': 'Emergency Procedures',
  glossary: 'Glossary',
  'policy-library': 'Policy Library',
};

export const SYNC_TRIGGER_TYPES = [
  'departments',
  'policies',
  'profession-brain',
  'automation',
  'training',
  'knowledge',
] as const;

export const SYNC_TRIGGER_LABELS: Record<(typeof SYNC_TRIGGER_TYPES)[number], string> = {
  departments: 'Departments',
  policies: 'Policies',
  'profession-brain': 'Profession Brain™',
  automation: 'Automation',
  training: 'Training',
  knowledge: 'Knowledge',
};

export const OPERATING_MANUAL_ACCENT = '#2563EB';
