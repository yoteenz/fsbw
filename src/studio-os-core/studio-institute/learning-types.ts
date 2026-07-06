/** Milestone 93 — Studio Institute™ learning artifact taxonomy */

export const INSTITUTE_LEARNING_ARTIFACT_TYPES = [
  'course',
  'lesson',
  'learning-path',
  'micro-lesson',
  'checklist',
  'playbook',
  'reference-guide',
  'scenario-training',
  'interactive-exercise',
  'knowledge-article',
  'certification-program',
  'operational-simulation',
  'role-training',
] as const;

export type InstituteLearningArtifactType = (typeof INSTITUTE_LEARNING_ARTIFACT_TYPES)[number];

export const INSTITUTE_LEARNING_AUDIENCES = [
  'employee',
  'manager',
  'executive',
  'contractor',
  'customer',
  'student',
  'partner',
  'franchise-owner',
  'future-family',
  'ai-concierge',
] as const;

export type InstituteLearningAudience = (typeof INSTITUTE_LEARNING_AUDIENCES)[number];

export const INSTITUTE_ORG_ROLES = [
  'Fuel Tax Specialist',
  'Bookkeeper',
  'Dispatcher',
  'Marketing Coordinator',
  'Customer Service Representative',
  'Operations Manager',
  'Permit Specialist',
  'Inventory Manager',
  'Hair Color Expert',
  'Brand Coordinator',
] as const;

export type InstituteOrgRole = (typeof INSTITUTE_ORG_ROLES)[number];
