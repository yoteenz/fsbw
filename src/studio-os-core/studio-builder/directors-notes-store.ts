import { readStudioOsJson, writeStudioOsJson } from '../../utils/studioOsBrowserStorage';
import { appendProjectCreativeDirection } from '../project-genome/store';

export type DirectorsNote = {
  id: string;
  body: string;
  stageId?: string;
  createdAt: string;
};

type Store = { notes: Record<string, DirectorsNote[]> };

const STORAGE_KEY = 'studioOsDirectorsNotes_v1';
const EMPTY: Store = { notes: {} };

function scopeKey(departmentId: string, projectId: string): string {
  return `${departmentId}:${projectId}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function listDirectorsNotes(departmentId: string, projectId: string): DirectorsNote[] {
  return readStore().notes[scopeKey(departmentId, projectId)] ?? [];
}

export function addDirectorsNote(
  departmentId: string,
  projectId: string,
  body: string,
  stageId?: string
): DirectorsNote {
  const trimmed = body.trim();
  const note: DirectorsNote = {
    id: `dn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    body: trimmed,
    stageId,
    createdAt: new Date().toISOString(),
  };

  const key = scopeKey(departmentId, projectId);
  const store = readStore();
  const existing = store.notes[key] ?? [];
  writeStore({ notes: { ...store.notes, [key]: [note, ...existing] } });

  appendProjectCreativeDirection(departmentId, projectId, trimmed);
  return note;
}
