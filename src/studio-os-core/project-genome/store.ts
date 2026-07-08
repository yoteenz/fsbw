/** Project Genome™ — department-agnostic active project context for generation + room. */

import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { requireDepartmentPackage } from '../department-package';

export type ProjectGenomeRecord = {
  projectId: string;
  departmentId: string;
  name: string;
  vision: string;
  northStar: string;
  tone: string[];
  activeBranchName?: string;
  creativeDirectionNotes?: string[];
  updatedAt: string;
};

type Store = { records: Record<string, ProjectGenomeRecord> };

const STORAGE_KEY = 'studioOsProjectGenome_v1';
const EMPTY: Store = { records: {} };

function scopeKey(departmentId: string, projectId: string): string {
  return `${departmentId}:${projectId}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function ensureProjectGenome(departmentId: string, projectId?: string): ProjectGenomeRecord {
  const pkg = requireDepartmentPackage(departmentId);
  const id = projectId ?? pkg.productionGroups.defaultProject.id;
  const key = scopeKey(departmentId, id);
  const existing = readStore().records[key];
  if (existing) return existing;

  const seed = pkg.productionGroups.defaultProject;
  const record: ProjectGenomeRecord = {
    projectId: id,
    departmentId,
    name: seed.name,
    vision: seed.vision,
    northStar: seed.northStar,
    tone: seed.tone,
    activeBranchName: 'Main Direction',
    updatedAt: new Date().toISOString(),
  };
  const store = readStore();
  writeStore({ records: { ...store.records, [key]: record } });
  return record;
}

export function getProjectGenome(departmentId: string, projectId: string): ProjectGenomeRecord | null {
  return readStore().records[scopeKey(departmentId, projectId)] ?? null;
}

export function resolveActiveProjectGenome(departmentId: string): ProjectGenomeRecord {
  const pkg = requireDepartmentPackage(departmentId);
  return ensureProjectGenome(departmentId, pkg.productionGroups.defaultProject.id);
}

export function appendProjectCreativeDirection(
  departmentId: string,
  projectId: string,
  note: string
): ProjectGenomeRecord {
  const key = scopeKey(departmentId, projectId);
  const record = ensureProjectGenome(departmentId, projectId);
  const existing = record.creativeDirectionNotes ?? [];
  const creativeDirectionNotes = [note, ...existing.filter((n) => n !== note)].slice(0, 24);
  const updated: ProjectGenomeRecord = {
    ...record,
    creativeDirectionNotes,
    updatedAt: new Date().toISOString(),
  };
  const store = readStore();
  writeStore({ records: { ...store.records, [key]: updated } });
  return updated;
}
