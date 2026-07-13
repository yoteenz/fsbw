import type { CanonicalMainDepartmentId } from '../../canonical-studio-world/canonical-department-registry';
import { DEPARTMENT_BIBLE_REGISTRY } from '../registry/bible-registry';
import type { DepartmentRelationshipEdge, DepartmentRelationshipGraph } from '../schemas/relationships';
import { DEPARTMENT_RELATIONSHIP_VERSION } from '../schemas/relationships';

export const CANONICAL_PIPELINE: CanonicalMainDepartmentId[] = [
  'experience-lab',
  'creative-director-studio',
  'construction-mode',
  'quality-guard',
  'immune-system',
  'studio-world-registry',
];

export const MARKETPLACE_PIPELINE: CanonicalMainDepartmentId[] = [
  'marketplace',
  'city-council',
  'certification-center',
  'mod-registry',
];

function edge(
  from: CanonicalMainDepartmentId,
  to: CanonicalMainDepartmentId,
  type: DepartmentRelationshipEdge['relationshipType'],
  label: string
): DepartmentRelationshipEdge {
  return { edgeVersion: DEPARTMENT_RELATIONSHIP_VERSION, from, to, relationshipType: type, label };
}

function buildEdges(): DepartmentRelationshipEdge[] {
  const edges: DepartmentRelationshipEdge[] = [];

  for (let i = 0; i < CANONICAL_PIPELINE.length - 1; i++) {
    edges.push(edge(CANONICAL_PIPELINE[i], CANONICAL_PIPELINE[i + 1], 'hands-off', 'canonical pipeline'));
  }

  for (let i = 0; i < MARKETPLACE_PIPELINE.length - 1; i++) {
    edges.push(edge(MARKETPLACE_PIPELINE[i], MARKETPLACE_PIPELINE[i + 1], 'certifies', 'marketplace pipeline'));
  }

  for (const [deptId, bible] of Object.entries(DEPARTMENT_BIBLE_REGISTRY)) {
    const from = deptId as CanonicalMainDepartmentId;
    for (const to of bible.handsWorkTo) {
      if (!edges.some((e) => e.from === from && e.to === to)) {
        edges.push(edge(from, to, 'hands-off', `${from} → ${to}`));
      }
    }
    for (const upstream of bible.receivesWorkFrom) {
      if (!edges.some((e) => e.from === upstream && e.to === from)) {
        edges.push(edge(upstream, from, 'depends-on', `${upstream} feeds ${from}`));
      }
    }
  }

  return edges;
}

export const DEPARTMENT_RELATIONSHIP_GRAPH: DepartmentRelationshipGraph = {
  graphVersion: DEPARTMENT_RELATIONSHIP_VERSION,
  graphRevision: 1,
  nodes: Object.keys(DEPARTMENT_BIBLE_REGISTRY) as CanonicalMainDepartmentId[],
  edges: buildEdges(),
  canonicalPipeline: CANONICAL_PIPELINE,
};

export function queryDownstream(departmentId: CanonicalMainDepartmentId): CanonicalMainDepartmentId[] {
  return DEPARTMENT_RELATIONSHIP_GRAPH.edges
    .filter((e) => e.from === departmentId)
    .map((e) => e.to);
}

export function queryUpstream(departmentId: CanonicalMainDepartmentId): CanonicalMainDepartmentId[] {
  return DEPARTMENT_RELATIONSHIP_GRAPH.edges
    .filter((e) => e.to === departmentId)
    .map((e) => e.from);
}

export function formatRelationshipChain(departments: CanonicalMainDepartmentId[]): string {
  return departments.join(' → ');
}
