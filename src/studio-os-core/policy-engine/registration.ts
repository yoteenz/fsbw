import type { PolicyEntry } from './types';
import { buildPolicyCatalog, getPolicyEntry } from './policy-catalog';
import { verifyWorkflowCompliance } from './enforcement-engine';

const customPolicies: PolicyEntry[] = [];

export function registerPolicy(entry: PolicyEntry): PolicyEntry {
  const registered = { ...entry, registered: true, lastUpdated: new Date().toISOString() };
  const idx = customPolicies.findIndex((p) => p.policyId === entry.policyId);
  if (idx >= 0) customPolicies[idx] = registered;
  else customPolicies.push(registered);
  return registered;
}

export function getAllPolicies(): PolicyEntry[] {
  const byId = new Map(buildPolicyCatalog().map((p) => [p.policyId, p]));
  for (const custom of customPolicies) {
    byId.set(custom.policyId, custom);
  }
  return [...byId.values()];
}

export function getRegisteredPolicy(policyId: string): PolicyEntry | undefined {
  return getAllPolicies().find((p) => p.policyId === policyId) ?? getPolicyEntry(policyId);
}

/** Gate — workflows must pass policy compliance before execution. */
export function canWorkflowExecute(
  workflowId: string,
  context?: Parameters<typeof verifyWorkflowCompliance>[2]
): boolean {
  return verifyWorkflowCompliance(workflowId, workflowId, context).compliant;
}
