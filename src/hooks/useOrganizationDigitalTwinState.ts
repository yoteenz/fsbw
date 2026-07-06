import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  runSandboxWhatIfSimulation,
  syncDigitalTwinFromSources,
  type OrganizationDigitalTwinProfile,
  type WhatIfSimulationResult,
} from '../studio-os-core/organization-digital-twin';

export function useOrganizationDigitalTwinState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationDigitalTwinProfile | null>(null);
  const [lastSimulation, setLastSimulation] = useState<WhatIfSimulationResult | null>(null);

  const refresh = useCallback(() => {
    const next = syncDigitalTwinFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  const runWhatIf = useCallback(
    (query: string) => {
      const result = runSandboxWhatIfSimulation(workspaceId, query);
      setLastSimulation(result);
      refresh();
      return result;
    },
    [workspaceId, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-organization-digital-twin-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-pulse-updated', onUpdate);
    window.addEventListener('studio-os-company-health-index-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-organization-digital-twin-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-pulse-updated', onUpdate);
      window.removeEventListener('studio-os-company-health-index-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, lastSimulation, refresh, runWhatIf };
}
