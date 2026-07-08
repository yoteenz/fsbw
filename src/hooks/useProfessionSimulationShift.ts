import { useCallback, useEffect, useState } from 'react';
import {
  advanceSimulationSession,
  applySessionToProgression,
  createInitialProgressionState,
  getSimulationPhasePayload,
  selectExecutionChoice,
  startSimulationSession,
  type LearnerProgressionState,
  type SimulationSession,
} from '../studio-os-core/profession-simulation-engine';
import {
  PROFESSION_SIMULATION_DEMO_LEARNER_ID,
  PROFESSION_SIMULATION_DEMO_PROFESSION_ID,
  PROFESSION_SIMULATION_DEMO_SCENE_ID,
  PROFESSION_SIMULATION_DEMO_STAGE_ID,
} from '../utils/adminStudioProfessionSimulationDemo';

export function useProfessionSimulationShift() {
  const [session, setSession] = useState<SimulationSession | null>(null);
  const [progression, setProgression] = useState<LearnerProgressionState>(() =>
    createInitialProgressionState({
      learnerId: PROFESSION_SIMULATION_DEMO_LEARNER_ID,
      professionId: PROFESSION_SIMULATION_DEMO_PROFESSION_ID,
      activeStageId: PROFESSION_SIMULATION_DEMO_STAGE_ID,
    })
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    startSimulationSession({
      professionId: PROFESSION_SIMULATION_DEMO_PROFESSION_ID,
      learnerId: PROFESSION_SIMULATION_DEMO_LEARNER_ID,
      stageId: PROFESSION_SIMULATION_DEMO_STAGE_ID,
      sceneId: PROFESSION_SIMULATION_DEMO_SCENE_ID,
    })
      .then((nextSession) => {
        if (!cancelled) {
          setSession(nextSession);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to start shift');
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const phasePayload = session ? getSimulationPhasePayload(session) : null;

  const advance = useCallback(() => {
    if (!session) return;

    setSession((current) => {
      if (!current) return current;
      const next = advanceSimulationSession({
        session: current,
        completedSceneIds: progression.completedSceneIds,
      });

      if (next.completed && next.rewards && next.evaluation) {
        setProgression((state) =>
          applySessionToProgression(state, {
            sceneId: next.shift.sceneId,
            reputationDelta: next.rewards?.reputationDelta ?? 0,
            skillEvidence: next.rewards?.skillEvidence ?? [],
            passed: next.evaluation?.passed ?? false,
          })
        );
      }

      return next;
    });
  }, [session, progression.completedSceneIds]);

  const chooseExecution = useCallback((choiceId: string) => {
    setSession((current) => (current ? selectExecutionChoice(current, choiceId) : current));
  }, []);

  return {
    session,
    phasePayload,
    progression,
    loading,
    error,
    advance,
    chooseExecution,
  };
}
