import { useCallback, useEffect, useRef, useState } from 'react';
import type { CanonicalQueueSnapshot } from '../studio-os-core/canonical-studio-world/canonical-department-queue';
import { isCanonicalQueueActiveStatus } from '../studio-os-core/canonical-studio-world/canonical-department-queue';
import {
  fetchCanonicalDepartmentQueue,
  pollCanonicalDepartmentQueue,
  submitCanonicalDepartmentQueue,
} from '../services/studio/canonicalDepartment/api';
import type { CanonicalMainDepartmentId } from '../studio-os-core/canonical-studio-world/canonical-department-registry';

const POLL_MS = 5000;

export function useCanonicalDepartmentQueue() {
  const [queue, setQueue] = useState<CanonicalQueueSnapshot | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queueRef = useRef<CanonicalQueueSnapshot | null>(null);
  queueRef.current = queue;

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    const hasActive = queueRef.current?.entries.some((e) => isCanonicalQueueActiveStatus(e.status));
    const result = hasActive ? await pollCanonicalDepartmentQueue() : await fetchCanonicalDepartmentQueue();
    setLoading(false);
    if (!result.ok) {
      setError(result.error ?? 'Queue refresh failed');
      return;
    }
    if (result.queue) setQueue(result.queue);
  }, []);

  const submitBatch = useCallback(
    async (input: { departmentIds: CanonicalMainDepartmentId[]; confirmed: boolean }) => {
      setSubmitting(true);
      setError(null);
      const result = await submitCanonicalDepartmentQueue(input);
      setSubmitting(false);
      if (!result.ok) {
        setError(result.error ?? result.message ?? 'Queue submit failed');
        return result;
      }
      if (result.queue) setQueue(result.queue);
      void refresh();
      return result;
    },
    [refresh]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    const active = queue?.entries.some((e) => isCanonicalQueueActiveStatus(e.status)) ?? false;
    if (!active) return undefined;
    const id = setInterval(() => {
      void refresh();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [queue?.entries, refresh]);

  const renderStatusByDepartment = useCallback(() => {
    const map = new Map<CanonicalMainDepartmentId, string>();
    if (!queue) return map;
    for (const entry of queue.entries) {
      const existing = map.get(entry.departmentId);
      if (!existing || entry.renderKind === 'landscape') {
        map.set(entry.departmentId, entry.status);
      }
    }
    return map;
  }, [queue]);

  return {
    queue,
    loading,
    submitting,
    error,
    refresh,
    submitBatch,
    renderStatusByDepartment,
  };
}
