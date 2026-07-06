import { buildCapabilityCatalog } from './capability-catalog';
import { buildRoleCompositions } from './role-composition';
import type { PermissionGovernanceFinding } from './types';

export function runPermissionGovernanceAudit(): PermissionGovernanceFinding[] {
  const findings: PermissionGovernanceFinding[] = [];
  const capabilities = buildCapabilityCatalog();
  const roles = buildRoleCompositions();

  const unregistered = capabilities.filter((c) => !c.registered);
  if (unregistered.length > 0) {
    findings.push({
      id: 'unregistered-capabilities',
      severity: 'critical',
      message: `${unregistered.length} capability(ies) not registered.`,
      recommendation: 'Register all capabilities via registerCapability() before granting access.',
    });
  }

  const guestElevated = roles.find((r) => r.roleId === 'guest')?.capabilityIds.filter((c) => c.includes('manage') || c.includes('approve'));
  if (guestElevated && guestElevated.length > 0) {
    findings.push({
      id: 'guest-elevation',
      severity: 'warning',
      message: 'Guest role contains elevated capabilities — review composition.',
      recommendation: 'Guest roles should be read-only by default.',
    });
  }

  const founderCaps = roles.find((r) => r.roleId === 'founder')?.capabilityIds.length ?? 0;
  if (founderCaps < capabilities.length) {
    findings.push({
      id: 'founder-coverage',
      severity: 'info',
      message: `Founder role has ${founderCaps}/${capabilities.length} capabilities.`,
      recommendation: 'Founder should inherit full capability set.',
    });
  }

  findings.push({
    id: 'capability-based',
    severity: 'info',
    message: `${capabilities.length} modular capabilities · ${roles.length} composable roles — access by what people can do.`,
    recommendation: 'Permissions describe capabilities, not job titles. Customize every role.',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeCapabilityCoveragePct(): number {
  const capabilities = buildCapabilityCatalog();
  const registered = capabilities.filter((c) => c.registered).length;
  return Math.round((registered / Math.max(1, capabilities.length)) * 100);
}
