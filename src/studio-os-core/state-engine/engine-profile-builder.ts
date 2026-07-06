import { getOrganizationWorkflowEngineProfile } from '../workflow-engine/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildStateRecommendations,
  computeLifecycleCoveragePct,
  runStateGovernanceAudit,
} from './governance-engine';
import {
  buildStateHistoryRecords,
  computeHistoryCompletenessPct,
  countFailedToday,
  countObjectsAwaitingApproval,
  countPausedObjects,
} from './history-engine';
import { buildStateObjectCatalog, countManagedObjects } from './object-catalog';
import { buildLifecycleStateCatalog, countNonTerminalStates } from './state-catalog';
import { buildCanonicalTransitionRules, computeTransitionIntegrityPct } from './transition-engine';
import type { OrganizationStateEngineProfile } from './types';

export function buildDockConsistencyLine(profile: OrganizationStateEngineProfile): string {
  return `State Engine™ ${profile.consistencyScore}% — ${profile.lifecycleStates.length} states · ${profile.stateObjects.length} object types · ${profile.historyCompletenessPct}% history complete.`;
}

export function buildOrganizationStateEngineProfile(organizationId: string): OrganizationStateEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const workflow = getOrganizationWorkflowEngineProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();
  const lifecycleStates = buildLifecycleStateCatalog();
  const stateObjects = buildStateObjectCatalog();
  const transitionRules = buildCanonicalTransitionRules();
  const historyRecords = buildStateHistoryRecords(organizationId);
  const lifecycleCoveragePct = computeLifecycleCoveragePct(lifecycleStates.length, stateObjects.length);
  const transitionIntegrityPct = computeTransitionIntegrityPct();
  const historyCompletenessPct = computeHistoryCompletenessPct();
  const objectsAwaitingApproval = countObjectsAwaitingApproval(historyRecords);
  const pausedObjectCount = countPausedObjects(historyRecords);
  const failedTodayCount = countFailedToday(historyRecords);
  const governanceFindings = runStateGovernanceAudit();

  const workflowBoost = workflow ? Math.round(workflow.choreographyScore / 20) : 0;
  const consistencyScore = Math.min(
    99,
    Math.round(
      (lifecycleCoveragePct + transitionIntegrityPct + historyCompletenessPct + workflowBoost) / 3 -
        failedTodayCount * 2
    )
  );

  const profile: OrganizationStateEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    consistencyScore,
    lifecycleCoveragePct,
    transitionIntegrityPct,
    historyCompletenessPct,
    lifecycleStates,
    stateObjects,
    transitionRules,
    historyRecords,
    governanceFindings,
    recommendations: buildStateRecommendations(objectsAwaitingApproval, failedTodayCount),
    objectsAwaitingApproval,
    pausedObjectCount,
    failedTodayCount,
    dockConsistencyLine: '',
    predictableLifecycle: true,
    lastSyncedAt: now,
  };

  profile.dockConsistencyLine = buildDockConsistencyLine(profile);
  return profile;
}

export function summarizeStateEngine(profile: OrganizationStateEngineProfile): string {
  return `${profile.dockConsistencyLine} ${countManagedObjects()} managed objects · ${countNonTerminalStates()} active lifecycle states.`;
}
