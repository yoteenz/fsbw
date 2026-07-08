/**
 * Scenario schema — generated from Profession Brain™, not hardcoded in the engine.
 */

import type { ProfessionId } from '../types';

export type ScenarioKind =
  | 'orientation'
  | 'shift'
  | 'client-appointment'
  | 'challenge'
  | 'project'
  | 'inspection'
  | 'promotion-review';

export type ScenarioBlueprint = {
  id: string;
  professionId: ProfessionId;
  professionBrainId: string;
  kind: ScenarioKind;
  displayName: string;
  environment: string;
  briefing: string;
  missionSummary: string;
  characterIds: string[];
  knowledgeTopicIds: string[];
  unexpectedEventPool: string[];
  sourceArtifactIds: string[];
};

export type GeneratedScenario = ScenarioBlueprint & {
  generatedAt: string;
  evaluationCriteriaIds: string[];
  feedbackPromptIds: string[];
};
