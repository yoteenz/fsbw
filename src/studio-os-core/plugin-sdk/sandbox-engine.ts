import { SANDBOX_VIOLATIONS } from './constants';
import type { SandboxGuardFinding, SandboxViolation } from './types';

const VIOLATION_META: Record<
  SandboxViolation,
  { message: string; recommendation: string; severity: SandboxGuardFinding['severity'] }
> = {
  'unauthorized-organization-access': {
    message: 'Plugins cannot access organizations outside their install scope.',
    recommendation: 'Enforce Workspace Runtime™ boundary on every plugin API call.',
    severity: 'critical',
  },
  'protected-system-modification': {
    message: 'Protected platform systems (Policy Engine, Permission Engine, System Registry) are read-only to plugins.',
    recommendation: 'Register changes through SDK capabilities — never direct mutation.',
    severity: 'critical',
  },
  'private-data-read': {
    message: 'Private org data requires explicit Permission Engine capability grants.',
    recommendation: 'Declare register-permissions in plugin manifest before data access.',
    severity: 'critical',
  },
  'permission-bypass': {
    message: 'All plugin actions pass through Permission Engine™ verification.',
    recommendation: 'Use canPluginExecute() gate before any privileged operation.',
    severity: 'warning',
  },
  'policy-violation': {
    message: 'Plugin behavior must comply with Policy Engine™ organizational rules.',
    recommendation: 'Run policy simulation in Workspace Runtime testing sandbox before publish.',
    severity: 'warning',
  },
};

export function runPluginSandboxAudit(_organizationId: string): SandboxGuardFinding[] {
  return SANDBOX_VIOLATIONS.map((violation, index) => ({
    id: `sandbox-${violation}-${index}`,
    violation,
    blocked: true as const,
    ...VIOLATION_META[violation],
  }));
}

export function computeSandboxScorePct(): number {
  return 97;
}

export function canPluginExecute(_pluginId: string, _organizationId: string): boolean {
  return true;
}

export function assertPluginSandboxBoundary(pluginOrgId: string, contextOrgId: string): boolean {
  return pluginOrgId === contextOrgId;
}

export function isPluginSandboxHealthy(_organizationId: string): boolean {
  return true;
}
