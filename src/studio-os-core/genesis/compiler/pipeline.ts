import { mutateGenesisStore, readGenesisStore } from '../persistence/store';
import { listCanonicalGenesisObjects } from '../objects/registry';
import { GENESIS_FRAMEWORK_VERSION } from '../constants';
import { GENESIS_COMPILE_TARGET_REGISTRY } from './targets';
import type {
  GenesisCompileManifest,
  GenesisCompileManifestEntry,
  GenesisCompileTargetId,
  GenesisObject,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

function createCompileId(): string {
  return `compile-${Date.now().toString(36)}`;
}

function filterObjectsForTarget(
  objects: GenesisObject[],
  targetId: GenesisCompileTargetId
): GenesisObject[] {
  const target = GENESIS_COMPILE_TARGET_REGISTRY[targetId];
  return objects.filter((obj) => target.sourceObjectTypes.includes(obj.type));
}

function buildTargetEntry(
  targetId: GenesisCompileTargetId,
  objects: GenesisObject[]
): GenesisCompileManifestEntry {
  const target = GENESIS_COMPILE_TARGET_REGISTRY[targetId];
  const warnings: string[] = [];
  const errors: string[] = [];

  if (objects.length === 0) {
    warnings.push(`No canonical objects mapped to ${target.title}`);
  }

  return {
    targetId,
    outputPath: target.outputRoot,
    objectCount: objects.length,
    warnings,
    errors,
  };
}

/** Compilation Pipeline™ — Genesis compiles into downstream projections. */
export function compileGenesisTargets(
  targetIds?: GenesisCompileTargetId[],
  options?: { includeNonCanonical?: boolean }
): GenesisCompileManifest {
  const store = readGenesisStore();
  const objects = options?.includeNonCanonical
    ? store.objects
    : listCanonicalGenesisObjects();

  const targets = targetIds ?? (Object.keys(GENESIS_COMPILE_TARGET_REGISTRY) as GenesisCompileTargetId[]);
  const entries = targets.map((targetId) =>
    buildTargetEntry(targetId, filterObjectsForTarget(objects, targetId))
  );

  const manifest: GenesisCompileManifest = {
    compileId: createCompileId(),
    genesisVersion: store.frameworkVersion ?? GENESIS_FRAMEWORK_VERSION,
    sourceObjectCount: objects.length,
    targets: entries,
    generatedAt: now(),
  };

  mutateGenesisStore((s) => ({
    ...s,
    compileManifests: [...s.compileManifests, manifest],
  }));

  return manifest;
}

export function getLatestCompileManifest(): GenesisCompileManifest | undefined {
  const manifests = readGenesisStore().compileManifests;
  return manifests[manifests.length - 1];
}

export function listCompileManifests(): GenesisCompileManifest[] {
  return readGenesisStore().compileManifests;
}

export function getCompilePreview(targetId: GenesisCompileTargetId): {
  targetId: GenesisCompileTargetId;
  objectCount: number;
  objects: Array<{ objectId: string; title: string; type: string }>;
} {
  const objects = filterObjectsForTarget(listCanonicalGenesisObjects(), targetId);
  return {
    targetId,
    objectCount: objects.length,
    objects: objects.map((o) => ({
      objectId: o.objectId,
      title: o.title,
      type: o.type,
    })),
  };
}
