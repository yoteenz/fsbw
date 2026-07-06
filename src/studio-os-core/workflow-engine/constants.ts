/** Milestone 138 — Workflow Engine™ V1.0 */

export const WORKFLOW_ENGINE_STORAGE_KEY = 'studioOsWorkflowEngine_v1';
export const WORKFLOW_ENGINE_VERSION = '1.0.0';
export const STUDIO_OS_WORKFLOW_ENGINE_UPDATED = 'studio-os-workflow-engine-updated';

export const WORKFLOW_ENGINE_ACCENT = '#0D9488';

export const WORKFLOW_ENGINE_PHILOSOPHY = [
  'Organizations should design processes visually — workflows understandable by humans and Digital Concierges.',
  'Nothing goes live without testing — preview, simulate, debug, and validate before publish.',
  'Workflows become living systems that grow alongside the organization.',
  'The Workflow Engine™ is organizational choreography — visualize, improve, automate, evolve.',
] as const;

export const WORKFLOW_NODE_TYPES = [
  'trigger',
  'decision',
  'condition',
  'approval',
  'delay',
  'notification',
  'command-dock',
  'executive-council',
  'digital-concierge',
  'ai-reasoning',
  'profession-brain',
  'memory-lookup',
  'document-creation',
  'calendar',
  'email',
  'sms',
  'marketplace',
  'studio-institute',
  'automation',
  'custom-plugin',
  'end',
] as const;

export const WORKFLOW_PROCESS_TYPES = [
  'client-onboarding',
  'hiring',
  'invoice-approval',
  'content-publishing',
  'fuel-tax-processing',
  'permit-processing',
  'lead-qualification',
  'customer-support',
  'knowledge-capture',
  'sales-pipeline',
  'marketing-campaigns',
  'employee-training',
] as const;

export const WORKFLOW_TESTING_MODES = [
  'preview',
  'simulate',
  'debug',
  'step-through',
  'validate',
  'inspect-variables',
  'review-decisions',
  'estimate-duration',
  'measure-confidence',
] as const;

export const WORKFLOW_ANALYTICS_METRICS = [
  'execution-count',
  'completion-rate',
  'average-duration',
  'bottlenecks',
  'failure-rate',
  'approval-delays',
  'automation-opportunities',
  'ai-usage',
  'customer-impact',
  'optimization-suggestions',
] as const;
