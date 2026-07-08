import type { MissionDefinition } from '../jobs/schema';
import type { GeneratedScenario, ScenarioBlueprint } from './schema';
import type { ProfessionBrainSimulationPayload } from '../profession-brains/adapter';

export function scenarioFromBrainPayload(
  blueprint: ScenarioBlueprint,
  payload: ProfessionBrainSimulationPayload
): GeneratedScenario {
  return {
    ...blueprint,
    briefing: payload.briefing,
    missionSummary: payload.mission.title,
    knowledgeTopicIds: payload.knowledgeTopics.map((topic) => topic.id),
    unexpectedEventPool: payload.unexpectedEvents,
    generatedAt: new Date().toISOString(),
    evaluationCriteriaIds: payload.evaluationCriteria.map((criterion) => criterion.id),
    feedbackPromptIds: payload.feedbackPrompts.map((prompt) => prompt.id),
  };
}

export function missionFromScenario(scenario: GeneratedScenario): MissionDefinition {
  return {
    id: `mission-${scenario.id}`,
    jobId: `shift-${scenario.id}`,
    title: scenario.displayName,
    learnerAction: scenario.missionSummary,
    successSignals: [],
    evaluationCriteriaIds: scenario.evaluationCriteriaIds,
    knowledgeTopicIds: scenario.knowledgeTopicIds,
  };
}
