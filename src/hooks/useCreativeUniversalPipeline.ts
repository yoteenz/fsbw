import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  approveCreativeConcept,
  advanceCreativePipelinePhase,
  buildCreativeDirectorOrbRecommendations,
  CREATIVE_UNIVERSAL_PIPELINE_EVENT,
  CREATIVE_UNIVERSAL_PIPELINE_LABELS,
  CREATIVE_UNIVERSAL_PIPELINE_ORDER,
  enterConceptMergeLab,
  exitConceptMergeLab,
  formatConceptAnalysisLines,
  formatReuseLines,
  getActiveCreativeConcept,
  getApprovedCreativeConcept,
  getCreativeUniversalPipeline,
  isConceptApprovedForProduction,
  primaryOrbCreativeDirectorLine,
  runConceptMerge,
  selectCreativeConcept,
  setFounderIntent,
  deconstructionSummaryLines,
  analyzeConceptAssetReuse,
  type CreativeUniversalPipelinePhase,
} from '../studio-os-core/creative-direction-studio';

export function useCreativeUniversalPipeline(departmentId: string, projectId: string) {
  const [tick, setTick] = useState(0);
  const bump = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    const onUpdate = () => bump();
    window.addEventListener(CREATIVE_UNIVERSAL_PIPELINE_EVENT, onUpdate);
    return () => window.removeEventListener(CREATIVE_UNIVERSAL_PIPELINE_EVENT, onUpdate);
  }, [bump]);

  const pipeline = useMemo(() => {
    void tick;
    return getCreativeUniversalPipeline(departmentId, projectId);
  }, [departmentId, projectId, tick]);

  const activeConcept = useMemo(() => getActiveCreativeConcept(pipeline), [pipeline]);
  const approvedConcept = useMemo(() => getApprovedCreativeConcept(pipeline), [pipeline]);
  const conceptApproved = useMemo(
    () => isConceptApprovedForProduction(departmentId, projectId),
    [departmentId, projectId, tick]
  );

  const reuseAnalysis = useMemo(() => {
    if (!approvedConcept) return null;
    return analyzeConceptAssetReuse(projectId, approvedConcept);
  }, [approvedConcept, projectId]);

  const orbRecommendations = useMemo(
    () =>
      buildCreativeDirectorOrbRecommendations(
        pipeline.concepts,
        activeConcept,
        reuseAnalysis,
        pipeline.mergeLabActive
      ),
    [pipeline.concepts, activeConcept, reuseAnalysis, pipeline.mergeLabActive]
  );

  const orbPrimaryLine = useMemo(
    () => primaryOrbCreativeDirectorLine(orbRecommendations),
    [orbRecommendations]
  );

  const phaseIndex = CREATIVE_UNIVERSAL_PIPELINE_ORDER.indexOf(pipeline.phase);
  const phaseProgressPct = Math.round(((phaseIndex + 1) / CREATIVE_UNIVERSAL_PIPELINE_ORDER.length) * 100);

  const updateIntent = useCallback(
    (intent: string) => {
      setFounderIntent(departmentId, projectId, intent);
      bump();
    },
    [bump, departmentId, projectId]
  );

  const selectConcept = useCallback(
    (conceptId: string) => {
      selectCreativeConcept(departmentId, projectId, conceptId);
      bump();
    },
    [bump, departmentId, projectId]
  );

  const openMergeLab = useCallback(() => {
    enterConceptMergeLab(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

  const closeMergeLab = useCallback(() => {
    exitConceptMergeLab(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

  const mergeConcepts = useCallback(() => {
    runConceptMerge(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

  const approveConcept = useCallback(
    (conceptId?: string) => {
      approveCreativeConcept(departmentId, projectId, conceptId);
      bump();
    },
    [bump, departmentId, projectId]
  );

  const advancePhase = useCallback(
    (phase: CreativeUniversalPipelinePhase) => {
      advanceCreativePipelinePhase(departmentId, projectId, phase);
      bump();
    },
    [bump, departmentId, projectId]
  );

  return {
    pipeline,
    activeConcept,
    approvedConcept,
    conceptApproved,
    reuseAnalysis,
    orbRecommendations,
    orbPrimaryLine,
    phaseLabel: CREATIVE_UNIVERSAL_PIPELINE_LABELS[pipeline.phase],
    phaseProgressPct,
    formatConceptAnalysisLines,
    formatReuseLines,
    deconstructionSummaryLines,
    updateIntent,
    selectConcept,
    openMergeLab,
    closeMergeLab,
    mergeConcepts,
    approveConcept,
    advancePhase,
    refresh: bump,
  };
}
