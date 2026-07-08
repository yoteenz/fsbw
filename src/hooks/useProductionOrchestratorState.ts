import { useCallback } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { useStudioProfileState } from './useStudioProfileState';
import {
  STUDIO_OS_PRODUCTION_ORCHESTRATOR_UPDATED,
  approveProductionHandoff,
  approveProductionTask,
  completeImplementation,
  createProductionBoardTask,
  getOrganizationProductionOrchestratorProfile,
  markArchitectureRunning,
  saveArchitectureOutput,
  setDependenciesResolved,
  startComposerImplementation,
  syncProductionOrchestratorFromSources,
  advanceMediaQueue,
  toggleProductionChecklistItem,
  advanceProductionQualityGate,
  markProductionComplete,
  type CreateProductionTaskInput,
  type ProductionOrchestratorProfile,
} from '../studio-os-core/production-orchestrator';

export function useProductionOrchestratorState() {
  const { workspaceId } = useWorkspace();
  const state = useStudioProfileState<ProductionOrchestratorProfile>({
    getProfile: getOrganizationProductionOrchestratorProfile,
    syncProfile: syncProductionOrchestratorFromSources,
    updatedEvent: STUDIO_OS_PRODUCTION_ORCHESTRATOR_UPDATED,
  });

  const createTask = useCallback(
    (input: CreateProductionTaskInput) => {
      const next = createProductionBoardTask(workspaceId, input);
      state.load(false);
      return next;
    },
    [state, workspaceId]
  );

  const runAction = useCallback(
    (action: () => ProductionOrchestratorProfile) => {
      const next = action();
      state.load(false);
      return next;
    },
    [state]
  );

  return {
    ...state,
    createTask,
    markArchitectureRunning: (taskId: string) => runAction(() => markArchitectureRunning(workspaceId, taskId)),
    saveArchitectureOutput: (taskId: string, output: string) => runAction(() => saveArchitectureOutput(workspaceId, taskId, output)),
    setDependenciesResolved: (taskId: string, resolved: boolean) => runAction(() => setDependenciesResolved(workspaceId, taskId, resolved)),
    approveProductionHandoff: (taskId: string) => runAction(() => approveProductionHandoff(workspaceId, taskId)),
    startComposerImplementation: (taskId: string) => runAction(() => startComposerImplementation(workspaceId, taskId)),
    completeImplementation: (taskId: string, output: string) => runAction(() => completeImplementation(workspaceId, taskId, output)),
    advanceMediaQueue: (taskId: string) => runAction(() => advanceMediaQueue(workspaceId, taskId)),
    approveProductionTask: (taskId: string) => runAction(() => approveProductionTask(workspaceId, taskId)),
    toggleChecklistItem: (taskId: string, itemId: string, passed: boolean) =>
      runAction(() => toggleProductionChecklistItem(workspaceId, taskId, itemId, passed)),
    advanceQualityGate: (taskId: string) => runAction(() => advanceProductionQualityGate(workspaceId, taskId)),
    markProductionComplete: (taskId: string) => runAction(() => markProductionComplete(workspaceId, taskId)),
  };
}
