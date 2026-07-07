/**
 * Bridge production Founder Notes → Creative Direction Notes (canonical creative layer).
 */
import { listFounderNotes, PAGE_001_ASSET_KEY } from '../ndxbook/founderNotes/store';
import { addCreativeDirectionNote, getCreativeDirectionProject, NDXBOOK_PAGE_001_PROJECT_ID } from './store';
import type { ProductionDepartmentId } from '../content-pipeline/departments';

const syncedNoteIds = new Set<string>();

export function syncFounderNotesToCreativeDirection(projectId: string = NDXBOOK_PAGE_001_PROJECT_ID): number {
  getCreativeDirectionProject(projectId);
  const notes = listFounderNotes(PAGE_001_ASSET_KEY);
  let synced = 0;

  for (const note of notes) {
    const key = `${projectId}:${note.id}`;
    if (syncedNoteIds.has(key)) continue;
    addCreativeDirectionNote(projectId, {
      body: note.body,
      kind: note.instinctFlag ? 'mood-change' : 'text',
      departmentOrigin: note.departmentId as ProductionDepartmentId,
    });
    syncedNoteIds.add(key);
    synced += 1;
  }

  return synced;
}

export function ensureCreativeDirectionForAsset(assetId: string): string {
  if (assetId === PAGE_001_ASSET_KEY || assetId.includes('page-001') || assetId.includes('001')) {
    return NDXBOOK_PAGE_001_PROJECT_ID;
  }
  return assetId;
}
