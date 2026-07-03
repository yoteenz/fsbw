import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ADMIN_STUDIO_AI_DEFAULT_FORM,
  ADMIN_STUDIO_AI_PIPELINE_STEPS,
  type AdminStudioAiFormState,
  type AdminStudioAiPipelineStepId,
} from '../utils/adminStudioAiStudioDemo';

const FORM_STORAGE_KEY = 'adminStudioAiForm_v1';

type PipelinePhase = 'idle' | 'running' | 'complete';

function readForm(): AdminStudioAiFormState {
  try {
    const raw = localStorage.getItem(FORM_STORAGE_KEY);
    if (!raw) return { ...ADMIN_STUDIO_AI_DEFAULT_FORM };
    return { ...ADMIN_STUDIO_AI_DEFAULT_FORM, ...JSON.parse(raw) };
  } catch {
    return { ...ADMIN_STUDIO_AI_DEFAULT_FORM };
  }
}

function writeForm(form: AdminStudioAiFormState): void {
  localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(form));
}

const STEP_MS = 720;

export function useAdminStudioAiStudioState() {
  const [form, setForm] = useState<AdminStudioAiFormState>(readForm);
  const [pipelinePhase, setPipelinePhase] = useState<PipelinePhase>('idle');
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<AdminStudioAiPipelineStepId>>(new Set());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const updateForm = useCallback(<K extends keyof AdminStudioAiFormState>(key: K, value: AdminStudioAiFormState[K]) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      writeForm(next);
      return next;
    });
  }, []);

  const toggleMulti = useCallback((key: 'featuredProducts' | 'distributionTargets' | 'desiredOutputs', item: string) => {
    setForm((prev) => {
      const list = prev[key];
      const nextList = list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
      const next = { ...prev, [key]: nextList };
      writeForm(next);
      return next;
    });
  }, []);

  const startGeneration = useCallback(() => {
    clearTimer();
    setPipelinePhase('running');
    setActiveStepIndex(0);
    setCompletedSteps(new Set());

    const advance = (index: number) => {
      if (index >= ADMIN_STUDIO_AI_PIPELINE_STEPS.length) {
        setPipelinePhase('complete');
        setActiveStepIndex(-1);
        return;
      }
      setActiveStepIndex(index);
      timerRef.current = setTimeout(() => {
        const stepId = ADMIN_STUDIO_AI_PIPELINE_STEPS[index].id;
        setCompletedSteps((prev) => new Set([...prev, stepId]));
        advance(index + 1);
      }, STEP_MS);
    };

    advance(0);
  }, [clearTimer]);

  const resetPipeline = useCallback(() => {
    clearTimer();
    setPipelinePhase('idle');
    setActiveStepIndex(-1);
    setCompletedSteps(new Set());
  }, [clearTimer]);

  return {
    form,
    updateForm,
    toggleMulti,
    pipelinePhase,
    activeStepIndex,
    completedSteps,
    startGeneration,
    resetPipeline,
  };
}
