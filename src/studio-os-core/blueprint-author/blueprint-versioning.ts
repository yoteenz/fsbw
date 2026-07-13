import type { BlueprintRevisionVersions } from './contract';
import type { ConstructionPlan } from './construction-plan-schema';

export const BLUEPRINT_VERSIONING_VERSION = 'blueprint-versioning.v1';

export type BlueprintRevisionRecord = {
  revision: number;
  author: string;
  timestamp: string;
  compilerVersion: string;
  promptVersion: string;
  materialVersion: string;
  organizationVersion: string;
  roomVersion: string;
  sceneVersion: string;
  planId: string;
  versions: BlueprintRevisionVersions;
};

export function captureBlueprintRevision(plan: ConstructionPlan): BlueprintRevisionRecord {
  return {
    revision: plan.metadata.revision,
    author: plan.metadata.author,
    timestamp: plan.metadata.authoredAt,
    compilerVersion: plan.metadata.compilerVersion,
    promptVersion: plan.versions.promptVersion,
    materialVersion: plan.versions.materialVersion,
    organizationVersion: plan.versions.organizationVersion,
    roomVersion: plan.versions.roomVersion,
    sceneVersion: plan.metadata.sceneVersion,
    planId: plan.planId,
    versions: plan.versions,
  };
}

export function bumpBlueprintRevision(
  plan: ConstructionPlan,
  author: string
): ConstructionPlan {
  return {
    ...plan,
    metadata: {
      ...plan.metadata,
      revision: plan.metadata.revision + 1,
      author,
      authoredAt: new Date().toISOString(),
    },
  };
}

export function assertReproducibleCompile(input: {
  revisionA: BlueprintRevisionRecord;
  revisionB: BlueprintRevisionRecord;
}): { ok: true } | { ok: false; drift: string[] } {
  const drift: string[] = [];
  const keys: (keyof BlueprintRevisionVersions)[] = [
    'blueprintVersion',
    'organizationVersion',
    'worldVersion',
    'roomVersion',
    'architectureVersion',
    'materialVersion',
    'assetVersion',
    'lightingVersion',
    'validationVersion',
    'generationVersion',
    'promptVersion',
    'compilerVersion',
  ];
  for (const key of keys) {
    if (input.revisionA.versions[key] !== input.revisionB.versions[key]) {
      drift.push(key);
    }
  }
  if (drift.length > 0) return { ok: false, drift };
  return { ok: true };
}

export function formatRevisionSummary(record: BlueprintRevisionRecord): string {
  return `Blueprint ${record.planId} rev${record.revision} — ${record.author} @ ${record.timestamp}`;
}
