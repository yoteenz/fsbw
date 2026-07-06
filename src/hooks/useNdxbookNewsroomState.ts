import {useCallback, useMemo, useState} from 'react';
import { buildNdxbookNewsroomSeed } from '../studio-os-core/ndxbook/newsroom/bootstrap';
import {
  bootstrapNdxbookNewsroomStore,
  movePageToStage,
  readNdxbookNewsroomStore,
  rescheduleEditorialEntry,
  selectNewsroomPage,
} from '../studio-os-core/ndxbook/newsroom/store';
import { NDXBOOK_WORKSPACE_ID } from '../studio-os-core/ndxbook/constants';
import { ensureFounderPilotForOrganization, shouldUseFounderPilotSeed } from '../studio-os-core/founder-pilot-mode';
import type { NewsroomPipelineStageId } from '../studio-os-core/ndxbook/newsroom/types';

function ensureSeeded(): void {
  ensureFounderPilotForOrganization(NDXBOOK_WORKSPACE_ID);
  if (shouldUseFounderPilotSeed(NDXBOOK_WORKSPACE_ID)) {
    bootstrapNdxbookNewsroomStore(undefined, { force: false });
    return;
  }
  bootstrapNdxbookNewsroomStore(buildNdxbookNewsroomSeed());
}

export function useNdxbookNewsroomState() {
  const [version, setVersion] = useState(() => {
    ensureSeeded();
    return 0;
  });

  const refresh = useCallback(() => {
    ensureSeeded();
    setVersion((v) => v + 1);
  }, []);


  const store = useMemo(() => {
    void version;
    return readNdxbookNewsroomStore();
  }, [version]);

  const selectedPage = useMemo(
    () => store.pages.find((p) => p.id === store.selectedPageId) ?? store.pages[0] ?? null,
    [store.pages, store.selectedPageId]
  );

  const movePage = useCallback((pageId: string, stageId: NewsroomPipelineStageId) => {
    movePageToStage(pageId, stageId);
    setVersion((v) => v + 1);
  }, []);

  const selectPage = useCallback((pageId: string | null) => {
    selectNewsroomPage(pageId);
    setVersion((v) => v + 1);
  }, []);

  const rescheduleCalendar = useCallback((entryId: string, newScheduledAt: string) => {
    rescheduleEditorialEntry(entryId, newScheduledAt);
    setVersion((v) => v + 1);
  }, []);

  const formatTime = useCallback((iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  }, []);

  return {
    store,
    selectedPage,
    refresh,
    movePage,
    selectPage,
    rescheduleCalendar,
    formatTime,
  };
}
