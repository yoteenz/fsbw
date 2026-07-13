import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';

export const DEPARTMENT_RELATIONSHIP_VERSION = 'department-relationship.v1' as const;

export type DepartmentRelationshipEdge = {
  edgeVersion: typeof DEPARTMENT_RELATIONSHIP_VERSION;
  from: CanonicalMainDepartmentId;
  to: CanonicalMainDepartmentId;
  relationshipType: 'hands-off' | 'depends-on' | 'approves' | 'publishes-to' | 'certifies' | 'installs-to';
  label: string;
};

export type DepartmentRelationshipGraph = {
  graphVersion: typeof DEPARTMENT_RELATIONSHIP_VERSION;
  graphRevision: number;
  nodes: CanonicalMainDepartmentId[];
  edges: DepartmentRelationshipEdge[];
  canonicalPipeline: CanonicalMainDepartmentId[];
};
