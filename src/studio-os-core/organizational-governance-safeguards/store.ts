import {
  ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_STORAGE_KEY,
  ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_VERSION,
  OGS_GOVERNANCE_PHILOSOPHY,
} from './constants';
import type {
  OrganizationalGovernanceSafeguardsStore,
  OrganizationalGovernanceSafeguardsWorkspaceId,
} from './types';

function emptyStore(): OrganizationalGovernanceSafeguardsStore {
  return {
    version: ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      organizationalTrustPct: 0,
      policyHealthPct: 0,
      activeSafeguards: 0,
      pendingApprovals: 0,
      riskAlerts: 0,
      organizationalResiliencePct: 0,
    },
    governancePhilosophy: [...OGS_GOVERNANCE_PHILOSOPHY],
    constitutionalElements: [],
    governancePolicies: [],
    decisionSafeguards: [],
    executiveSafeguards: [],
    ethicalPrinciples: [],
    riskIntelligence: [],
    governanceSimulations: [],
    approvalLevels: [],
    governanceTransparency: [],
    continuousGovernance: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalGovernanceSafeguardsStore(): OrganizationalGovernanceSafeguardsStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalGovernanceSafeguardsStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalGovernanceSafeguardsStore(store: OrganizationalGovernanceSafeguardsStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_STORAGE_KEY,
    JSON.stringify({
      ...store,
      lastUpdatedAt: new Date().toISOString(),
      version: ORGANIZATIONAL_GOVERNANCE_SAFEGUARDS_VERSION,
    })
  );
}

export function bootstrapOrganizationalGovernanceSafeguardsStore(
  seed?: Partial<OrganizationalGovernanceSafeguardsStore>
): void {
  const existing = readOrganizationalGovernanceSafeguardsStore();
  if (existing.governancePolicies.length > 0) return;
  writeOrganizationalGovernanceSafeguardsStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalGovernanceSafeguardsWorkspace(
  id: OrganizationalGovernanceSafeguardsWorkspaceId
): void {
  const store = readOrganizationalGovernanceSafeguardsStore();
  writeOrganizationalGovernanceSafeguardsStore({ ...store, activeWorkspaceId: id });
}
