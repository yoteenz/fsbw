import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  addFounderArchiveEntry,
  createTimeCapsule,
  getOrganizationLegacyVaultProfile,
  preserveLegacyMoment,
  syncLegacyVaultFromSources,
  type OrganizationLegacyVaultProfile,
  type TimeCapsuleTrigger,
} from '../studio-os-core/legacy-vault';

export function useLegacyVaultState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationLegacyVaultProfile | null>(null);

  const refresh = useCallback(() => {
    const next = getOrganizationLegacyVaultProfile(workspaceId) ?? syncLegacyVaultFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  const preserveMoment = useCallback(
    (title: string, summary: string, category: Parameters<typeof preserveLegacyMoment>[3]) => {
      preserveLegacyMoment(workspaceId, title, summary, category);
      refresh();
    },
    [workspaceId, refresh]
  );

  const addFounderReflection = useCallback(
    (title: string, content: string) => {
      addFounderArchiveEntry(workspaceId, {
        archiveType: 'reflection',
        title,
        content,
        private: true,
      });
      refresh();
    },
    [workspaceId, refresh]
  );

  const sealTimeCapsule = useCallback(
    (title: string, trigger: TimeCapsuleTrigger, contents: string[], message?: string) => {
      createTimeCapsule(workspaceId, title, trigger, contents, message);
      refresh();
    },
    [workspaceId, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-legacy-vault-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-wisdom-capture-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-legacy-vault-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-wisdom-capture-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, refresh, preserveMoment, addFounderReflection, sealTimeCapsule };
}
