import type { ResidentId, ResidentRelationshipEdge } from './types';

export type RelationshipGraph = {
  edges: ResidentRelationshipEdge[];
  byResident: Map<ResidentId, ResidentRelationshipEdge[]>;
};

export function buildRelationshipGraph(edges: ResidentRelationshipEdge[]): RelationshipGraph {
  const byResident = new Map<ResidentId, ResidentRelationshipEdge[]>();
  for (const edge of edges) {
    appendEdge(byResident, edge.personAId, edge);
    if (edge.mutual) {
      appendEdge(byResident, edge.personBId, edge);
    } else {
      appendEdge(byResident, edge.personBId, edge);
    }
  }
  return { edges, byResident };
}

function appendEdge(map: Map<ResidentId, ResidentRelationshipEdge[]>, id: ResidentId, edge: ResidentRelationshipEdge) {
  const list = map.get(id) ?? [];
  list.push(edge);
  map.set(id, list);
}

export function validateRelationshipPairs(edges: ResidentRelationshipEdge[]): string[] {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const edge of edges) {
    if (edge.personAId === edge.personBId) {
      errors.push(`Self-relationship: ${edge.id}`);
    }
    const key = pairKey(edge.personAId, edge.personBId, edge.relationshipType, edge.label);
    if (seen.has(key)) {
      errors.push(`Duplicate relationship key: ${key}`);
    }
    seen.add(key);
    if (edge.trustLevel < 0 || edge.trustLevel > 5) errors.push(`Invalid trust on ${edge.id}`);
  }
  return errors;
}

function pairKey(a: ResidentId, b: ResidentId, type: string, label: string): string {
  const [x, y] = a < b ? [a, b] : [b, a];
  return `${x}|${y}|${type}|${label}`;
}

export function getRelationshipBetween(
  graph: RelationshipGraph,
  a: ResidentId,
  b: ResidentId
): ResidentRelationshipEdge[] {
  return graph.edges.filter(
    (e) =>
      (e.personAId === a && e.personBId === b) ||
      (e.personAId === b && e.personBId === a) ||
      (e.mutual && ((e.personAId === a && e.personBId === b) || (e.personAId === b && e.personBId === a)))
  );
}
