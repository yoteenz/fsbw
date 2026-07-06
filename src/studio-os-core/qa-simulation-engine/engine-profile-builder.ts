import { getOrganizationQaInspectorProfile } from '../qa-inspector/store';
import { getOrganizationProfessionBrainProfile } from '../profession-brain/store';
import {
  buildProductionGates,
  buildSimulationRuns,
  computeAverageSuccessRate,
  computeSimulationScore,
  resolveProductionGateStatus,
} from './simulation-engine';
import type { OrganizationQaSimulationEngineProfile } from './types';

export function buildDockSimulationLine(profile: OrganizationQaSimulationEngineProfile): string {
  return `QA Simulation Engine™ ${profile.simulationScore}% · ${profile.simulationsPassed}/${profile.simulationsRun} passed · gate ${profile.productionGateStatus} · practice field active.`;
}

export function buildOrganizationQaSimulationEngineProfile(
  organizationId: string
): OrganizationQaSimulationEngineProfile {
  const brain = getOrganizationProfessionBrainProfile(organizationId);
  const inspector = getOrganizationQaInspectorProfile(organizationId);
  const companyName = brain?.companyName ?? organizationId.replace(/-/g, ' ').toUpperCase();
  const now = new Date().toISOString();

  const recentSimulations = buildSimulationRuns(now);
  const productionGates = buildProductionGates(now);
  const simulationScore = computeSimulationScore(recentSimulations);
  const averageSuccessRate = computeAverageSuccessRate(recentSimulations);
  const simulationsPassed = recentSimulations.filter((r) => r.productionReady).length;

  const profile: OrganizationQaSimulationEngineProfile = {
    organizationId,
    companyName,
    updatedAt: now,
    simulationScore,
    averageSuccessRate,
    productionGateStatus: resolveProductionGateStatus(productionGates),
    simulationsRun: recentSimulations.length,
    simulationsPassed,
    recentSimulations,
    productionGates,
    dockSimulationLine: '',
    practiceFieldActive: true,
    lastSyncedAt: now,
  };

  if (inspector && inspector.criticalFindings > 0) {
    profile.productionGateStatus = 'blocked';
    productionGates[0].gateStatus = 'blocked';
    productionGates[0].blockedReason = `${inspector.criticalFindings} critical inspector findings must be resolved first.`;
  }

  profile.dockSimulationLine = buildDockSimulationLine(profile);
  return profile;
}

export function summarizeQaSimulationEngine(profile: OrganizationQaSimulationEngineProfile): string {
  return `${profile.dockSimulationLine} Rehearse before users encounter it.`;
}

export function canReachProduction(profile: OrganizationQaSimulationEngineProfile): boolean {
  return profile.productionGateStatus === 'cleared';
}
