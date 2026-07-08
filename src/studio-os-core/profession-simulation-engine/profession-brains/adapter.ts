/**
 * Profession Brain adapter — engine requests knowledge; never hardcodes profession content.
 */

import type { ProfessionId } from '../types';

export type ProfessionBrainKnowledgeTopic = {
  id: string;
  label: string;
  kind: string;
};

export type ProfessionBrainEvaluationCriterion = {
  id: string;
  label: string;
  weight: number;
  passThreshold: number;
  evidenceRequired: string;
};

export type ProfessionBrainFeedbackPrompt = {
  id: string;
  audience: 'mentor' | 'manager' | 'client' | 'inspector';
  tone: string;
  template: string;
};

export type ProfessionBrainMission = {
  title: string;
  learnerAction: string;
  objectives: string[];
};

export type ProfessionBrainSimulationRequest = {
  professionBrainId: string;
  professionId: ProfessionId;
  stageId: string;
  sceneId: string;
  sceneType: string;
  environment: string;
  learnerId: string;
};

export type ProfessionBrainSimulationPayload = {
  briefing: string;
  mission: ProfessionBrainMission;
  evaluationCriteria: ProfessionBrainEvaluationCriterion[];
  feedbackPrompts: ProfessionBrainFeedbackPrompt[];
  knowledgeTopics: ProfessionBrainKnowledgeTopic[];
  unexpectedEvents: string[];
  sourceArtifactIds: string[];
};

export type ProfessionBrainAdapter = {
  id: string;
  supports(professionBrainId: string): boolean;
  requestSimulation(input: ProfessionBrainSimulationRequest): Promise<ProfessionBrainSimulationPayload>;
};

export type ProfessionBrainAdapterRegistry = {
  register(adapter: ProfessionBrainAdapter): void;
  resolve(professionBrainId: string): ProfessionBrainAdapter;
};

export function createProfessionBrainAdapterRegistry(): ProfessionBrainAdapterRegistry {
  const adapters: ProfessionBrainAdapter[] = [];

  return {
    register(adapter: ProfessionBrainAdapter) {
      adapters.push(adapter);
    },
    resolve(professionBrainId: string) {
      const adapter = adapters.find((candidate) => candidate.supports(professionBrainId));
      if (!adapter) {
        throw new Error(`No Profession Brain adapter registered for: ${professionBrainId}`);
      }
      return adapter;
    },
  };
}
