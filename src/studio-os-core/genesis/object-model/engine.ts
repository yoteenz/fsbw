import { ensureObjectModelStore, readObjectModelStore } from './persistence';
import {
  getCanonicalObjectRegistryStats,
  listCanonicalObjectRegistry,
  searchCanonicalObjectRegistry,
  listCanonicalObjectsByType,
  listCanonicalObjectsByStatus,
  getObjectTypeCoverage,
} from './object-registry/registry';
import {
  registerCanonicalObject,
  getCanonicalObject,
  listCanonicalObjects,
  updateCanonicalObject,
  removeCanonicalObject,
  createCanonicalObjectId,
} from './object-factory/factory';
import {
  listCanonicalObjectTypes,
  getCanonicalObjectTypeMeta,
  isCanonicalObjectType,
  listObjectTypesByFamily,
  listInheritanceParents,
  listInheritanceChildren,
  listCompositionPatterns,
} from './object-types/registry';
import {
  listCanonicalObjectRelationships,
  addCanonicalObjectRelationship,
  removeCanonicalObjectRelationship,
  findCanonicalContradictions,
  getCanonicalObjectGraphNeighbors,
  syncDependenciesFromRelationships,
} from './object-relationships/engine';
import {
  canInheritFrom,
  validateInheritance,
  listInheritanceChain,
  applyInheritanceRelationship,
} from './object-relationships/inheritance';
import {
  getAllowedCompositionChildren,
  canCompose,
  validateComposition,
  listComposedObjects,
  getCompositionSummary,
} from './object-relationships/composition';
import {
  resolveCanonicalReference,
  listCanonicalCrossReferences,
  validateCanonicalCrossReferences,
  formatCanonicalCitation,
  resolveCanonicalReferenceGraph,
} from './object-relationships/reference-resolution';
import {
  validateCanonicalObject,
  validateObjectModelStore,
  traverseCanonicalObjectGraph,
  buildWorldGraphExportPreview,
} from './object-validation/engine';
import {
  createCanonicalObjectRevision,
  listCanonicalObjectRevisions,
  getCanonicalObjectVersion,
  listCanonicalObjectVersionHistory,
} from './object-versioning/versioning';
import {
  listCanonicalObjectHistory,
  archiveCanonicalObjectRevision,
  getCanonicalObjectTimeline,
  listSupersededCanonicalObjects,
} from './object-history/history';
import {
  ingestCanonicalObjectPayload,
  ingestCanonicalObjectBatch,
} from './content/loader';
import {
  OBJECT_MODEL_SUBSYSTEM_NAME,
  OBJECT_MODEL_SUBSYSTEM_VERSION,
  CORE_OBJECT_RELATIONSHIP_TYPES,
  CANONICAL_OBJECT_TYPES,
  CANONICAL_LIFECYCLE_STATES,
} from './constants';
import type { ObjectModelRegistryStats } from './types';

export function ensureObjectModelSubsystem() {
  return ensureObjectModelStore();
}

export function getObjectModelPlatformStats(): ObjectModelRegistryStats {
  return getCanonicalObjectRegistryStats();
}

export {
  OBJECT_MODEL_SUBSYSTEM_NAME,
  OBJECT_MODEL_SUBSYSTEM_VERSION,
  CORE_OBJECT_RELATIONSHIP_TYPES,
  CANONICAL_OBJECT_TYPES,
  CANONICAL_LIFECYCLE_STATES,
  readObjectModelStore,
  ensureObjectModelStore,
  getCanonicalObjectRegistryStats,
  listCanonicalObjectRegistry,
  searchCanonicalObjectRegistry,
  listCanonicalObjectsByType,
  listCanonicalObjectsByStatus,
  getObjectTypeCoverage,
  registerCanonicalObject,
  getCanonicalObject,
  listCanonicalObjects,
  updateCanonicalObject,
  removeCanonicalObject,
  createCanonicalObjectId,
  listCanonicalObjectTypes,
  getCanonicalObjectTypeMeta,
  isCanonicalObjectType,
  listObjectTypesByFamily,
  listInheritanceParents,
  listInheritanceChildren,
  listCompositionPatterns,
  listCanonicalObjectRelationships,
  addCanonicalObjectRelationship,
  removeCanonicalObjectRelationship,
  findCanonicalContradictions,
  getCanonicalObjectGraphNeighbors,
  syncDependenciesFromRelationships,
  canInheritFrom,
  validateInheritance,
  listInheritanceChain,
  applyInheritanceRelationship,
  getAllowedCompositionChildren,
  canCompose,
  validateComposition,
  listComposedObjects,
  getCompositionSummary,
  resolveCanonicalReference,
  listCanonicalCrossReferences,
  validateCanonicalCrossReferences,
  formatCanonicalCitation,
  resolveCanonicalReferenceGraph,
  validateCanonicalObject,
  validateObjectModelStore,
  traverseCanonicalObjectGraph,
  buildWorldGraphExportPreview,
  createCanonicalObjectRevision,
  listCanonicalObjectRevisions,
  getCanonicalObjectVersion,
  listCanonicalObjectVersionHistory,
  listCanonicalObjectHistory,
  archiveCanonicalObjectRevision,
  getCanonicalObjectTimeline,
  listSupersededCanonicalObjects,
  ingestCanonicalObjectPayload,
  ingestCanonicalObjectBatch,
};

export type {
  ObjectModelRegistryStats,
  CanonicalObject,
  CanonicalRelationship,
  ObjectModelValidationReport,
  ObjectModelGraphTraversal,
  WorldGraphExportPreview,
} from './types';

export type { RegisterCanonicalObjectInput } from './object-factory/factory';
export type { CanonicalObjectPayload } from './content/loader';
