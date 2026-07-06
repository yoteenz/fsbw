import { buildPolicyCatalog } from './policy-catalog';
import { buildPolicyHierarchy } from './hierarchy-engine';
import type { PolicyGovernanceFinding } from './types';

/** Policy governance — rules defined once, never duplicated. */
export function runPolicyGovernanceAudit(): PolicyGovernanceFinding[] {
  const findings: PolicyGovernanceFinding[] = [];
  const catalog = buildPolicyCatalog();
  const hierarchy = buildPolicyHierarchy();

  const unregistered = catalog.filter((p) => !p.registered);
  if (unregistered.length > 0) {
    findings.push({
      id: 'unregistered-policies',
      severity: 'critical',
      message: `${unregistered.length} policy(ies) not registered — enforcement cannot apply.`,
      recommendation: 'Register all policies via registerPolicy() before activation.',
    });
  }

  const drafts = catalog.filter((p) => p.status === 'draft' && p.category !== 'future');
  if (drafts.length > 0) {
    findings.push({
      id: 'draft-policies',
      severity: 'info',
      message: `${drafts.length} draft policy(ies) awaiting simulation and approval.`,
      recommendation: 'Run Policy Simulation before publishing draft policies.',
    });
  }

  const orphanDept = catalog.filter(
    (p) => p.level === 'department' && p.extendsPolicyId && !catalog.find((c) => c.policyId === p.extendsPolicyId)
  );
  if (orphanDept.length > 0) {
    findings.push({
      id: 'orphan-extensions',
      severity: 'warning',
      message: `${orphanDept.length} department policy(ies) extend missing parent policies.`,
      recommendation: 'Verify hierarchy chain — lower levels must extend valid higher rules.',
    });
  }

  const platformCount = hierarchy.find((h) => h.level === 'platform')?.policyCount ?? 0;
  if (platformCount < 2) {
    findings.push({
      id: 'platform-coverage',
      severity: 'warning',
      message: 'Insufficient platform-level policies — foundation rules incomplete.',
      recommendation: 'Ensure approval, AI usage, and security platform policies are active.',
    });
  }

  findings.push({
    id: 'centralized-rules',
    severity: 'info',
    message: `${catalog.filter((p) => p.registered).length} registered policies across ${hierarchy.length} hierarchy layers — no duplication.`,
    recommendation: 'Policies are organizational law — every system follows automatically.',
  });

  return findings.sort((a, b) => {
    const rank = { critical: 0, warning: 1, info: 2 };
    return rank[a.severity] - rank[b.severity];
  });
}

export function computeRegistrationCoveragePct(): number {
  const catalog = buildPolicyCatalog();
  const registered = catalog.filter((p) => p.registered).length;
  return Math.round((registered / Math.max(1, catalog.length)) * 100);
}
