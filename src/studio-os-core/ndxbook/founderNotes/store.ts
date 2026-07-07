import { readStudioOsJson, writeStudioOsJson } from '../../../utils/studioOsBrowserStorage';
import type { ProductionDepartmentId } from '../../content-pipeline/departments';
import type { NdxbookPage } from '../types';
import { readNdxbookStore, writeNdxbookStore } from '../store';
import { analyzeFounderInstinct } from './instinctAnalysis';
import { routeFounderNoteToConcierge } from './conciergeRouting';
import { generateRevisionProposal } from './revisionEngine';
import type {
  FounderInstinctAnalysis,
  FounderNote,
  FounderNotesStore,
  FounderNoteStatus,
  ProductionConciergeId,
} from './types';

export const FOUNDER_NOTES_STORAGE_KEY = 'studioOsNdxbook_founderNotes_v1';

export const PAGE_001_ASSET_KEY = 'ndxbook-page-001';

export function resolveFounderNotesAssetId(page: NdxbookPage | null): string {
  return page?.id ?? PAGE_001_ASSET_KEY;
}

function uid(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

const EMPTY: FounderNotesStore = { byAssetId: {}, instinctAnalyses: {} };

function readStore(): FounderNotesStore {
  return readStudioOsJson(FOUNDER_NOTES_STORAGE_KEY, () => EMPTY);
}

function writeStore(store: FounderNotesStore): void {
  writeStudioOsJson(FOUNDER_NOTES_STORAGE_KEY, store);
}

function persistNotes(assetId: string, notes: FounderNote[]): FounderNote[] {
  const store = readStore();
  writeStore({ ...store, byAssetId: { ...store.byAssetId, [assetId]: notes } });
  return notes;
}

export function listFounderNotes(assetId: string): FounderNote[] {
  return readStore().byAssetId[assetId] ?? [];
}

export function listInstinctAnalyses(assetId: string): FounderInstinctAnalysis[] {
  return readStore().instinctAnalyses[assetId] ?? [];
}

export function countBlockingFounderNotes(assetId: string): number {
  return listFounderNotes(assetId).filter(isBlockingFounderNote).length;
}

export function isBlockingFounderNote(note: FounderNote): boolean {
  return !['resolved', 'deferred'].includes(note.status);
}

export function hasBlockingFounderNotes(assetId: string): boolean {
  return countBlockingFounderNotes(assetId) > 0;
}

export type CreateFounderNoteInput = {
  assetId: string;
  departmentId: ProductionDepartmentId;
  body: string;
  author?: string;
  instinctFlag?: boolean;
  assignConcierge?: ProductionConciergeId | 'auto';
};

export function createFounderNote(input: CreateFounderNoteInput): FounderNote {
  const route =
    input.assignConcierge && input.assignConcierge !== 'auto'
      ? {
          concierge: input.assignConcierge,
          returnDepartment: routeFounderNoteToConcierge(input.body, input.instinctFlag).returnDepartment,
        }
      : routeFounderNoteToConcierge(input.body, input.instinctFlag);

  const now = new Date().toISOString();
  const note: FounderNote = {
    id: uid('fnote'),
    assetId: input.assetId,
    departmentId: input.departmentId,
    body: input.body.trim(),
    author: input.author ?? 'Founder',
    createdAt: now,
    updatedAt: now,
    status: 'open',
    assignedConcierge: route.concierge,
    instinctFlag: Boolean(input.instinctFlag),
    returnDepartmentId: route.returnDepartment,
    revisions: [],
  };

  if (input.assignConcierge && input.assignConcierge !== 'auto') {
    note.status = 'assigned';
    note.assignedConcierge = input.assignConcierge;
  }

  const notes = [...listFounderNotes(input.assetId), note];
  persistNotes(input.assetId, notes);

  if (note.instinctFlag) {
    appendInstinctAnalysis(input.assetId, analyzeFounderInstinct(input.assetId, readPageForAsset(input.assetId), note.id));
  }

  return note;
}

function readPageForAsset(assetId: string): NdxbookPage | null {
  const store = readNdxbookStore();
  return store.pages.find((p) => p.id === assetId) ?? store.pages.find((p) => p.pageNumber === 1) ?? null;
}

function appendInstinctAnalysis(assetId: string, analysis: FounderInstinctAnalysis): void {
  const store = readStore();
  const existing = store.instinctAnalyses[assetId] ?? [];
  writeStore({
    ...store,
    instinctAnalyses: { ...store.instinctAnalyses, [assetId]: [analysis, ...existing].slice(0, 12) },
  });
}

export function askOrbToFixNote(assetId: string, noteId: string, page: NdxbookPage | null): FounderNote | null {
  const notes = listFounderNotes(assetId);
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx < 0) return null;

  const note = { ...notes[idx]! };
  const route = routeFounderNoteToConcierge(note.body, note.instinctFlag);
  note.assignedConcierge = route.concierge;
  note.returnDepartmentId = route.returnDepartment;
  note.status = 'in-revision';
  note.updatedAt = new Date().toISOString();

  const revision = generateRevisionProposal(note, page);
  note.revisions = [revision, ...note.revisions];

  if (note.instinctFlag) {
    appendInstinctAnalysis(assetId, analyzeFounderInstinct(assetId, page, note.id));
  }

  const next = [...notes];
  next[idx] = note;
  persistNotes(assetId, next);
  return note;
}

export function assignNoteToConcierge(
  assetId: string,
  noteId: string,
  concierge: ProductionConciergeId,
  page: NdxbookPage | null
): FounderNote | null {
  const notes = listFounderNotes(assetId);
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx < 0) return null;

  const note = { ...notes[idx]! };
  note.assignedConcierge = concierge;
  note.status = 'assigned';
  note.updatedAt = new Date().toISOString();
  if (!note.returnDepartmentId) {
    note.returnDepartmentId = routeFounderNoteToConcierge(note.body, note.instinctFlag).returnDepartment;
  }

  const next = [...notes];
  next[idx] = note;
  persistNotes(assetId, next);

  askOrbToFixNote(assetId, noteId, page);
  return listFounderNotes(assetId).find((n) => n.id === noteId) ?? null;
}

export function updateFounderNoteStatus(
  assetId: string,
  noteId: string,
  status: FounderNoteStatus
): FounderNote | null {
  const notes = listFounderNotes(assetId);
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx < 0) return null;
  const note = { ...notes[idx]!, status, updatedAt: new Date().toISOString() };
  const next = [...notes];
  next[idx] = note;
  persistNotes(assetId, next);
  return note;
}

export function resolveRevision(
  assetId: string,
  noteId: string,
  revisionId: string,
  action: 'approve' | 'reject' | 'edit',
  editedVersion?: string,
  page?: NdxbookPage | null
): FounderNote | null {
  const notes = listFounderNotes(assetId);
  const idx = notes.findIndex((n) => n.id === noteId);
  if (idx < 0) return null;

  const note = { ...notes[idx]! };
  const revIdx = note.revisions.findIndex((r) => r.id === revisionId);
  if (revIdx < 0) return null;

  const revision = { ...note.revisions[revIdx]! };
  if (action === 'approve') {
    revision.status = 'approved';
    applyRevisionToPage(revision, page ?? readPageForAsset(assetId));
    note.status = 'resolved';
  } else if (action === 'reject') {
    revision.status = 'rejected';
    note.status = 'needs-founder-review';
  } else {
    revision.status = 'edited';
    revision.suggestedVersion = editedVersion ?? revision.suggestedVersion;
    applyRevisionToPage(revision, page ?? readPageForAsset(assetId));
    note.status = 'resolved';
  }

  note.revisions = [...note.revisions];
  note.revisions[revIdx] = revision;
  note.updatedAt = new Date().toISOString();

  const next = [...notes];
  next[idx] = note;
  persistNotes(assetId, next);
  return note;
}

function applyRevisionToPage(revision: { field: string; suggestedVersion: string }, page: NdxbookPage | null): void {
  if (!page) return;
  const store = readNdxbookStore();
  const pages = store.pages.map((p) => {
    if (p.id !== page.id) return p;
    const patch: Partial<NdxbookPage> = { updatedAt: new Date().toISOString() };
    switch (revision.field) {
      case 'hook':
        patch.hook = revision.suggestedVersion;
        break;
      case 'script':
        patch.script = revision.suggestedVersion;
        break;
      case 'caption':
        patch.caption = revision.suggestedVersion;
        break;
      default:
        break;
    }
    return { ...p, ...patch };
  });
  writeNdxbookStore({ ...store, pages });
}

export function requestRevisionBeforeReview(
  assetId: string,
  departmentId: ProductionDepartmentId,
  body: string,
  page: NdxbookPage | null
): { note: FounderNote; targetDepartment: ProductionDepartmentId } {
  const route = routeFounderNoteToConcierge(body, false);
  const note = createFounderNote({
    assetId,
    departmentId,
    body,
    assignConcierge: route.concierge,
    instinctFlag: false,
  });
  askOrbToFixNote(assetId, note.id, page);
  return {
    note: listFounderNotes(assetId).find((n) => n.id === note.id) ?? note,
    targetDepartment: route.returnDepartment,
  };
}

export function runInstinctAnalysis(assetId: string, page: NdxbookPage | null, noteId: string | null): FounderInstinctAnalysis {
  const analysis = analyzeFounderInstinct(assetId, page, noteId);
  appendInstinctAnalysis(assetId, analysis);
  return analysis;
}
