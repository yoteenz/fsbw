import { useCallback, useEffect, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  advanceInaugurationPhase,
  advanceWalkthroughStop,
  buildInaugurationCeremonyState,
  completeHeadquartersEntry,
  ensureInaugurationFromBlueprint,
  getFoundingBlueprintSnapshot,
  isBlueprintReadyForInauguration,
  setInaugurationPhase,
  tickActivationProgress,
  type OrganizationInaugurationProfile,
} from '../studio-os-core/organization-inauguration';
import { getOrganizationDiscoveryBlueprint } from '../studio-os-core/business-discovery-blueprint';

export function useOrganizationInaugurationState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationInaugurationProfile | null>(null);

  const refresh = useCallback(() => {
    if (!isBlueprintReadyForInauguration(workspaceId)) {
      setProfile(null);
      return;
    }
    const next = ensureInaugurationFromBlueprint(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onReady = () => refresh();
    window.addEventListener('studio-os-blueprint-ready-for-inauguration', onReady);
    window.addEventListener('studio-os-organization-boundary-changed', onReady);
    return () => {
      window.removeEventListener('studio-os-blueprint-ready-for-inauguration', onReady);
      window.removeEventListener('studio-os-organization-boundary-changed', onReady);
    };
  }, [refresh]);

  const ceremonyState = useMemo(
    () => (profile ? buildInaugurationCeremonyState(workspaceId) : null),
    [profile, workspaceId]
  );

  const blueprint = useMemo(
    () => getOrganizationDiscoveryBlueprint(workspaceId),
    [profile, workspaceId]
  );

  const foundingSnapshot = useMemo(
    () => getFoundingBlueprintSnapshot(workspaceId),
    [profile, workspaceId]
  );

  const readyForInauguration = useMemo(
    () => isBlueprintReadyForInauguration(workspaceId),
    [profile, workspaceId]
  );

  const advancePhase = useCallback(() => {
    const next = advanceInaugurationPhase(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  const goToPhase = useCallback(
    (phase: OrganizationInaugurationProfile['currentPhase']) => {
      const next = setInaugurationPhase(workspaceId, phase);
      setProfile(next);
    },
    [workspaceId]
  );

  const powerOnStep = useCallback(() => {
    const next = tickActivationProgress(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  const nextWalkthroughStop = useCallback(() => {
    const next = advanceWalkthroughStop(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  const enterHeadquarters = useCallback(() => {
    const next = completeHeadquartersEntry(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  return {
    profile,
    ceremonyState,
    blueprint,
    foundingSnapshot,
    readyForInauguration,
    refresh,
    advancePhase,
    goToPhase,
    powerOnStep,
    nextWalkthroughStop,
    enterHeadquarters,
  };
}
