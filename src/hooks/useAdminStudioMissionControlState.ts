import { useCallback, useMemo, useState } from 'react';
import {
  PENDING_APPROVALS,
  searchMissionIndex,
  type PendingApproval,
} from '../utils/adminStudioMissionControlDemo';
import { ADMIN_STUDIO_STORAGE_KEYS, readStudioJson, writeStudioJson } from '../utils/adminStudioStorage';

type ApprovalStore = Record<string, 'pending' | 'approved'>;

type MissionControlStore = {
  approvals?: ApprovalStore;
  dismissedNotifications?: string[];
};

function readStore(): MissionControlStore {
  return readStudioJson<MissionControlStore>(ADMIN_STUDIO_STORAGE_KEYS.missionControl) ?? {};
}

function writeStore(store: MissionControlStore): void {
  writeStudioJson(ADMIN_STUDIO_STORAGE_KEYS.missionControl, store);
}

export function exportMissionControlSnapshot() {
  const store = readStore();
  return {
    approvals: store.approvals ?? {},
    dismissedNotifications: store.dismissedNotifications ?? [],
    source: 'mission-control-local' as const,
  };
}

export function useAdminStudioMissionControl() {
  const [searchQuery, setSearchQuery] = useState('');
  const [version, setVersion] = useState(0);
  const bump = useCallback(() => setVersion((v) => v + 1), []);

  const store = useMemo(() => {
    void version;
    return readStore();
  }, [version]);

  const approvals = useMemo((): Array<PendingApproval & { status: 'pending' | 'approved' }> => {
    const approvalStore = store.approvals ?? {};
    return PENDING_APPROVALS.map((a) => ({
      ...a,
      status: approvalStore[a.id] ?? 'pending',
    }));
  }, [store]);

  const pendingApprovalCount = approvals.filter((a) => a.status === 'pending').length;

  const searchResults = useMemo(() => searchMissionIndex(searchQuery), [searchQuery]);

  const dismissedNotifications = store.dismissedNotifications ?? [];

  const approveItem = useCallback(
    (id: string) => {
      const s = readStore();
      const approvals = { ...(s.approvals ?? {}), [id]: 'approved' as const };
      writeStore({ ...s, approvals });
      bump();
    },
    [bump]
  );

  const dismissNotification = useCallback(
    (id: string) => {
      const s = readStore();
      const dismissed = [...(s.dismissedNotifications ?? []), id];
      writeStore({ ...s, dismissedNotifications: dismissed });
      bump();
    },
    [bump]
  );

  return {
    searchQuery,
    setSearchQuery,
    searchResults,
    approvals,
    pendingApprovalCount,
    approveItem,
    dismissedNotifications,
    dismissNotification,
  };
}
