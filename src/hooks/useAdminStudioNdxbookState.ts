import { useCallback, useMemo, useState } from 'react';
import {
  bootstrapNdxbookStore,
  readNdxbookStore,
  mergeNdxbookPatch,
  refreshNdxbookDashboardMetrics,
} from '../studio-os-core/ndxbook/store';
import { NDXBOOK_WORKSPACE_ID } from '../studio-os-core/ndxbook/constants';
import { getLabsTrackingFields } from '../studio-os-core/ndxbook/labsBridge';
import { PROGRAMMING_SLOT_FIELDS } from '../studio-os-core/ndxbook/constants';
import { buildDemoNdxbookStorePatch } from '../utils/adminStudioNdxbookDemo';

function ensureDemoSeeded(): void {
  bootstrapNdxbookStore();
  const store = readNdxbookStore();
  if (!store.brand?.id) {
    mergeNdxbookPatch(buildDemoNdxbookStorePatch());
    refreshNdxbookDashboardMetrics();
  }
}

export function useAdminStudioNdxbookState() {
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => {
    ensureDemoSeeded();
    refreshNdxbookDashboardMetrics();
    setVersion((v) => v + 1);
  }, []);

  const store = useMemo(() => {
    void version;
    ensureDemoSeeded();
    return readNdxbookStore();
  }, [version]);

  const workspaceId = NDXBOOK_WORKSPACE_ID;
  const labsTrackingFields = useMemo(() => getLabsTrackingFields(), []);
  const programmingSlotFields = PROGRAMMING_SLOT_FIELDS;

  const scheduledPages = store.pages.filter((p) => p.status === 'scheduled');
  const publishedPages = store.pages.filter((p) => p.status === 'published');
  const connectedSocials = store.socialAccounts.filter((s) => s.status === 'connected');

  return {
    workspaceId,
    store,
    brand: store.brand,
    taxonomy: store.taxonomy,
    volumes: store.volumes,
    programming: store.programming,
    programmingSlots: store.programmingSlots,
    pages: store.pages,
    talentHosts: store.talentHosts,
    socialAccounts: store.socialAccounts,
    voiceRules: store.voiceRules,
    creativeDna: store.creativeDna,
    launchChecklist: store.launchChecklist,
    dashboard: store.dashboard,
    nextPageNumber: store.nextPageNumber,
    scheduledPages,
    publishedPages,
    connectedSocials,
    labsTrackingFields,
    programmingSlotFields,
    refresh,
  };
}
