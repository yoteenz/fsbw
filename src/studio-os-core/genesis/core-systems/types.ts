import type {
  CoreSystemDomain,
  DependencyRelationType,
  ExpansionHookType,
  IntegrationContractStatus,
  SystemDependencyClass,
  SystemLifecycleState,
} from './constants';
import type { GenesisVersion } from '../types';

export type CoreSystemRelationship = {
  type: string;
  targetSystemId: string;
  description?: string;
};

export type CoreSystemService = {
  serviceId: string;
  name: string;
  description?: string;
  publicInterface?: string;
};

export type CoreSystemEvent = {
  eventId: string;
  name: string;
  description?: string;
};

export type CoreSystemExpansionPoint = {
  expansionPointId: string;
  name: string;
  description?: string;
  hookType?: ExpansionHookType | string;
};

/** Core Systems Blueprint envelope — every registered system */
export type CoreSystemBlueprint = {
  systemId: string;
  officialName: string;
  domain: CoreSystemDomain | string;
  dependencyClass?: SystemDependencyClass | string;
  responsibilities: string[];
  capabilities: string[];
  dependencies: string[];
  relationships: CoreSystemRelationship[];
  ownedObjects: string[];
  events: CoreSystemEvent[];
  services: CoreSystemService[];
  publicInterfaces: string[];
  version: GenesisVersion;
  lifecycleState: SystemLifecycleState;
  expansionPoints: CoreSystemExpansionPoint[];
  purpose?: string;
  contentHome?: string;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

export type SystemDependencyRecord = {
  dependencyId: string;
  fromSystemId: string;
  toSystemId: string;
  relationType: DependencyRelationType | string;
  dependencyClass?: SystemDependencyClass | string;
  description?: string;
  createdAt: string;
};

export type SystemCapabilityRecord = {
  capabilityId: string;
  systemId: string;
  capabilityKey: string;
  description?: string;
  isPublic: boolean;
  createdAt: string;
};

export type SystemBoundaryDefinition = {
  boundaryId: string;
  systemId: string;
  owns: string[];
  doesNotOwn: string[];
  inboundInterfaces: string[];
  outboundInterfaces: string[];
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type IntegrationContract = {
  contractId: string;
  providerSystemId: string;
  consumerSystemId: string;
  interfaceName: string;
  version: GenesisVersion;
  status: IntegrationContractStatus;
  description?: string;
  createdAt: string;
  updatedAt: string;
};

export type ExpansionHookRecord = {
  hookId: string;
  systemId: string;
  hookName: string;
  hookType: ExpansionHookType | string;
  description?: string;
  expansionPointId?: string;
  createdAt: string;
};

export type SystemLifecycleTransition = {
  transitionId: string;
  systemId: string;
  fromState: SystemLifecycleState;
  toState: SystemLifecycleState;
  reason: string;
  actorObjectId?: string;
  transitionedAt: string;
};

export type CoreSystemsStore = {
  version: string;
  systems: CoreSystemBlueprint[];
  dependencies: SystemDependencyRecord[];
  capabilities: SystemCapabilityRecord[];
  boundaries: SystemBoundaryDefinition[];
  contracts: IntegrationContract[];
  expansionHooks: ExpansionHookRecord[];
  lifecycleHistory: SystemLifecycleTransition[];
  bootstrappedAt?: string;
};

export type CoreSystemsRegistryStats = {
  systemCount: number;
  activeSystemCount: number;
  dependencyCount: number;
  capabilityCount: number;
  boundaryCount: number;
  contractCount: number;
  expansionHookCount: number;
  lifecycleTransitionCount: number;
  domainCoverage: { domain: string; count: number }[];
};

export type CoreSystemValidationReport = {
  valid: boolean;
  issues: { code: string; message: string; systemId?: string }[];
};
