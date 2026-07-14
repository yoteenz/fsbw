import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createInitialEventCursor,
  processEnvironmentPackageEvent,
  resetEnvironmentPackageEventProcessor,
  type EnvironmentPackageEvent,
  type EnvironmentPackageEventCursor,
  reconcileExperienceLabWorkspace,
  createEnvironmentPackageRealtimeClient,
  recoverEnvironmentPackageEventGap,
  mapAuditRowToEnvironmentPackageEvent,
  resetEnvironmentPackageRealtimeThrottle,
} from '../../../../studio-os-core/environment-asset-package/events';
import { isEnvironmentPackageInMemoryOnly } from '../../../../studio-os-core/environment-asset-package/environment-package-feature-flags';
import {
  fetchEnvironmentPackageEvents,
  fetchEnvironmentPackageStatus,
} from '../../../../services/studio/environmentPackage/api';
import { getSupabase } from '../../../../utils/supabase';
import type { WorkbenchEditingToolId } from '../experience-lab-v2-workbench-config';

export type EventSyncState = {
  cursor: EnvironmentPackageEventCursor;
  lastInvalidationSet: string[];
  currentPackageUpdated: boolean;
  subscriberCount: number;
};

const AUDIT_TABLE = 'studio_environment_package_audit_events';

function createSupabaseAuditSubscriber(
  packageId: string,
  onRow: (row: Record<string, unknown>) => void
): () => void {
  const supabase = getSupabase();
  if (!supabase) return () => undefined;

  const channel = supabase
    .channel(`envpkg-events:${packageId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: AUDIT_TABLE,
        filter: `package_id=eq.${packageId}`,
      },
      (payload) => {
        if (payload.new) onRow(payload.new as Record<string, unknown>);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}

export function useEnvironmentPackageEventSync(input: {
  packageId: string | null;
  historicalPreviewRevision: number | null;
  workbenchToolId: WorkbenchEditingToolId | null;
  onRefreshPackage: () => void;
}): EventSyncState {
  const [cursor, setCursor] = useState<EnvironmentPackageEventCursor>(() =>
    createInitialEventCursor(input.packageId)
  );
  const [lastInvalidationSet, setLastInvalidationSet] = useState<string[]>([]);
  const [currentPackageUpdated, setCurrentPackageUpdated] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);

  const cursorRef = useRef(cursor);
  cursorRef.current = cursor;
  const packageIdRef = useRef(input.packageId);
  packageIdRef.current = input.packageId;

  const fetchEvents = useCallback(
    async ({ packageId, afterSequence }: { packageId: string; afterSequence: number }) => {
      if (isEnvironmentPackageInMemoryOnly()) {
        return { ok: true, events: [] as EnvironmentPackageEvent[], latestSequence: afterSequence };
      }
      const res = await fetchEnvironmentPackageEvents({ packageId, afterSequence });
      if (!res.ok || !res.events) {
        return { ok: false, events: [] as EnvironmentPackageEvent[], error: res.error };
      }
      const events = res.events.map((row) => mapAuditRowToEnvironmentPackageEvent(row));
      return { ok: true, events, latestSequence: res.latestSequence };
    },
    []
  );

  const processIncomingEvent = useCallback(
    (event: EnvironmentPackageEvent) => {
      const activePackageId = packageIdRef.current;
      const processed = processEnvironmentPackageEvent(cursorRef.current, event);
      if (processed.action === 'reject') return;
      if (processed.action === 'duplicate') {
        setCursor(processed.cursor);
        return;
      }

      const reconciliation = reconcileExperienceLabWorkspace({
        event,
        activePackageId,
        historicalPreviewRevision: input.historicalPreviewRevision,
        activeWorkbenchTool: input.workbenchToolId,
      });

      if (!reconciliation.accepted) return;

      setCursor({
        ...processed.cursor,
        lastInvalidationSet: reconciliation.invalidations,
      });
      setLastInvalidationSet(reconciliation.invalidations);
      setCurrentPackageUpdated(reconciliation.currentPackageUpdated);

      if (reconciliation.refreshPackage) {
        input.onRefreshPackage();
      }

      if (processed.gapDetected && activePackageId) {
        void recoverEnvironmentPackageEventGap({
          packageId: activePackageId,
          cursor: processed.cursor,
          fetchEvents,
          fetchPackageStatus: async (id) => {
            const status = await fetchEnvironmentPackageStatus(id);
            return { ok: status.ok };
          },
        }).then((recovery) => {
          if (!recovery.recovered) return;
          setCursor(recovery.cursor);
          for (const recovered of recovery.events) {
            const again = processEnvironmentPackageEvent(recovery.cursor, recovered);
            if (again.action !== 'accept') continue;
            const recon = reconcileExperienceLabWorkspace({
              event: recovered,
              activePackageId: packageIdRef.current,
              historicalPreviewRevision: input.historicalPreviewRevision,
              activeWorkbenchTool: input.workbenchToolId,
            });
            if (recon.refreshPackage) input.onRefreshPackage();
          }
        });
      }
    },
    [fetchEvents, input.historicalPreviewRevision, input.onRefreshPackage, input.workbenchToolId]
  );

  useEffect(() => {
    resetEnvironmentPackageEventProcessor();
    resetEnvironmentPackageRealtimeThrottle();
    setCursor(createInitialEventCursor(input.packageId));
    setLastInvalidationSet([]);
    setCurrentPackageUpdated(false);

    if (!input.packageId) {
      setSubscriberCount(0);
      return;
    }

    const useSupabase = !isEnvironmentPackageInMemoryOnly();
    const client = createEnvironmentPackageRealtimeClient({
      packageId: input.packageId,
      fetchEvents,
      onEvent: processIncomingEvent,
      onConnectionStateChange: (state) => {
        setCursor((prev) => ({ ...prev, connectionState: state }));
      },
      subscribeSupabase: useSupabase ? createSupabaseAuditSubscriber : undefined,
    });

    setSubscriberCount(1);
    void client.reconnect();

    const onVisibility = () => {
      if (document.visibilityState === 'visible' && packageIdRef.current) {
        void recoverEnvironmentPackageEventGap({
          packageId: packageIdRef.current,
          cursor: cursorRef.current,
          fetchEvents,
        }).then((recovery) => {
          if (!recovery.recovered) return;
          setCursor(recovery.cursor);
          if (recovery.events.length > 0) input.onRefreshPackage();
        });
      }
    };

    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      client.dispose();
      document.removeEventListener('visibilitychange', onVisibility);
      setSubscriberCount(0);
    };
  }, [input.packageId, fetchEvents, processIncomingEvent, input.onRefreshPackage]);

  return {
    cursor,
    lastInvalidationSet,
    currentPackageUpdated,
    subscriberCount,
  };
}
