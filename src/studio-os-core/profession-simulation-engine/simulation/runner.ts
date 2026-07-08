import { randomUUID } from '../utils/id';
import { getProfessionDefinition } from '../catalog';
import { ensureNPCStates } from '../characters/store';
import { shiftFromScene } from '../jobs/schema';
import { getPromotionReadinessSummary } from '../progression/resolution';
import { requestProfessionBrainSimulation } from '../profession-brains/stub-adapter';
import { scenarioFromBrainPayload } from '../scenarios/generator';
import type { ScenarioBlueprint } from '../scenarios/schema';
import {
  canAdvanceFromPhase,
  nextPhase,
  SIMULATION_LOOP_DESCRIPTIONS,
  SIMULATION_LOOP_LABELS,
} from './loop';
import type {
  SimulationEvaluationResult,
  SimulationExecutionChoice,
  SimulationFeedbackBundle,
  SimulationKnowledgeUpdate,
  SimulationPhasePayload,
  SimulationRewardBundle,
  SimulationSession,
} from './schema';

export type StartSimulationInput = {
  professionId: string;
  learnerId: string;
  stageId?: string;
  sceneId?: string;
};

export function buildExecutionChoices(sceneId: string): SimulationExecutionChoice[] {
  return [
    {
      id: `${sceneId}-choice-careful`,
      label: 'Follow protocol carefully and communicate each step.',
      skillTag: 'professional-discipline',
      qualityScore: 0.92,
    },
    {
      id: `${sceneId}-choice-rush`,
      label: 'Move quickly to keep the schedule, skipping one check.',
      skillTag: 'time-pressure',
      qualityScore: 0.58,
    },
    {
      id: `${sceneId}-choice-mentor`,
      label: 'Pause and ask the mentor before proceeding.',
      skillTag: 'judgment',
      qualityScore: 0.85,
    },
  ];
}

function evaluateSession(
  session: SimulationSession,
  choice?: SimulationExecutionChoice
): SimulationEvaluationResult {
  const quality = choice?.qualityScore ?? 0.75;
  const criteriaScores = session.scenario.evaluationCriteriaIds.map((criterionId, index) => {
    const variance = index % 2 === 0 ? 0.05 : -0.03;
    const score = Math.min(1, Math.max(0, quality + variance));
    return { criterionId, score, passed: score >= 0.7 };
  });

  const overallScore =
    criteriaScores.reduce((sum, entry) => sum + entry.score, 0) / Math.max(criteriaScores.length, 1);

  return {
    criteriaScores,
    overallScore,
    passed: overallScore >= 0.7,
  };
}

function buildFeedback(session: SimulationSession, evaluation: SimulationEvaluationResult): SimulationFeedbackBundle {
  const mentor = session.npcStates.find((npc) => npc.role === 'mentor');
  const client = session.npcStates.find((npc) => npc.role === 'client');

  return {
    mentorSummary: mentor
      ? `${mentor.displayName}: ${evaluation.passed ? 'Solid shift — keep refining technique and timing.' : 'Recovery needed — review protocol before the next client.'}`
      : 'Mentor feedback will appear once a mentor character is assigned.',
    clientSummary: client
      ? `${client.displayName}: ${evaluation.passed ? 'Felt cared for and informed throughout the service.' : 'Needs clearer communication and comfort checks.'}`
      : undefined,
    improvementFocus: evaluation.passed
      ? ['Maintain consistency under rush', 'Document outcomes clearly']
      : ['Slow down at critical checkpoints', 'Reset station before next appointment'],
  };
}

function buildKnowledgeUpdates(session: SimulationSession): SimulationKnowledgeUpdate[] {
  return session.scenario.knowledgeTopicIds.map((topicId, index) => ({
    topicId,
    label: session.shift.objectives[index] ?? `Workplace knowledge ${index + 1}`,
    masteryDelta: session.evaluation?.passed ? 0.08 : 0.03,
  }));
}

function buildRewards(session: SimulationSession): SimulationRewardBundle {
  const baseReputation = session.evaluation?.passed ? 6 : 2;
  const unexpectedPenalty = session.triggeredUnexpectedEvent ? 1 : 0;

  return {
    reputationDelta: baseReputation - unexpectedPenalty,
    skillEvidence: session.shift.objectives.slice(0, 2),
    certificationProgress: session.evaluation?.passed ? ['Shift competency evidence recorded'] : undefined,
  };
}

export async function startSimulationSession(input: StartSimulationInput): Promise<SimulationSession> {
  const profession = getProfessionDefinition(input.professionId);
  if (!profession) {
    throw new Error(`Unknown profession simulation: ${input.professionId}`);
  }

  const stage =
    profession.careerStages.find((candidate) => candidate.id === input.stageId) ??
    profession.careerStages[0];
  if (!stage) {
    throw new Error(`Profession has no career stages: ${input.professionId}`);
  }

  const scene =
    profession.simulationScenes.find((candidate) => candidate.id === input.sceneId) ??
    profession.simulationScenes.find((candidate) => stage.sceneIds.includes(candidate.id)) ??
    profession.simulationScenes[0];
  if (!scene) {
    throw new Error(`No playable scene for stage: ${stage.id}`);
  }

  const brainPayload = await requestProfessionBrainSimulation({
    professionBrainId: profession.professionBrainId,
    professionId: profession.id,
    stageId: stage.id,
    sceneId: scene.id,
    sceneType: scene.sceneType,
    environment: scene.environment,
    learnerId: input.learnerId,
  });

  const blueprint: ScenarioBlueprint = {
    id: scene.id,
    professionId: profession.id,
    professionBrainId: profession.professionBrainId,
    kind: scene.sceneType,
    displayName: scene.displayName,
    environment: scene.environment,
    briefing: brainPayload.briefing,
    missionSummary: brainPayload.mission.learnerAction,
    characterIds: scene.aiCharacters,
    knowledgeTopicIds: [],
    unexpectedEventPool: brainPayload.unexpectedEvents,
    sourceArtifactIds: brainPayload.sourceArtifactIds,
  };

  const scenario = scenarioFromBrainPayload(blueprint, brainPayload);
  const shift = shiftFromScene({ professionId: profession.id, stageId: stage.id, scene });
  const characters = profession.aiCharacters.filter((character) => scene.aiCharacters.includes(character.id));
  const npcStates = ensureNPCStates(profession.id, input.learnerId, characters);
  const now = new Date().toISOString();

  return {
    id: randomUUID(),
    professionId: profession.id,
    learnerId: input.learnerId,
    stageId: stage.id,
    shift,
    scenario,
    phase: 'arrival',
    phaseIndex: 0,
    startedAt: now,
    updatedAt: now,
    activeCharacterIds: scene.aiCharacters,
    npcStates,
    knowledgeUpdates: [],
    completed: false,
  };
}

export function getSimulationPhasePayload(session: SimulationSession): SimulationPhasePayload {
  const phase = session.phase;
  const headline = SIMULATION_LOOP_LABELS[phase];
  const description = SIMULATION_LOOP_DESCRIPTIONS[phase];

  switch (phase) {
    case 'arrival':
      return {
        phase,
        headline,
        body: `You arrive at ${session.shift.environment}. Clock in and prepare for the shift.`,
        canAdvance: true,
      };
    case 'briefing':
      return {
        phase,
        headline,
        body: session.scenario.briefing,
        canAdvance: true,
      };
    case 'mission':
      return {
        phase,
        headline: session.scenario.displayName,
        body: session.scenario.missionSummary,
        canAdvance: true,
      };
    case 'execution':
      return {
        phase,
        headline,
        body: 'Choose how you perform the work. Your judgment affects evaluation.',
        choices: buildExecutionChoices(session.shift.sceneId),
        canAdvance: Boolean(session.selectedExecutionChoiceId),
      };
    case 'unexpected-event':
      return {
        phase,
        headline: 'Workplace Surprise',
        body:
          session.triggeredUnexpectedEvent ??
          session.scenario.unexpectedEventPool[0] ??
          'An unexpected situation requires professional judgment.',
        canAdvance: Boolean(session.triggeredUnexpectedEvent),
      };
    case 'evaluation':
      return {
        phase,
        headline,
        body: session.evaluation
          ? `Overall score: ${Math.round(session.evaluation.overallScore * 100)}% · ${session.evaluation.passed ? 'Pass' : 'Needs improvement'}`
          : description,
        canAdvance: true,
      };
    case 'feedback':
      return {
        phase,
        headline,
        body: session.feedback?.mentorSummary ?? description,
        canAdvance: true,
      };
    case 'knowledge-update':
      return {
        phase,
        headline,
        body:
          session.knowledgeUpdates.length > 0
            ? session.knowledgeUpdates.map((entry) => `${entry.label} (+${Math.round(entry.masteryDelta * 100)}%)`).join(' · ')
            : description,
        canAdvance: true,
      };
    case 'rewards':
      return {
        phase,
        headline,
        body: session.rewards
          ? `Reputation +${session.rewards.reputationDelta} · Evidence: ${session.rewards.skillEvidence.join(', ')}`
          : description,
        canAdvance: true,
      };
    case 'promotion-progress':
      return {
        phase,
        headline,
        body: session.promotionProgress
          ? `${session.promotionProgress.completedScenes}/${session.promotionProgress.requiredScenes} required shifts complete · ${session.promotionProgress.readyForPromotion ? 'Ready for promotion review' : 'Keep building shift evidence'}`
          : description,
        canAdvance: true,
      };
    default:
      return { phase, headline, body: description, canAdvance: true };
  }
}

export type AdvanceSimulationInput = {
  session: SimulationSession;
  executionChoiceId?: string;
  completedSceneIds?: string[];
};

export function advanceSimulationSession(input: AdvanceSimulationInput): SimulationSession {
  const session = { ...input.session, npcStates: [...input.session.npcStates] };
  const now = new Date().toISOString();

  if (session.phase === 'execution' && input.executionChoiceId) {
    session.selectedExecutionChoiceId = input.executionChoiceId;
  }

  if (
    !canAdvanceFromPhase(session.phase, {
      hasExecutionChoice: Boolean(session.selectedExecutionChoiceId),
      hasUnexpectedEvent: Boolean(session.triggeredUnexpectedEvent),
    })
  ) {
    return session;
  }

  if (session.phase === 'execution' && session.selectedExecutionChoiceId && !session.triggeredUnexpectedEvent) {
    const pool = session.scenario.unexpectedEventPool;
    session.triggeredUnexpectedEvent = pool[Math.floor(Math.random() * pool.length)] ?? 'A workplace surprise requires judgment.';
  }

  if (session.phase === 'execution' && session.selectedExecutionChoiceId) {
    const choice = buildExecutionChoices(session.shift.sceneId).find(
      (candidate) => candidate.id === session.selectedExecutionChoiceId
    );
    session.evaluation = evaluateSession(session, choice);
  }

  if (session.phase === 'unexpected-event' && session.evaluation && !session.feedback) {
    session.feedback = buildFeedback(session, session.evaluation);
  }

  if (session.phase === 'feedback' && session.feedback && session.knowledgeUpdates.length === 0) {
    session.knowledgeUpdates = buildKnowledgeUpdates(session);
  }

  if (session.phase === 'knowledge-update' && !session.rewards) {
    session.rewards = buildRewards(session);
  }

  if (session.phase === 'rewards' && !session.promotionProgress) {
    const completed = [...(input.completedSceneIds ?? []), session.shift.sceneId];
    const readiness = getPromotionReadinessSummary(session.professionId, session.stageId, completed);
    session.promotionProgress = {
      stageId: session.stageId,
      completedScenes: readiness.completedRequiredScenes,
      requiredScenes: readiness.totalRequiredScenes,
      readyForPromotion: readiness.readyForPromotion,
    };
  }

  const upcoming = nextPhase(session.phase);
  if (!upcoming) {
    session.completed = true;
    session.updatedAt = now;
    return session;
  }

  session.phase = upcoming;
  session.phaseIndex += 1;
  session.updatedAt = now;

  if (upcoming === 'promotion-progress') {
    session.completed = true;
  }

  return session;
}

export function selectExecutionChoice(
  session: SimulationSession,
  executionChoiceId: string
): SimulationSession {
  return { ...session, selectedExecutionChoiceId: executionChoiceId, updatedAt: new Date().toISOString() };
}
