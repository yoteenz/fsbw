import { SANDBOX_ENVIRONMENTS } from './constants';
import type { SandboxEnvironment, SandboxEnvironmentStatus } from './types';

const SANDBOX_META: Record<
  SandboxEnvironment,
  { label: string; description: string; safeForTesting: boolean }
> = {
  production: {
    label: 'Production',
    description: 'Live organization runtime — founder-facing headquarters.',
    safeForTesting: false,
  },
  development: {
    label: 'Development',
    description: 'Safe experimentation with modules, policies, and automations.',
    safeForTesting: true,
  },
  testing: {
    label: 'Testing',
    description: 'Automated workflow and policy validation before publish.',
    safeForTesting: true,
  },
  preview: {
    label: 'Preview',
    description: 'Stakeholder preview of changes before production deploy.',
    safeForTesting: true,
  },
  training: {
    label: 'Training',
    description: 'Studio Institute sandbox for team onboarding.',
    safeForTesting: true,
  },
};

/** Sandbox environments — test automations, workflows, policies before publishing. */
export function buildSandboxStatuses(): SandboxEnvironmentStatus[] {
  const now = Date.now();
  return SANDBOX_ENVIRONMENTS.map((environment) => {
    const meta = SANDBOX_META[environment];
    let status: SandboxEnvironmentStatus['status'] = 'healthy';
    if (environment === 'development') status = 'ready';
    return {
      environment,
      label: meta.label,
      status,
      description: meta.description,
      safeForTesting: meta.safeForTesting,
      lastDeployedAt:
        environment === 'production'
          ? new Date(now - 86400000).toISOString()
          : environment === 'development'
          ? new Date(now - 3600000).toISOString()
          : undefined,
    };
  });
}

export function getSandboxStatus(environment: SandboxEnvironment): SandboxEnvironmentStatus | undefined {
  return buildSandboxStatuses().find((s) => s.environment === environment);
}

export function isDevelopmentReady(): boolean {
  const dev = getSandboxStatus('development');
  return dev?.status === 'ready' || dev?.status === 'healthy';
}

export function isTestingHealthy(): boolean {
  const test = getSandboxStatus('testing');
  return test?.status === 'healthy';
}
