/** Milestone 142 — QA Headquarters™ · Quality Assurance & Trust Infrastructure */

export const QA_HEADQUARTERS_STORAGE_KEY = 'studioOsQaHeadquarters_v1';
export const QA_HEADQUARTERS_VERSION = '1.0.0';
export const STUDIO_OS_QA_HEADQUARTERS_UPDATED = 'studio-os-qa-headquarters-updated';

export const QA_HEADQUARTERS_ACCENT = '#10B981';

export const QA_HEADQUARTERS_PHILOSOPHY = [
  'Quality Assurance is a permanent operating layer — not a one-time audit.',
  'Studio OS continuously verifies itself before trust is lost.',
  'Every major system earns a dynamic Trust Score™ visible to administrators.',
  'Significant changes trigger automatic validation — quietly protecting every organization.',
] as const;

export const TRUST_SCORE_SYSTEMS = [
  'profession-brain',
  'documentation',
  'knowledge-library',
  'marketplace',
  'automations',
  'expert-marketplace',
  'organization-health',
  'studio-intelligence',
  'workflows',
  'integrations',
  'security',
  'performance',
  'user-experience',
] as const;

export const QA_RESPONSIBILITIES = [
  'workflow-validation',
  'ai-output-validation',
  'automation-validation',
  'documentation-validation',
  'knowledge-integrity',
  'broken-link-detection',
  'missing-dependency-detection',
  'profession-brain-health',
  'organization-health',
  'marketplace-quality',
  'expert-quality',
  'integration-health',
  'security-monitoring',
  'performance-monitoring',
  'user-experience-validation',
] as const;

export const VALIDATION_TRIGGERS = [
  'new-workflow',
  'updated-profession-brain',
  'marketplace-submission',
  'knowledge-update',
  'automation-change',
  'documentation-revision',
  'integration-change',
  'permission-change',
  'expert-response',
  'studio-intelligence-recommendation',
] as const;

export const VALIDATION_STATUSES = ['passed', 'warning', 'failed', 'pending', 'running'] as const;
