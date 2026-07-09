import type { ModuleTenantId } from '../workspace/tenant-ids';
import { getCompanyRegistryEntry } from './company-registry/registry';
import { computeDependents, getSystemStats } from './business-systems/registry';
import { buildDependencyGraphNodes, getCriticalPathSystems } from './business-dependencies/graph';
import { listBusinessFlows, traverseFlow, validateFlowIntegrity } from './business-flows/engine';
import { getCriticalRiskCount } from './business-risks/registry';
import type {
  BusinessCompanyGenomeStore,
  BusinessFlowType,
  BusinessGenomeDashboard,
  BusinessVisualizationId,
} from './business-types';
import {
  buildFrontalSlayerBusinessDependencies,
  FRONTAL_SLAYER_AI_OPPORTUNITIES,
  FRONTAL_SLAYER_AUTOMATION_OPPORTUNITIES,
  FRONTAL_SLAYER_BUSINESS_EVENTS,
  FRONTAL_SLAYER_BUSINESS_FLOWS,
  FRONTAL_SLAYER_BUSINESS_RISKS,
  FRONTAL_SLAYER_BUSINESS_SYSTEMS,
} from './business-systems/seeds/frontal-slayer';
import { bootstrapBusinessCompanyGenomeStore, readBusinessCompanyGenomeStore } from './business-store';

export function buildBusinessGenomeSeed(orgId: ModuleTenantId): Partial<BusinessCompanyGenomeStore> {
  if (orgId === 'frontal-slayer') {
    const systems = computeDependents(FRONTAL_SLAYER_BUSINESS_SYSTEMS);
    return {
      organizationId: orgId,
      company: getCompanyRegistryEntry(orgId),
      systems,
      dependencies: buildFrontalSlayerBusinessDependencies(systems),
      flows: FRONTAL_SLAYER_BUSINESS_FLOWS,
      events: FRONTAL_SLAYER_BUSINESS_EVENTS,
      risks: FRONTAL_SLAYER_BUSINESS_RISKS,
      automationOpportunities: FRONTAL_SLAYER_AUTOMATION_OPPORTUNITIES,
      aiOpportunities: FRONTAL_SLAYER_AI_OPPORTUNITIES,
      activeVisualization: 'interactive-genome',
      selectedSystemId: systems[0]?.systemId ?? null,
    };
  }

  const company = getCompanyRegistryEntry(orgId);
  return {
    organizationId: orgId,
    company,
    systems: [],
    dependencies: [],
    flows: [],
    events: [],
    risks: [],
    automationOpportunities: [],
    aiOpportunities: [],
    activeVisualization: 'interactive-genome',
    selectedSystemId: null,
  };
}

export function getBusinessGenomeDashboard(store: BusinessCompanyGenomeStore): BusinessGenomeDashboard {
  const stats = getSystemStats(store.systems);
  return {
    systemCount: stats.total,
    activeSystems: stats.active,
    dependencyCount: store.dependencies.length,
    flowCount: store.flows.length,
    eventCount: store.events.length,
    riskCount: store.risks.length,
    criticalRisks: getCriticalRiskCount(store.risks),
    automationCount: store.automationOpportunities.length,
    aiOpportunityCount: store.aiOpportunities.length,
    avgAutomationScore: stats.avgAutomation,
    avgAiReadiness: stats.avgAi,
  };
}

export function consultBusinessCompanyGenome(): {
  store: BusinessCompanyGenomeStore;
  dashboard: BusinessGenomeDashboard;
  dependencyNodes: ReturnType<typeof buildDependencyGraphNodes>;
  criticalSystems: ReturnType<typeof getCriticalPathSystems>;
  flowIssues: string[];
} {
  const store = readBusinessCompanyGenomeStore();
  return {
    store,
    dashboard: getBusinessGenomeDashboard(store),
    dependencyNodes: buildDependencyGraphNodes(store.systems, store.dependencies),
    criticalSystems: getCriticalPathSystems(store.systems, store.dependencies),
    flowIssues: validateFlowIntegrity(store.flows, store.systems),
  };
}

export function getVisualizationFlows(
  store: BusinessCompanyGenomeStore,
  visualization: BusinessVisualizationId
) {
  const flowTypeMap: Partial<Record<BusinessVisualizationId, BusinessFlowType>> = {
    'revenue-flow': 'revenue',
    'customer-journey': 'customer',
    'founder-workflow': 'founder',
  };
  const flowType = flowTypeMap[visualization];
  const flows = listBusinessFlows(store.flows, flowType);
  return flows.map((flow) => traverseFlow(flow, store.systems));
}

export function getSelectedBusinessSystem(store: BusinessCompanyGenomeStore) {
  if (!store.selectedSystemId) return store.systems[0] ?? null;
  return store.systems.find((s) => s.systemId === store.selectedSystemId) ?? null;
}

/** Seed business genome for a specific workspace (avoids storage race on direct URL loads). */
export function ensureBusinessCompanyGenomeSeeded(platformWorkspaceId: string): void {
  const orgId = platformWorkspaceId as ModuleTenantId;
  bootstrapBusinessCompanyGenomeStore(buildBusinessGenomeSeed(orgId), platformWorkspaceId);
}
