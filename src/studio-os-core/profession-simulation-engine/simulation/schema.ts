/**
 * Simulation loop schema — every shift follows the same workplace rhythm.
 */

import type { ProfessionId } from '../types';
import type { GeneratedScenario } from '../scenarios/schema';
import type { ShiftDefinition } from '../jobs/schema';
import type { PersistentNPCState } from '../characters/schema';

export const SIMULATION_LOOP_PHASES = [
  'arrival',
  'briefing',
  'mission',
  'execution',
  'unexpected-event',
  'evaluation',
  'feedback',
  'knowledge-update',
  'rewards',
  'promotion-progress',
] as const;

export type SimulationLoopPhase = (typeof SIMULATION_LOOP_PHASES)[number];

export type SimulationExecutionChoice = {
  id: string;
  label: string;
  skillTag: string;
  qualityScore: number;
};

export type SimulationEvaluationResult = {
  criteriaScores: Array<{ criterionId: string; score: number; passed: boolean }>;
  overallScore: number;
  passed: boolean;
};

export type SimulationFeedbackBundle = {
  mentorSummary: string;
  clientSummary?: string;
  improvementFocus: string[];
};

export type SimulationKnowledgeUpdate = {
  topicId: string;
  label: string;
  masteryDelta: number;
};

export type SimulationRewardBundle = {
  reputationDelta: number;
  skillEvidence: string[];
  certificationProgress?: string[];
};

export type SimulationPromotionProgress = {
  stageId: string;
  completedScenes: number;
  requiredScenes: number;
  readyForPromotion: boolean;
};

export type SimulationSession = {
  id: string;
  professionId: ProfessionId;
  learnerId: string;
  stageId: string;
  shift: ShiftDefinition;
  scenario: GeneratedScenario;
  phase: SimulationLoopPhase;
  phaseIndex: number;
  startedAt: string;
  updatedAt: string;
  activeCharacterIds: string[];
  npcStates: PersistentNPCState[];
  selectedExecutionChoiceId?: string;
  triggeredUnexpectedEvent?: string;
  evaluation?: SimulationEvaluationResult;
  feedback?: SimulationFeedbackBundle;
  knowledgeUpdates: SimulationKnowledgeUpdate[];
  rewards?: SimulationRewardBundle;
  promotionProgress?: SimulationPromotionProgress;
  completed: boolean;
};

export type SimulationPhasePayload = {
  phase: SimulationLoopPhase;
  headline: string;
  body: string;
  choices?: SimulationExecutionChoice[];
  canAdvance: boolean;
};
