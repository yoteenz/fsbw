import { readObjectModelStore } from '../persistence';
import { getCanonicalObject } from '../object-factory/factory';
import { listCanonicalObjectRelationships } from '../object-relationships/engine';
import { validateComposition } from '../object-relationships/composition';
import { validateInheritance } from '../object-relationships/inheritance';
import { isCanonicalObjectType } from '../object-types/registry';
import type {
  CanonicalObject,
  ObjectModelGraphTraversal,
  ObjectModelValidationIssue,
  ObjectModelValidationReport,
  WorldGraphExportPreview,
} from '../types';

/** Validation Engine™ — object integrity and graph validation */
export function validateCanonicalObject(object: CanonicalObject): ObjectModelValidationIssue[] {
  const issues: ObjectModelValidationIssue[] = [];

  if (!object.objectId?.trim()) {
    issues.push({ code: 'missing-id', message: 'Object ID is required', objectId: object.objectId });
  }
  if (!object.officialName?.trim()) {
    issues.push({
      code: 'missing-name',
      message: 'Official Name is required',
      objectId: object.objectId,
    });
  }
  if (!object.description?.trim()) {
    issues.push({
      code: 'missing-description',
      message: 'Description is required',
      objectId: object.objectId,
    });
  }
  if (!isCanonicalObjectType(object.objectType)) {
    issues.push({
      code: 'invalid-type',
      message: `Invalid object type: ${object.objectType}`,
      objectId: object.objectId,
    });
  }
  if (!object.owner?.steward?.trim()) {
    issues.push({
      code: 'missing-owner',
      message: 'Owner steward is required',
      objectId: object.objectId,
    });
  }

  for (const dep of object.dependencies) {
    if (!getCanonicalObject(dep)) {
      issues.push({
        code: 'broken-dependency',
        message: `Dependency not found: ${dep}`,
        objectId: object.objectId,
      });
    }
  }

  for (const ref of object.references) {
    if (!getCanonicalObject(ref.refId)) {
      issues.push({
        code: 'broken-reference',
        message: `Reference not found: ${ref.refId}`,
        objectId: object.objectId,
      });
    }
  }

  for (const msg of validateInheritance(object)) {
    issues.push({ code: 'inheritance-invalid', message: msg, objectId: object.objectId });
  }

  for (const msg of validateComposition(object.objectId)) {
    issues.push({ code: 'composition-invalid', message: msg, objectId: object.objectId });
  }

  return issues;
}

export function assertCanonicalObjectIntegrity(object: CanonicalObject): void {
  const issues = validateCanonicalObject(object).filter(
    (i) =>
      i.code !== 'broken-dependency' &&
      i.code !== 'broken-reference' &&
      i.code !== 'inheritance-invalid' &&
      i.code !== 'composition-invalid'
  );
  if (issues.length > 0) {
    throw new Error(
      `Canonical object ${object.objectId} invalid: ${issues.map((i) => i.message).join('; ')}`
    );
  }
}

export function validateObjectModelStore(): ObjectModelValidationReport {
  const store = readObjectModelStore();
  const issues: ObjectModelValidationIssue[] = [];

  for (const object of store.objects) {
    issues.push(...validateCanonicalObject(object));
  }

  for (const rel of store.relationships) {
    if (!getCanonicalObject(rel.fromObjectId)) {
      issues.push({
        code: 'broken-edge-source',
        message: `Relationship source missing: ${rel.fromObjectId}`,
        relationshipId: rel.id,
      });
    }
    if (!getCanonicalObject(rel.toObjectId)) {
      issues.push({
        code: 'broken-edge-target',
        message: `Relationship target missing: ${rel.toObjectId}`,
        relationshipId: rel.id,
      });
    }
    if (rel.type === 'contradicts') {
      issues.push({
        code: 'contradiction-present',
        message: `Contradiction blocks canonical promotion: ${rel.fromObjectId} -> ${rel.toObjectId}`,
        relationshipId: rel.id,
        objectId: rel.fromObjectId,
      });
    }
  }

  const ids = store.objects.map((o) => o.objectId);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  for (const id of new Set(dupes)) {
    issues.push({ code: 'duplicate-id', message: `Duplicate object ID: ${id}`, objectId: id });
  }

  return {
    valid: issues.length === 0,
    objectCount: store.objects.length,
    relationshipCount: store.relationships.length,
    issues,
  };
}

/** Graph traversal for neighbors and World Graph prep */
export function traverseCanonicalObjectGraph(input: {
  rootObjectId: string;
  direction?: 'outgoing' | 'incoming' | 'both';
  maxDepth?: number;
  relationshipTypes?: string[];
}): ObjectModelGraphTraversal | undefined {
  const root = getCanonicalObject(input.rootObjectId);
  if (!root) return undefined;

  const direction = input.direction ?? 'both';
  const maxDepth = input.maxDepth ?? 3;
  const typeFilter = input.relationshipTypes?.length ? new Set(input.relationshipTypes) : null;

  const visited = new Set<string>();
  const nodes: ObjectModelGraphTraversal['nodes'] = [];
  const edges: ObjectModelGraphTraversal['edges'] = [];
  const queue: { id: string; depth: number }[] = [{ id: input.rootObjectId, depth: 0 }];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);

    const obj = getCanonicalObject(current.id);
    if (!obj) continue;

    nodes.push({
      objectId: obj.objectId,
      objectType: obj.objectType,
      officialName: obj.officialName,
      depth: current.depth,
    });

    if (current.depth >= maxDepth) continue;

    const rels = listCanonicalObjectRelationships().filter((r) => {
      if (typeFilter && !typeFilter.has(r.type)) return false;
      if (direction === 'outgoing') return r.fromObjectId === current.id;
      if (direction === 'incoming') return r.toObjectId === current.id;
      return r.fromObjectId === current.id || r.toObjectId === current.id;
    });

    for (const rel of rels) {
      edges.push(rel);
      const nextId = rel.fromObjectId === current.id ? rel.toObjectId : rel.fromObjectId;
      if (!visited.has(nextId)) {
        queue.push({ id: nextId, depth: current.depth + 1 });
      }
    }
  }

  return {
    rootObjectId: input.rootObjectId,
    direction,
    maxDepth,
    nodes,
    edges,
  };
}

/** World Graph integration preview — export canonical graph slice */
export function buildWorldGraphExportPreview(limit = 100): WorldGraphExportPreview {
  const store = readObjectModelStore();
  const nodes = store.objects.slice(0, limit).map((o) => ({
    id: o.objectId,
    type: o.objectType,
    label: o.officialName,
    canonicalStatus: o.canonicalStatus,
  }));

  const nodeIds = new Set(nodes.map((n) => n.id));
  const edges = store.relationships
    .filter((r) => nodeIds.has(r.fromObjectId) && nodeIds.has(r.toObjectId))
    .slice(0, limit * 2)
    .map((r) => ({
      id: r.id,
      from: r.fromObjectId,
      to: r.toObjectId,
      type: r.type,
    }));

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    nodes,
    edges,
  };
}
