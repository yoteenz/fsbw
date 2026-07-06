import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  dismissWisdomDetection,
  preserveWisdomEntry,
  queueWisdomDetection,
  syncWisdomCaptureFromSources,
  type OrganizationWisdomProfile,
} from '../studio-os-core/wisdom-capture';

export function useWisdomCaptureState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationWisdomProfile | null>(null);
  const [detectionInput, setDetectionInput] = useState('I learned that trust must come before scale.');
  const [searchQuery, setSearchQuery] = useState('');

  const refresh = useCallback(() => {
    const next = syncWisdomCaptureFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-wisdom-capture-updated', onUpdate);
    window.addEventListener('studio-os-memory-engine-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-wisdom-capture-updated', onUpdate);
      window.removeEventListener('studio-os-memory-engine-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  const runDetection = useCallback(() => {
    queueWisdomDetection(workspaceId, detectionInput);
    refresh();
  }, [workspaceId, detectionInput, refresh]);

  const preservePending = useCallback(
    (pendingId: string) => {
      const pending = profile?.pendingDetections.find((p) => p.id === pendingId);
      if (!pending) return;
      preserveWisdomEntry(workspaceId, {
        wisdom: pending.extractedWisdom,
        category: pending.suggestedCategory,
        sourceText: pending.sourceText,
        pendingId: pending.id,
      });
      refresh();
    },
    [workspaceId, profile, refresh]
  );

  const dismissPending = useCallback(
    (pendingId: string) => {
      dismissWisdomDetection(workspaceId, pendingId);
      refresh();
    },
    [workspaceId, refresh]
  );

  const filteredLibrary =
    profile?.wisdomLibrary.filter((e) => {
      const q = searchQuery.trim().toLowerCase();
      if (!q) return true;
      return (
        e.wisdom.toLowerCase().includes(q) ||
        e.category.includes(q) ||
        e.searchableTags.some((t) => t.includes(q))
      );
    }) ?? [];

  return {
    profile,
    refresh,
    detectionInput,
    setDetectionInput,
    runDetection,
    preservePending,
    dismissPending,
    searchQuery,
    setSearchQuery,
    filteredLibrary,
  };
}
