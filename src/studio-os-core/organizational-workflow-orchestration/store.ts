import {
  ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_STORAGE_KEY,
  ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_VERSION,
  OWF_WORKFLOW_PHILOSOPHY,
} from './constants';
import type {
  OrganizationalWorkflowOrchestrationStore,
  OrganizationalWorkflowOrchestrationWorkspaceId,
} from './types';

function emptyStore(): OrganizationalWorkflowOrchestrationStore {
  return {
    version: ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    activeWorkspaceId: 'ndxbook',
    companyName: '',
    dashboard: {
      summary: '',
      activeWorkflows: 0,
      departmentCollaborations: 0,
      completedInitiatives: 0,
      organizationalConfidencePct: 0,
      workflowHealthPct: 0,
      learningOpportunities: 0,
    },
    workflowPhilosophy: [...OWF_WORKFLOW_PHILOSOPHY],
    workflowTypes: [],
    activeWorkflows: [],
    crossFunctionalCoordination: [],
    workflowIntelligence: [],
    livingWorkflowAdaptations: [],
    chiefOfStaffCoordination: [],
    workflowTransparency: [],
    organizationalAdaptations: [],
    workflowMemory: [],
    workflowSimulations: [],
    recommendedOptimizations: [],
    recommendedNextSteps: [],
    futureOpportunities: [],
  };
}

export function readOrganizationalWorkflowOrchestrationStore(): OrganizationalWorkflowOrchestrationStore {
  if (typeof localStorage === 'undefined') return emptyStore();
  try {
    const raw = localStorage.getItem(ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as OrganizationalWorkflowOrchestrationStore;
    return { ...emptyStore(), ...parsed, version: ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_VERSION };
  } catch {
    return emptyStore();
  }
}

export function writeOrganizationalWorkflowOrchestrationStore(store: OrganizationalWorkflowOrchestrationStore): void {
  if (typeof localStorage === 'undefined') return;
  localStorage.setItem(
    ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_STORAGE_KEY,
    JSON.stringify({
      ...store,
      lastUpdatedAt: new Date().toISOString(),
      version: ORGANIZATIONAL_WORKFLOW_ORCHESTRATION_VERSION,
    })
  );
}

export function bootstrapOrganizationalWorkflowOrchestrationStore(
  seed?: Partial<OrganizationalWorkflowOrchestrationStore>
): void {
  const existing = readOrganizationalWorkflowOrchestrationStore();
  if (existing.activeWorkflows.length > 0) return;
  writeOrganizationalWorkflowOrchestrationStore({ ...emptyStore(), ...seed });
}

export function selectOrganizationalWorkflowOrchestrationWorkspace(
  id: OrganizationalWorkflowOrchestrationWorkspaceId
): void {
  const store = readOrganizationalWorkflowOrchestrationStore();
  writeOrganizationalWorkflowOrchestrationStore({ ...store, activeWorkspaceId: id });
}
