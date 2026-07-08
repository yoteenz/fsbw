import { useCallback, useMemo, useState } from 'react';
import {
  createFounderNote,
  deleteFounderNote,
  listFounderNotes,
  updateFounderNoteStatus,
} from '../studio-os-core/studio-objects/founder-notes';
import type { FounderNoteKind } from '../studio-os-core/studio-objects/founder-notes';

export function useStudioFounderNotes(departmentId: string, projectId: string) {
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const notes = useMemo(() => {
    void version;
    return listFounderNotes(departmentId, projectId);
  }, [departmentId, projectId, version]);

  const addNote = useCallback(
    (body: string, kind: FounderNoteKind = 'text') => {
      const note = createFounderNote({ departmentId, projectId, body, kind });
      bump();
      return note;
    },
    [bump, departmentId, projectId]
  );

  const pinNote = useCallback(
    (noteId: string) => {
      updateFounderNoteStatus(departmentId, projectId, noteId, 'pinned');
      bump();
    },
    [bump, departmentId, projectId]
  );

  const removeNote = useCallback(
    (noteId: string) => {
      deleteFounderNote(departmentId, projectId, noteId);
      bump();
    },
    [bump, departmentId, projectId]
  );

  return { notes, addNote, pinNote, removeNote, bump };
}
