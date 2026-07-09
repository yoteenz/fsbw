/** Business Company Genome™ — living business dependency graph infrastructure. */

import type { ModuleTenantId } from '../workspace/tenant-ids';

export type BusinessImpactLevel = 'critical' | 'high' | 'medium' | 'low' | 'expansion';
export type OperationalStatus = 'active' | 'planned' | 'at-risk' | 'deprecated';
export type BusinessEngineClass = 'desire' | 'product' | 'client' | 'revenue' | 'operating';
export type BusinessSystemClass =
  | 'core'
  | 'supporting'
  | 'revenue'
  | 'customer'
  | 'knowledge'
  | 'creative'
  | 'operational'
  | 'expansion';

export type BusinessVisualizationId =
  | 'interactive-genome'
  | 'dependency-graph'
  | 'revenue-flow'
  | 'customer-journey'
  | 'founder-workflow'
  | 'automation-map'
  | 'risk-map'
  | 'ai-opportunity-map';

export type DependencyRelationshipType =
  | 'upstream'
  | 'downstream'
  | 'data'
  | 'event'
  | 'revenue'
  | 'operational';

export type BusinessFlowType =
  | 'revenue'
  | 'customer'
  | 'founder'
  | 'operational'
  | 'knowledge'
  | 'expansion';

export type RiskCategory =
  | 'single-point-of-failure'
  | 'bottleneck'
  | 'duplicate-responsibility'
  | 'missing-system';

export type AiHorizon = 'near-term' | 'mid-term' | 'long-term';

/** Company Registry™ entry */
export type CompanyRegistryEntry = {
  companyId: ModuleTenantId;
  officialName: string;
  industry: string;
  thesis: string;
  engines: BusinessEngineClass[];
  growthLoop: string;
};

/** Business System Registry™ record */
export type BusinessSystem = {
  systemId: string;
  officialName: string;
  purpose: string;
  owner: string;
  dependencies: string[];
  dependents: string[];
  ownedData: string[];
  eventsProduced: string[];
  eventsConsumed: string[];
  businessRules: string[];
  operationalStatus: OperationalStatus;
  revenueImpact: BusinessImpactLevel;
  customerImpact: BusinessImpactLevel;
  automationScore: number;
  aiReadiness: number;
  expansionReadiness: number;
  engineClass: BusinessEngineClass;
  systemClass: BusinessSystemClass;
};

/** Dependency Graph™ edge */
export type BusinessDependency = {
  id: string;
  fromSystemId: string;
  toSystemId: string;
  relationshipType: DependencyRelationshipType;
  strength: number;
  description: string;
};

/** Operational Flow Engine™ step */
export type BusinessFlowStep = {
  systemId: string;
  label: string;
  eventId?: string;
};

/** Operational Flow Engine™ definition */
export type BusinessFlow = {
  id: string;
  name: string;
  flowType: BusinessFlowType;
  steps: BusinessFlowStep[];
  description: string;
};

/** Business Event Registry™ record */
export type BusinessEvent = {
  eventId: string;
  name: string;
  producerSystemId: string;
  consumerSystemIds: string[];
  description: string;
  category: string;
};

/** Risk Registry™ record */
export type BusinessRisk = {
  id: string;
  title: string;
  category: RiskCategory;
  affectedSystemIds: string[];
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  recommendedControl: string;
};

/** Automation Registry™ record */
export type AutomationOpportunity = {
  id: string;
  title: string;
  systemIds: string[];
  automationShape: string;
  priority: number;
  estimatedImpact: string;
};

/** AI Opportunity Registry™ record */
export type AiOpportunity = {
  id: string;
  title: string;
  horizon: AiHorizon;
  systemIds: string[];
  description: string;
  readinessScore: number;
};

/** Living business genome store — scoped per organization */
export type BusinessCompanyGenomeStore = {
  version: string;
  lastUpdatedAt: string;
  organizationId: ModuleTenantId;
  company: CompanyRegistryEntry;
  systems: BusinessSystem[];
  dependencies: BusinessDependency[];
  flows: BusinessFlow[];
  events: BusinessEvent[];
  risks: BusinessRisk[];
  automationOpportunities: AutomationOpportunity[];
  aiOpportunities: AiOpportunity[];
  activeVisualization: BusinessVisualizationId;
  selectedSystemId: string | null;
};

export type BusinessGenomeDashboard = {
  systemCount: number;
  activeSystems: number;
  dependencyCount: number;
  flowCount: number;
  eventCount: number;
  riskCount: number;
  criticalRisks: number;
  automationCount: number;
  aiOpportunityCount: number;
  avgAutomationScore: number;
  avgAiReadiness: number;
};

export type DependencyGraphNode = {
  systemId: string;
  officialName: string;
  engineClass: BusinessEngineClass;
  systemClass: BusinessSystemClass;
  inbound: number;
  outbound: number;
};

export type FlowTraversal = {
  flow: BusinessFlow;
  systems: BusinessSystem[];
  missingSystemIds: string[];
};
