import { readStudioOsJson, writeStudioOsJson } from '../../../utils/studioOsBrowserStorage';
import type { FounderNote, FounderNoteKind, FounderNoteStatus } from './types';

const STORAGE_KEY = 'studioOsFounderNotes_v1';

type Store = { notes: Record<string, FounderNote[]> };

const EMPTY: Store = { notes: {} };

function scopeKey(departmentId: string, projectId: string): string {
  return `${departmentId}:${projectId}`;
}

function uid(): string {
  return `fn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function readStore(): Store {
  return readStudioOsJson(STORAGE_KEY, () => EMPTY);
}

function writeStore(store: Store): void {
  writeStudioOsJson(STORAGE_KEY, store);
}

export function listFounderNotes(departmentId: string, projectId: string): FounderNote[] {
  return readStore().notes[scopeKey(departmentId, projectId)] ?? [];
}

export function createFounderNote(input: {
  departmentId: string;
  projectId: string;
  body: string;
  kind?: FounderNoteKind;
  status?: FounderNoteStatus;
}): FounderNote {
  const now = new Date().toISOString();
  const note: FounderNote = {
    id: uid(),
    departmentId: input.departmentId,
    projectId: input.projectId,
    kind: input.kind ?? 'text',
    body: input.body.trim(),
    status: input.status ?? (input.kind === 'pinned' ? 'pinned' : 'open'),
    createdAt: now,
    updatedAt: now,
  };
  const key = scopeKey(input.departmentId, input.projectId);
  const store = readStore();
  const notes = [note, ...(store.notes[key] ?? [])];
  writeStore({ notes: { ...store.notes, [key]: notes } });
  return note;
}

export function updateFounderNoteStatus(
  departmentId: string,
  projectId: string,
  noteId: string,
  status: FounderNoteStatus
): FounderNote | null {
  const key = scopeKey(departmentId, projectId);
  const store = readStore();
  const notes = store.notes[key] ?? [];
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx < 0) return null;
  const updated = { ...notes[idx], status, updatedAt: new Date().toISOString() };
  const next = [...notes];
  next[idx] = updated;
  writeStore({ notes: { ...store.notes, [key]: next } });
  return updated;
}

export function deleteFounderNote(departmentId: string, projectId: string, noteId: string): void {
  const key = scopeKey(departmentId, projectId);
  const store = readStore();
  const notes = (store.notes[key] ?? []).filter((n) => n.id !== noteId);
  writeStore({ notes: { ...store.notes, [key]: notes } });
}
