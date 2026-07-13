import type { ImplementationCategory, ExecutionMode } from '../schemas/implementation-task';

export const EXECUTION_MODE_DEFAULTS: Partial<Record<ImplementationCategory, ExecutionMode>> = {
  architecture: 'MANUAL',
  schema: 'MANUAL',
  permissions: 'MANUAL',
  'ai-routing': 'MANUAL',
  documentation: 'AUTONOMOUS',
  tests: 'AUTONOMOUS',
  diagnostics: 'AUTONOMOUS',
  refactor: 'ASSISTED',
  governance: 'MANUAL',
  marketplace: 'MANUAL',
  billing: 'MANUAL',
  licensing: 'MANUAL',
  pipeline: 'ASSISTED',
  infrastructure: 'ASSISTED',
};

export const FOUNDER_APPROVAL_CATEGORIES: ImplementationCategory[] = [
  'architecture',
  'schema',
  'permissions',
  'marketplace',
  'billing',
  'licensing',
  'governance',
  'ai-routing',
];

export function resolveDefaultExecutionMode(category: ImplementationCategory): ExecutionMode {
  return EXECUTION_MODE_DEFAULTS[category] ?? 'ASSISTED';
}

export function requiresFounderApproval(category: ImplementationCategory): boolean {
  return FOUNDER_APPROVAL_CATEGORIES.includes(category);
}

export function canAutoDispatch(executionMode: ExecutionMode, founderApprovalRequired: boolean, founderApproved?: boolean): boolean {
  if (executionMode !== 'AUTONOMOUS') return false;
  if (founderApprovalRequired && !founderApproved) return false;
  return true;
}
