import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { ensureOrganizationArchitectureProfile } from '../studio-os-core/industry-architecture';
import {
  ensureOrganizationProfessionBrainProfile,
  exportProfessionBrainSnapshot,
  listConciergeBrainBindings,
  recordBrainExportAction,
  recordLivingBrainSignal,
  resolveLivingBrainSignal,
  syncProfessionBrainFromSources,
  type OrganizationProfessionBrainProfile,
} from '../studio-os-core/profession-brain';

export function useProfessionBrainState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationProfessionBrainProfile | null>(null);

  const refresh = useCallback(() => {
    const arch = ensureOrganizationArchitectureProfile(workspaceId);
    const next =
      syncProfessionBrainFromSources(workspaceId, arch.industryId) ??
      ensureOrganizationProfessionBrainProfile(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  const conciergeBindings = useMemo(
    () => (profile ? listConciergeBrainBindings(profile) : []),
    [profile]
  );

  const exportSnapshot = useCallback(() => {
    if (!profile) return '';
    recordBrainExportAction(workspaceId);
    refresh();
    return exportProfessionBrainSnapshot(profile);
  }, [profile, workspaceId, refresh]);

  const recordLivingUpdate = useCallback(
    (phrase: string, brainId?: string) => {
      recordLivingBrainSignal(workspaceId, phrase, brainId);
      refresh();
    },
    [workspaceId, refresh]
  );

  const dismissLivingSignal = useCallback(
    (signalId: string) => {
      resolveLivingBrainSignal(workspaceId, signalId);
      refresh();
    },
    [workspaceId, refresh]
  );

  return {
    profile,
    conciergeBindings,
    refresh,
    exportSnapshot,
    recordLivingUpdate,
    dismissLivingSignal,
  };
}
