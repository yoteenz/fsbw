import type {
  HIERARCHY_DOMAINS,
  HIERARCHY_LINK_TYPES,
  HIERARCHY_NODE_TYPES,
  ORGANIZATIONAL_HIERARCHY_PHILOSOPHY,
  STRUCTURE_TYPES,
} from './constants';

export type HierarchyPhilosophyLine = (typeof ORGANIZATIONAL_HIERARCHY_PHILOSOPHY)[number];
export type HierarchyNodeType = (typeof HIERARCHY_NODE_TYPES)[number];
export type StructureType = (typeof STRUCTURE_TYPES)[number];
export type HierarchyLinkType = (typeof HIERARCHY_LINK_TYPES)[number];
export type HierarchyDomain = (typeof HIERARCHY_DOMAINS)[number];

export type HierarchyNode = {
  id: string;
  label: string;
  nodeType: HierarchyNodeType;
  nodeTypeLabel: string;
  department?: string;
  location?: string;
  personId?: string;
  headcount: number;
  managerId: string | null;
  managerName: string | null;
  parentIds: string[];
  childIds: string[];
  structureTypes: StructureType[];
  summary: string;
  active: boolean;
};

export type HierarchyLink = {
  id: string;
  fromNodeId: string;
  fromLabel: string;
  toNodeId: string;
  toLabel: string;
  linkType: HierarchyLinkType;
  linkTypeLabel: string;
  strength: number;
  summary: string;
  bidirectional: boolean;
};

export type ApprovalRoute = {
  id: string;
  label: string;
  steps: string[];
  departments: string[];
  reason: string;
};

export type HierarchyInsight = {
  id: string;
  insight: string;
  category: 'routing' | 'matrix' | 'gap' | 'structure' | 'manager' | 'shared-service';
  severity: 'info' | 'watch' | 'attention';
  recommendedAction: string;
  relatedNodeIds: string[];
};

export type HierarchyDomainStatus = {
  domain: HierarchyDomain;
  label: string;
  score: number;
  count: number;
  summary: string;
};

export type StructureSupportSummary = {
  structureType: StructureType;
  structureTypeLabel: string;
  active: boolean;
  nodeCount: number;
  summary: string;
};

export type OrganizationHierarchyProfile = {
  organizationId: string;
  companyName: string;
  updatedAt: string;
  hierarchyScore: number;
  nodesMapped: number;
  linksMapped: number;
  departmentsCount: number;
  teamsCount: number;
  peopleCount: number;
  matrixAssignments: number;
  sharedServicesCount: number;
  structureTypesActive: number;
  nodes: HierarchyNode[];
  links: HierarchyLink[];
  approvalRoutes: ApprovalRoute[];
  insights: HierarchyInsight[];
  domainStatuses: HierarchyDomainStatus[];
  structureSupport: StructureSupportSummary[];
  selectedNodeId: string | null;
  dockHierarchyLine: string;
  functionsNotChart: true;
  syncedSources: string[];
  lastSyncedAt: string;
};

export type OrganizationalHierarchyStore = {
  version: string;
  profiles: OrganizationHierarchyProfile[];
};

export type OrganizationalHierarchyDockAdvice = {
  response: string;
  concierge: string;
  hierarchyScore?: number;
  nodesMapped?: number;
};

export type HierarchySearchHit = {
  type: 'node' | 'link' | 'route' | 'insight';
  id: string;
  label: string;
  score: number;
  matchReason: string;
};
