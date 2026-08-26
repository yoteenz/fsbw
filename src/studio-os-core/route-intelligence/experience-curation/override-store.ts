import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { EXPERIENCE_CURATION_SCHEMA_VERSION, EXPERIENCE_CURATION_STORE_RELATIVE_PATH } from './constants';
import type {
  ExperienceCurationStore,
  ExperiencePageOverrideRecordV2,
  PageAbstractionReviewRecord,
  ProjectCurationState,
} from '../types';

export function emptyCurationStore(sourceCommit = ''): ExperienceCurationStore {
  return {
    schemaVersion: EXPERIENCE_CURATION_SCHEMA_VERSION,
    updatedAt: new Date().toISOString(),
    sourceCommit,
    overrides: [],
    reviews: [],
    projectCuration: {},
    reviewSessions: [],
    actionReceipts: [],
    reviewReceipts: [],
    lockReceipts: [],
    sourceSnapshots: {},
    externalRepoAuthority: {},
    lastActionByProject: {},
  };
}

export function loadExperienceCurationStore(repoRoot: string): ExperienceCurationStore {
  const path = join(repoRoot, EXPERIENCE_CURATION_STORE_RELATIVE_PATH);
  if (!existsSync(path)) return emptyCurationStore();
  try {
    return JSON.parse(readFileSync(path, 'utf8')) as ExperienceCurationStore;
  } catch {
    return emptyCurationStore();
  }
}

export function saveExperienceCurationStore(repoRoot: string, store: ExperienceCurationStore): void {
  const path = join(repoRoot, EXPERIENCE_CURATION_STORE_RELATIVE_PATH);
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify({ ...store, updatedAt: new Date().toISOString() }, null, 2), 'utf8');
}

export function getProjectCurationState(
  store: ExperienceCurationStore,
  projectId: string,
): ProjectCurationState {
  return (
    store.projectCuration[projectId] ?? {
      projectId,
      curationVersion: `${projectId}:curation-v1`,
      universeStatus: 'DRAFT',
      lockedForCapture: false,
    }
  );
}

export function upsertOverride(
  store: ExperienceCurationStore,
  override: ExperiencePageOverrideRecordV2,
): ExperienceCurationStore {
  const existing = store.overrides.findIndex(
    (o) => o.overrideId === override.overrideId || (o.targetId === override.targetId && o.overrideType === override.overrideType && o.active),
  );
  const overrides = [...store.overrides];
  if (existing >= 0) {
    const prev = overrides[existing]!;
    overrides[existing] = { ...override, supersedesOverrideId: prev.overrideId, active: true };
    overrides.push({ ...prev, active: false });
  } else {
    overrides.push(override);
  }
  return { ...store, overrides };
}

export function appendReview(
  store: ExperienceCurationStore,
  review: PageAbstractionReviewRecord,
): ExperienceCurationStore {
  return { ...store, reviews: [...store.reviews, review] };
}

export function activeOverridesForProject(
  store: ExperienceCurationStore,
  projectId: string,
): ExperiencePageOverrideRecordV2[] {
  return store.overrides.filter((o) => o.projectId === projectId && o.active);
}
