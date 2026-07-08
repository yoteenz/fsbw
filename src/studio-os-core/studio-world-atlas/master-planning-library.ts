import type {
  AtlasParallelFuture,
  FutureVersionSnapshot,
  MasterPlanningLibraryEntry,
} from './types';

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Master Planning Library™ — every vision becomes reusable IP. */
export function seedMasterPlanningLibrary(futures: AtlasParallelFuture[]): MasterPlanningLibraryEntry[] {
  return futures.map((f) => ({
    id: uid('lib'),
    label: f.label,
    archetype: f.archetype,
    version: f.version,
    status: f.status,
    savedAt: f.updatedAt,
    futureSnapshotId: f.id,
    notes: f.strategy.slice(0, 80),
  }));
}

export function libraryEntryFromFuture(future: AtlasParallelFuture, notes?: string): MasterPlanningLibraryEntry {
  return {
    id: uid('lib'),
    label: `${future.label} V${future.version}`,
    archetype: future.archetype,
    version: future.version,
    status: future.status,
    savedAt: new Date().toISOString(),
    futureSnapshotId: future.id,
    notes,
  };
}

export function versionSnapshotFromFuture(future: AtlasParallelFuture): FutureVersionSnapshot {
  return {
    id: uid('ver'),
    futureId: future.id,
    label: future.label,
    version: future.version,
    savedAt: new Date().toISOString(),
    analysis: { ...future.analysis },
    forkedFromId: future.forkedFromId,
  };
}

export function mergeFutureIdeas(
  target: AtlasParallelFuture,
  source: AtlasParallelFuture
): AtlasParallelFuture {
  const buildingIds = new Set(target.buildings.map((b) => b.id));
  const mergedBuildings = [
    ...target.buildings,
    ...source.buildings.filter((b) => !buildingIds.has(b.id)).slice(0, 2),
  ];
  return {
    ...target,
    buildings: mergedBuildings,
    departments: [...new Set([...target.departments, ...source.departments])],
    updatedAt: new Date().toISOString(),
    version: target.version + 1,
    analysis: {
      ...target.analysis,
      assetReusePct: Math.round((target.analysis.assetReusePct + source.analysis.assetReusePct) / 2),
      expansionFlexibility: Math.max(target.analysis.expansionFlexibility, source.analysis.expansionFlexibility),
    },
  };
}
