/** Milestone 166 — Role Intelligence™ · Understanding work, not titles */

export const ROLE_INTELLIGENCE_STORAGE_KEY = 'studioOsRoleIntelligence_v1';
export const ROLE_INTELLIGENCE_VERSION = '1.0.0';
export const STUDIO_OS_ROLE_INTELLIGENCE_UPDATED = 'studio-os-role-intelligence-updated';

export const ROLE_INTELLIGENCE_ACCENT = '#0369A1';

export const ROLE_INTELLIGENCE_PHILOSOPHY = [
  'Studio OS should understand work — not titles. Two people with the same title may perform completely different responsibilities.',
  'Role Intelligence™ maps actual responsibilities, workflows, decision authority, and performance — not job title labels alone.',
  'Role Evolution™ continuously updates role definitions as organizations grow — roles evolve, and Studio Intelligence™ keeps pace.',
  'Every role connects to Profession Brains™, required skills, documents, automations, and AI Employee counterparts.',
] as const;

export const ROLE_TEMPLATES = [
  'receptionist',
  'dispatcher',
  'estimator',
  'permit-specialist',
  'project-manager',
  'executive-assistant',
  'marketing-director',
  'bookkeeper',
  'attorney',
  'stylist',
] as const;

export const ROLE_TEMPLATE_LABELS: Record<(typeof ROLE_TEMPLATES)[number], string> = {
  receptionist: 'Receptionist',
  dispatcher: 'Dispatcher',
  estimator: 'Estimator',
  'permit-specialist': 'Permit Specialist',
  'project-manager': 'Project Manager',
  'executive-assistant': 'Executive Assistant',
  'marketing-director': 'Marketing Director',
  bookkeeper: 'Bookkeeper',
  attorney: 'Attorney',
  stylist: 'Stylist',
};

export const DECISION_AUTHORITY_LEVELS = [
  'full-autonomy',
  'recommend-approve',
  'escalate-only',
  'execute-routine',
  'advisory',
] as const;

export const DECISION_AUTHORITY_LABELS: Record<(typeof DECISION_AUTHORITY_LEVELS)[number], string> = {
  'full-autonomy': 'Full Autonomy',
  'recommend-approve': 'Recommend → Approve',
  'escalate-only': 'Escalate Only',
  'execute-routine': 'Execute Routine',
  advisory: 'Advisory',
};

export const ROLE_EVOLUTION_STAGES = [
  'emerging',
  'defined',
  'mature',
  'evolving',
  'splitting',
  'consolidating',
] as const;

export const ROLE_EVOLUTION_LABELS: Record<(typeof ROLE_EVOLUTION_STAGES)[number], string> = {
  emerging: 'Emerging Role',
  defined: 'Defined Role',
  mature: 'Mature Role',
  evolving: 'Evolving',
  splitting: 'Splitting Into Specializations',
  consolidating: 'Consolidating Responsibilities',
};

export const ROLE_INTELLIGENCE_DOMAINS = [
  'responsibilities',
  'workflows',
  'authority',
  'skills',
  'evolution',
  'ai-counterparts',
] as const;

export const ROLE_DOMAIN_LABELS: Record<(typeof ROLE_INTELLIGENCE_DOMAINS)[number], string> = {
  responsibilities: 'Responsibilities',
  workflows: 'Daily Workflows',
  authority: 'Decision Authority',
  skills: 'Required Skills',
  evolution: 'Role Evolution™',
  'ai-counterparts': 'AI Employee Counterparts',
};
