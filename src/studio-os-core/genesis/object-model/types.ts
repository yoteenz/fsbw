import type { CanonicalLifecycleState, CanonicalObjectTypeId } from './constants';
import type { GenesisVersion } from '../types';

export type CanonicalCanonicalStatus =
  | 'non-canonical'
  | 'working'
  | 'review-pending'
  | 'canonical'
  | 'historical';

export type CanonicalObjectOwner = {
  steward: string;
  institution?: string;
  department?: string;
};

export type CanonicalObjectReference = {
  refId: string;
  label: string;
  relationship?: string;
};

export type CanonicalObjectRevision = {
  revisionId: string;
  version: GenesisVersion;
  summary: string;
  author: string;
  changeNote: string;
  createdAt: string;
  snapshot?: Partial<CanonicalObject>;
};

export type CanonicalRelationship = {
  id: string;
  fromObjectId: string;
  toObjectId: string;
  /** Extensible — core verbs plus future custom types */
  type: string;
  required?: boolean;
  rationale?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

/** Canonical Object Model™ — every Studio World object */
export type CanonicalObject = {
  objectId: string;
  objectType: CanonicalObjectTypeId;
  officialName: string;
  description: string;
  version: GenesisVersion;
  lifecycleState: CanonicalLifecycleState;
  owner: CanonicalObjectOwner;
  dependencies: string[];
  tags: string[];
  metadata: Record<string, unknown>;
  references: CanonicalObjectReference[];
  revisionHistory: CanonicalObjectRevision[];
  canonicalStatus: CanonicalCanonicalStatus;
  /** Parent type when using inheritance */
  inheritsFrom?: CanonicalObjectTypeId;
  createdAt: string;
  updatedAt: string;
};

export type CanonicalHistoricalEntry = {
  historyId: string;
  objectId: string;
  revision: CanonicalObjectRevision;
  archivedAt: string;
  reason: string;
};

export type ObjectModelValidationIssue = {
  code: string;
  message: string;
  objectId?: string;
  relationshipId?: string;
};

export type ObjectModelValidationReport = {
  valid: boolean;
  objectCount: number;
  relationshipCount: number;
  issues: ObjectModelValidationIssue[];
};

export type ObjectModelGraphNode = {
  objectId: string;
  objectType: CanonicalObjectTypeId;
  officialName: string;
  depth: number;
};

export type ObjectModelGraphTraversal = {
  rootObjectId: string;
  direction: 'outgoing' | 'incoming' | 'both';
  maxDepth: number;
  nodes: ObjectModelGraphNode[];
  edges: CanonicalRelationship[];
};

export type ObjectModelStore = {
  version: string;
  objects: CanonicalObject[];
  relationships: CanonicalRelationship[];
  historicalArchive: CanonicalHistoricalEntry[];
  bootstrappedAt?: string;
};

export type ObjectModelRegistryStats = {
  objectCount: number;
  canonicalCount: number;
  relationshipCount: number;
  typeCount: number;
  contradictionCount: number;
  brokenReferenceCount: number;
  historicalEntryCount: number;
};

export type WorldGraphExportNode = {
  id: string;
  type: CanonicalObjectTypeId;
  label: string;
  canonicalStatus: CanonicalCanonicalStatus;
};

export type WorldGraphExportEdge = {
  id: string;
  from: string;
  to: string;
  type: string;
};

export type WorldGraphExportPreview = {
  nodeCount: number;
  edgeCount: number;
  nodes: WorldGraphExportNode[];
  edges: WorldGraphExportEdge[];
};
