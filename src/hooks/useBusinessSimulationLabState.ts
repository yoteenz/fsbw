import { useCallback, useEffect, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import {
  resolveScenarioDecision,
  runLabSimulation,
  getOrganizationSimulationLabProfile,
  syncSimulationLabFromSources,
  type BusinessSimulationReport,
  type OrganizationSimulationLabProfile,
  type ScenarioLibraryEntry,
} from '../studio-os-core/business-simulation-lab';

export function useBusinessSimulationLabState() {
  const { workspaceId } = useWorkspace();
  const [profile, setProfile] = useState<OrganizationSimulationLabProfile | null>(null);
  const [lastReport, setLastReport] = useState<BusinessSimulationReport | null>(null);

  const refresh = useCallback(() => {
    const next = getOrganizationSimulationLabProfile(workspaceId) ?? syncSimulationLabFromSources(workspaceId);
    setProfile(next);
  }, [workspaceId]);

  const runSimulation = useCallback(
    (query: string) => {
      const report = runLabSimulation(workspaceId, query);
      setLastReport(report);
      refresh();
      return report;
    },
    [workspaceId, refresh]
  );

  const resolveDecision = useCallback(
    (
      scenarioId: string,
      decision: ScenarioLibraryEntry['decision'],
      actualResults?: string,
      lessonsLearned?: string[]
    ) => {
      resolveScenarioDecision(workspaceId, scenarioId, decision, actualResults, lessonsLearned);
      refresh();
    },
    [workspaceId, refresh]
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    const onUpdate = () => refresh();
    window.addEventListener('studio-os-business-simulation-lab-updated', onUpdate);
    window.addEventListener('studio-os-profession-brain-updated', onUpdate);
    window.addEventListener('studio-os-organization-digital-twin-updated', onUpdate);
    window.addEventListener('studio-os-executive-council-updated', onUpdate);
    window.addEventListener('studio-os-organization-boundary-changed', onUpdate);
    return () => {
      window.removeEventListener('studio-os-business-simulation-lab-updated', onUpdate);
      window.removeEventListener('studio-os-profession-brain-updated', onUpdate);
      window.removeEventListener('studio-os-organization-digital-twin-updated', onUpdate);
      window.removeEventListener('studio-os-executive-council-updated', onUpdate);
      window.removeEventListener('studio-os-organization-boundary-changed', onUpdate);
    };
  }, [refresh]);

  return { profile, lastReport, refresh, runSimulation, resolveDecision };
}
