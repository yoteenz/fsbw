import { POLICY_LEVELS } from './constants';
import { buildPolicyCatalog } from './policy-catalog';
import type { PolicyHierarchyLayer } from './types';

const LAYER_DESCRIPTIONS: Record<(typeof POLICY_LEVELS)[number], string> = {
  platform: 'Studio OS platform rules — cannot be violated by lower levels',
  organization: 'Organization-wide policies defined once for all systems',
  department: 'Department standards extending organization policies',
  team: 'Team-specific rules within department boundaries',
  individual: 'Individual role and Concierge scope policies',
};

/** Build layered policy hierarchy — lower levels extend, never violate higher rules. */
export function buildPolicyHierarchy(): PolicyHierarchyLayer[] {
  const catalog = buildPolicyCatalog();

  return POLICY_LEVELS.map((level) => {
    const policies = catalog.filter((p) => p.level === level);
    return {
      level,
      label: level.replace('-', ' ').toUpperCase(),
      policyCount: policies.length,
      policyIds: policies.map((p) => p.policyId),
      description: LAYER_DESCRIPTIONS[level],
    };
  });
}

export function getApplicablePoliciesForLevel(
  targetLevel: (typeof POLICY_LEVELS)[number],
  department?: string
): ReturnType<typeof buildPolicyCatalog> {
  const catalog = buildPolicyCatalog();
  const levelRank = POLICY_LEVELS.indexOf(targetLevel);

  return catalog.filter((p) => {
    const policyRank = POLICY_LEVELS.indexOf(p.level);
    if (policyRank > levelRank) return false;
    if (p.level === 'department' && department && p.department && p.department !== department) return false;
    return p.status === 'active' && p.registered;
  });
}

export function resolvePolicyChain(policyId: string): ReturnType<typeof buildPolicyCatalog> {
  const catalog = buildPolicyCatalog();
  const entry = catalog.find((p) => p.policyId === policyId);
  if (!entry) return [];

  const chain: ReturnType<typeof buildPolicyCatalog> = [];
  let current: typeof entry | undefined = entry;

  while (current) {
    chain.unshift(current);
    current = current.parentPolicyId
      ? catalog.find((p) => p.policyId === current!.parentPolicyId)
      : current.extendsPolicyId
      ? catalog.find((p) => p.policyId === current!.extendsPolicyId)
      : undefined;
  }

  return chain;
}
