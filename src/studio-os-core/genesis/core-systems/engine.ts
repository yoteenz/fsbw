import { ensureCoreSystemsStore, readCoreSystemsStore } from './persistence';
import {
  listSystemRegistry,
  getCoreSystem,
  searchSystemRegistry,
  listSystemsByDomain,
  listSystemsByLifecycleState,
  getSystemRegistryStats,
  getCanonicalSystemCoverage,
  listSystemsDependingOn,
} from './registry/system-registry';
import {
  registerSystemDependency,
  listDependencyRegistry,
  listDependenciesForSystem,
  listOutboundDependencies,
  listInboundDependencies,
  getDependencyGraph,
  detectCircularDependencies,
} from './registry/dependency-registry';
import {
  registerSystemCapability,
  listCapabilityRegistry,
  listCapabilitiesForSystem,
  listPublicCapabilities,
  getCapabilityCoverage,
} from './registry/capability-registry';
import {
  defineSystemBoundary,
  listBoundaryDefinitions,
  getSystemBoundary,
  validateBoundaryOwnership,
} from './boundaries/definitions';
import {
  registerIntegrationContract,
  listIntegrationContracts,
  listContractsForSystem,
  listActiveContracts,
  activateIntegrationContract,
  deprecateIntegrationContract,
} from './contracts/integration';
import {
  registerExpansionHook,
  listExpansionHooks,
  listExpansionHooksForSystem,
  resolveExpansionHooks,
} from './hooks/expansion';
import {
  transitionSystemLifecycle,
  listLifecycleHistory,
  getCurrentLifecycleState,
  listAllowedLifecycleTransitions,
  getCoreSystemLifecycleSummary,
} from './lifecycle/management';
import {
  registerCoreSystem,
  updateCoreSystem,
  validateCoreSystemEnvelope,
  validateCoreSystemsStore,
  createCoreSystemId,
} from './systems/engine';
import {
  ingestCoreSystemPayload,
  ingestCoreSystemBatch,
  ingestIntegrationContractPayload,
  ingestExpansionHookPayload,
} from './content/loader';
import {
  CORE_SYSTEMS_SUBSYSTEM_NAME,
  CORE_SYSTEMS_SUBSYSTEM_VERSION,
  CORE_SYSTEM_DOMAINS,
  SYSTEM_DEPENDENCY_CLASSES,
  SYSTEM_LIFECYCLE_STATES,
  CANONICAL_CORE_SYSTEMS,
  CANONICAL_CORE_SYSTEM_IDS,
  CORE_SYSTEM_CONTENT_HOMES,
} from './constants';
import type { CoreSystemsRegistryStats } from './types';

export function ensureCoreSystemsSubsystem() {
  return ensureCoreSystemsStore();
}

export function getCoreSystemsPlatformStats(): CoreSystemsRegistryStats {
  const store = readCoreSystemsStore();
  const systemStats = getSystemRegistryStats();

  return {
    systemCount: systemStats.systemCount,
    activeSystemCount: systemStats.activeSystemCount,
    dependencyCount: store.dependencies.length,
    capabilityCount: store.capabilities.length,
    boundaryCount: store.boundaries.length,
    contractCount: store.contracts.length,
    expansionHookCount: store.expansionHooks.length,
    lifecycleTransitionCount: store.lifecycleHistory.length,
    domainCoverage: systemStats.domainCoverage,
  };
}

export {
  CORE_SYSTEMS_SUBSYSTEM_NAME,
  CORE_SYSTEMS_SUBSYSTEM_VERSION,
  CORE_SYSTEM_DOMAINS,
  SYSTEM_DEPENDENCY_CLASSES,
  SYSTEM_LIFECYCLE_STATES,
  CANONICAL_CORE_SYSTEMS,
  CANONICAL_CORE_SYSTEM_IDS,
  CORE_SYSTEM_CONTENT_HOMES,
  readCoreSystemsStore,
  ensureCoreSystemsStore,
  listSystemRegistry,
  getCoreSystem,
  searchSystemRegistry,
  listSystemsByDomain,
  listSystemsByLifecycleState,
  getSystemRegistryStats,
  getCanonicalSystemCoverage,
  listSystemsDependingOn,
  registerSystemDependency,
  listDependencyRegistry,
  listDependenciesForSystem,
  listOutboundDependencies,
  listInboundDependencies,
  getDependencyGraph,
  detectCircularDependencies,
  registerSystemCapability,
  listCapabilityRegistry,
  listCapabilitiesForSystem,
  listPublicCapabilities,
  getCapabilityCoverage,
  defineSystemBoundary,
  listBoundaryDefinitions,
  getSystemBoundary,
  validateBoundaryOwnership,
  registerIntegrationContract,
  listIntegrationContracts,
  listContractsForSystem,
  listActiveContracts,
  activateIntegrationContract,
  deprecateIntegrationContract,
  registerExpansionHook,
  listExpansionHooks,
  listExpansionHooksForSystem,
  resolveExpansionHooks,
  transitionSystemLifecycle,
  listLifecycleHistory,
  getCurrentLifecycleState,
  listAllowedLifecycleTransitions,
  getCoreSystemLifecycleSummary,
  registerCoreSystem,
  updateCoreSystem,
  validateCoreSystemEnvelope,
  validateCoreSystemsStore,
  createCoreSystemId,
  ingestCoreSystemPayload,
  ingestCoreSystemBatch,
  ingestIntegrationContractPayload,
  ingestExpansionHookPayload,
};

export type {
  CoreSystemsRegistryStats,
  CoreSystemBlueprint,
  SystemDependencyRecord,
  SystemCapabilityRecord,
  SystemBoundaryDefinition,
  IntegrationContract,
  ExpansionHookRecord,
  SystemLifecycleTransition,
  CoreSystemValidationReport,
} from './types';

export type { RegisterCoreSystemInput } from './systems/engine';
export type { CoreSystemPayload, IntegrationContractPayload, ExpansionHookPayload } from './content/loader';
