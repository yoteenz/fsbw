import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ProductionDepartmentId } from '../studio-os-core/content-pipeline/departments';
import type { NdxbookPage } from '../studio-os-core/ndxbook/types';
import {
  askOrbToFixNote,
  assignNoteToConcierge,
  canAdvanceWithFounderNotes,
  countBlockingFounderNotes,
  createFounderNote,
  listFounderNotes,
  listInstinctAnalyses,
  requestRevisionBeforeReview,
  resolveFounderNotesAssetId,
  resolveRevision,
  runInstinctAnalysis,
  updateFounderNoteStatus,
  type FounderInstinctAnalysis,
  type FounderNote,
  type ProductionConciergeId,
} from '../studio-os-core/ndxbook/founderNotes';

export function useFounderNotes(page: NdxbookPage | null, departmentId: ProductionDepartmentId) {
  const assetId = resolveFounderNotesAssetId(page);
  const [version, setVersion] = useState(0);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key?.includes('founderNotes')) bump();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [bump]);

  const notes = useMemo(() => {
    void version;
    return listFounderNotes(assetId);
  }, [assetId, version]);

  const instinctAnalyses = useMemo(() => {
    void version;
    return listInstinctAnalyses(assetId);
  }, [assetId, version]);

  const blockingCount = useMemo(() => {
    void version;
    return countBlockingFounderNotes(assetId);
  }, [assetId, version]);

  const advanceGuard = useMemo(() => {
    void version;
    return canAdvanceWithFounderNotes(assetId);
  }, [assetId, version]);

  const addNote = useCallback(
    (body: string, options?: { instinctFlag?: boolean; assign?: ProductionConciergeId | 'auto' }) => {
      const note = createFounderNote({
        assetId,
        departmentId,
        body,
        instinctFlag: options?.instinctFlag,
        assignConcierge: options?.assign,
      });
      bump();
      return note;
    },
    [assetId, bump, departmentId]
  );

  const askOrb = useCallback(
    (noteId: string) => {
      const updated = askOrbToFixNote(assetId, noteId, page);
      bump();
      return updated;
    },
    [assetId, bump, page]
  );

  const assignConcierge = useCallback(
    (noteId: string, concierge: ProductionConciergeId) => {
      const updated = assignNoteToConcierge(assetId, noteId, concierge, page);
      bump();
      return updated;
    },
    [assetId, bump, page]
  );

  const setNoteStatus = useCallback(
    (noteId: string, status: FounderNote['status']) => {
      const updated = updateFounderNoteStatus(assetId, noteId, status);
      bump();
      return updated;
    },
    [assetId, bump]
  );

  const decideRevision = useCallback(
    (noteId: string, revisionId: string, action: 'approve' | 'reject' | 'edit', editedVersion?: string) => {
      const updated = resolveRevision(assetId, noteId, revisionId, action, editedVersion, page);
      bump();
      return updated;
    },
    [assetId, bump, page]
  );

  const requestRevision = useCallback(
    (body: string) => {
      const result = requestRevisionBeforeReview(assetId, departmentId, body, page);
      bump();
      return result;
    },
    [assetId, bump, departmentId, page]
  );

  const analyzeInstinct = useCallback(
    (noteId: string | null): FounderInstinctAnalysis => {
      const analysis = runInstinctAnalysis(assetId, page, noteId);
      bump();
      return analysis;
    },
    [assetId, bump, page]
  );

  return {
    assetId,
    notes,
    instinctAnalyses,
    blockingCount,
    advanceGuard,
    addNote,
    askOrb,
    assignConcierge,
    setNoteStatus,
    decideRevision,
    requestRevision,
    analyzeInstinct,
    refresh: bump,
  };
}
