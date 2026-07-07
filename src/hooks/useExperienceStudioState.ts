import { useCallback, useMemo, useState } from 'react';
import { useWorkspace } from '../studio-os-core/context/WorkspaceProvider';
import { buildDigitalArchitectSeed } from '../studio-os-core/digital-architect/bootstrap';
import {
  bootstrapDigitalArchitectStore,
  readDigitalArchitectStore,
} from '../studio-os-core/digital-architect/store';
import {
  advanceInterview,
  applyRemix,
  goBackInterview,
  readExperienceStudioSession,
  resetExperienceStudioSession,
  selectExperienceType,
  setStudioPanel,
  updateDesignDna,
  updateExperienceDna,
} from '../studio-os-core/experience-studio';
import type { ExperienceStudioSession, ExperienceTypeId, InterviewStep, StudioPanelId } from '../studio-os-core/experience-studio';
import {
  overallDesignHealthScore,
  resolveCanvasTokens,
  resolveCreativeDirectorCritiques,
  resolveDesignHealth,
} from '../studio-os-core/experience-studio';

function ensureDigitalArchitectSeeded(): void {
  bootstrapDigitalArchitectStore(buildDigitalArchitectSeed());
}

export function useExperienceStudioState() {
  const { workspaceId, workspace } = useWorkspace();
  const organizationId = workspaceId;
  const [revision, setRevision] = useState(0);

  const bump = useCallback(() => setRevision((r) => r + 1), []);

  const session = useMemo(() => {
    void revision;
    return readExperienceStudioSession(organizationId);
  }, [organizationId, revision]);

  const architectStore = useMemo(() => {
    void revision;
    ensureDigitalArchitectSeeded();
    return readDigitalArchitectStore();
  }, [revision]);

  const canvasTokens = useMemo(() => resolveCanvasTokens(session), [session]);
  const critiques = useMemo(() => resolveCreativeDirectorCritiques(session), [session]);
  const designHealth = useMemo(() => resolveDesignHealth(session), [session]);
  const designHealthScore = useMemo(() => overallDesignHealthScore(designHealth), [designHealth]);

  const pickExperienceType = useCallback(
    (type: ExperienceTypeId) => {
      selectExperienceType(organizationId, type);
      bump();
    },
    [organizationId, bump]
  );

  const answerInterview = useCallback(
    (step: InterviewStep, choice: string) => {
      advanceInterview(organizationId, step, choice);
      bump();
    },
    [organizationId, bump]
  );

  const openPanel = useCallback(
    (panel: StudioPanelId) => {
      setStudioPanel(organizationId, panel);
      bump();
    },
    [organizationId, bump]
  );

  const closePanel = useCallback(() => {
    setStudioPanel(organizationId, 'none');
    bump();
  }, [organizationId, bump]);

  const setDesignDna = useCallback(
    (designDna: Record<string, number>) => {
      updateDesignDna(organizationId, designDna);
      bump();
    },
    [organizationId, bump]
  );

  const setExperienceDnaSlider = useCallback(
    (key: keyof ExperienceStudioSession['experienceDna'], value: number) => {
      updateExperienceDna(organizationId, key, value);
      bump();
    },
    [organizationId, bump]
  );

  const remix = useCallback(
    (label: string) => {
      applyRemix(organizationId, label);
      bump();
    },
    [organizationId, bump]
  );

  const restart = useCallback(() => {
    resetExperienceStudioSession(organizationId);
    bump();
  }, [organizationId, bump]);

  const backInterview = useCallback(() => {
    goBackInterview(organizationId);
    bump();
  }, [organizationId, bump]);

  return {
    organizationId,
    companyName: architectStore.companyName || workspace.displayName,
    session,
    architectStore,
    canvasTokens,
    critiques,
    designHealth,
    designHealthScore,
    pickExperienceType,
    answerInterview,
    openPanel,
    closePanel,
    setDesignDna,
    setExperienceDnaSlider,
    remix,
    restart,
    backInterview,
  };
}
