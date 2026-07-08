import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  approveCreativeConcept,
  advanceCreativePipelinePhase,
  buildChairmanOrbRecommendations,
  buildCreativeDirectorOrbRecommendations,
  CREATIVE_UNIVERSAL_PIPELINE_EVENT,
  CREATIVE_UNIVERSAL_PIPELINE_LABELS,
  CREATIVE_UNIVERSAL_PIPELINE_ORDER,
  enterConceptMergeLab,
  enterReviewChamber,
  exitConceptMergeLab,
  exitReviewChamber,
  formatConceptAnalysisLines,
  formatHeadToHeadReplay,
  formatReuseLines,
  finalistCompositeScores,
  getActiveCreativeConcept,
  getApprovedCreativeConcept,
  getCreativeUniversalPipeline,
  getTournamentFinalistConcepts,
  isConceptApprovedForProduction,
  primaryChairmanLine,
  primaryOrbCreativeDirectorLine,
  recordFounderTournamentDecision,
  runConceptMerge,
  runFutureTournamentInStore,
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
  const finalistConcepts = useMemo(() => getTournamentFinalistConcepts(pipeline), [pipeline]);
  const conceptApproved = useMemo(
    () => isConceptApprovedForProduction(departmentId, projectId),
    [departmentId, projectId, tick]
  );

  const reuseAnalysis = useMemo(() => {
    if (!approvedConcept) return null;
    return analyzeConceptAssetReuse(projectId, approvedConcept);
  }, [approvedConcept, projectId]);

  const chairmanLines = useMemo(
    () =>
      buildChairmanOrbRecommendations(
        pipeline.tournamentResult,
        pipeline.concepts,
        pipeline.tournamentLearning
      ),
    [pipeline.tournamentResult, pipeline.concepts, pipeline.tournamentLearning]
  );

  const orbRecommendations = useMemo(
    () =>
      pipeline.tournamentResult
        ? chairmanLines
        : buildCreativeDirectorOrbRecommendations(
            pipeline.concepts,
            activeConcept,
            reuseAnalysis,
            pipeline.mergeLabActive
          ),
    [pipeline.tournamentResult, chairmanLines, pipeline.concepts, activeConcept, reuseAnalysis, pipeline.mergeLabActive]
  );

  const orbPrimaryLine = useMemo(
    () =>
      pipeline.tournamentResult
        ? primaryChairmanLine(chairmanLines)
        : primaryOrbCreativeDirectorLine(
            buildCreativeDirectorOrbRecommendations(
              pipeline.concepts,
              activeConcept,
              reuseAnalysis,
              pipeline.mergeLabActive
            )
          ),
    [pipeline.tournamentResult, chairmanLines, pipeline.concepts, activeConcept, reuseAnalysis, pipeline.mergeLabActive]
  );

  const finalistScores = useMemo(
    () =>
      pipeline.tournamentResult
        ? finalistCompositeScores(pipeline.tournamentResult, pipeline.concepts)
        : [],
    [pipeline.tournamentResult, pipeline.concepts]
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

  const runTournament = useCallback(() => {
    runFutureTournamentInStore(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

  const openReviewChamber = useCallback(() => {
    enterReviewChamber(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

  const closeReviewChamber = useCallback(() => {
    exitReviewChamber(departmentId, projectId);
    bump();
  }, [bump, departmentId, projectId]);

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
    recordFounderTournamentDecision(departmentId, projectId, 'request-merge', 'Chairman merge path');
    bump();
  }, [bump, departmentId, projectId]);

  const approveConcept = useCallback(
    (conceptId?: string) => {
      approveCreativeConcept(departmentId, projectId, conceptId);
      bump();
    },
    [bump, departmentId, projectId]
  );

  const acceptChairmanRecommendation = useCallback(() => {
    const t = pipeline.tournamentResult;
    if (!t) return;
    recordFounderTournamentDecision(departmentId, projectId, 'accept-chairman', t.championship.chairmanSummary);
    if (t.championship.recommendMerge) {
      enterConceptMergeLab(departmentId, projectId);
    } else if (t.championship.clearWinnerId) {
      selectCreativeConcept(departmentId, projectId, t.championship.clearWinnerId);
    }
    bump();
  }, [bump, departmentId, projectId, pipeline.tournamentResult]);

  const rejectChairmanRecommendation = useCallback(() => {
    recordFounderTournamentDecision(departmentId, projectId, 'reject-chairman', 'Founder override');
    bump();
  }, [bump, departmentId, projectId]);

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
    finalistConcepts,
    finalistScores,
    conceptApproved,
    reuseAnalysis,
    chairmanLines,
    orbRecommendations,
    orbPrimaryLine,
    phaseLabel: CREATIVE_UNIVERSAL_PIPELINE_LABELS[pipeline.phase],
    phaseProgressPct,
    formatConceptAnalysisLines,
    formatReuseLines,
    formatHeadToHeadReplay,
    deconstructionSummaryLines,
    updateIntent,
    selectConcept,
    runTournament,
    openReviewChamber,
    closeReviewChamber,
    openMergeLab,
    closeMergeLab,
    mergeConcepts,
    approveConcept,
    acceptChairmanRecommendation,
    rejectChairmanRecommendation,
    advancePhase,
    refresh: bump,
  };
}
