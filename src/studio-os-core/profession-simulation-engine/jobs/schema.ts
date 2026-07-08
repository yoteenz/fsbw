/**
 * Job and shift schema — workplace units inside a simulation.
 */

import type { ProfessionId } from '../types';

export type JobKind = 'shift' | 'appointment' | 'project' | 'inspection' | 'orientation';

export type JobDefinition = {
  id: string;
  professionId: ProfessionId;
  kind: JobKind;
  displayName: string;
  environment: string;
  stageId: string;
  sceneId: string;
  assignedCharacterIds: string[];
  briefingSummary: string;
  objectives: string[];
  estimatedMinutes?: number;
};

export type ShiftDefinition = JobDefinition & {
  kind: 'shift';
  clockInAt?: string;
  clockOutAt?: string;
  unexpectedEventPool: string[];
};

export type MissionDefinition = {
  id: string;
  jobId: string;
  title: string;
  learnerAction: string;
  successSignals: string[];
  evaluationCriteriaIds: string[];
  knowledgeTopicIds: string[];
};

export function shiftFromScene(input: {
  professionId: ProfessionId;
  stageId: string;
  scene: {
    id: string;
    displayName: string;
    sceneType: string;
    environment: string;
    learnerAction: string;
    aiCharacters: string[];
    successSignals: string[];
    unexpectedEvents: string[];
    generatedFromProfessionBrain: string[];
  };
}): ShiftDefinition {
  return {
    id: `shift-${input.scene.id}`,
    professionId: input.professionId,
    kind: 'shift',
    displayName: input.scene.displayName,
    environment: input.scene.environment,
    stageId: input.stageId,
    sceneId: input.scene.id,
    assignedCharacterIds: input.scene.aiCharacters,
    briefingSummary: input.scene.learnerAction,
    objectives: input.scene.successSignals,
    unexpectedEventPool: input.scene.unexpectedEvents,
  };
}
