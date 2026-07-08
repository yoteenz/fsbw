import { getProfessionDefinition } from '../catalog';
import type {
  ProfessionBrainAdapter,
  ProfessionBrainSimulationPayload,
  ProfessionBrainSimulationRequest,
} from './adapter';
import { createProfessionBrainAdapterRegistry } from './adapter';

/**
 * Stub adapter — resolves simulation content from Profession Brain-linked scene metadata.
 * Production adapters will call living Profession Brain knowledge APIs.
 */
export const stubProfessionBrainAdapter: ProfessionBrainAdapter = {
  id: 'stub-profession-brain-adapter',
  supports: () => true,
  async requestSimulation(
    input: ProfessionBrainSimulationRequest
  ): Promise<ProfessionBrainSimulationPayload> {
    const profession = getProfessionDefinition(input.professionId);
    if (!profession) {
      throw new Error(`Unknown profession: ${input.professionId}`);
    }

    const scene =
      profession.simulationScenes.find((candidate) => candidate.id === input.sceneId) ??
      profession.simulationScenes[0];
    if (!scene) {
      throw new Error(`No simulation scene available for profession: ${input.professionId}`);
    }

    const knowledgeTopics = scene.generatedFromProfessionBrain.map((label, index) => ({
      id: `${scene.id}-knowledge-${index}`,
      label,
      kind: 'workplace-knowledge',
    }));

    return {
      briefing: `${profession.workplaceName}: ${scene.learnerAction}`,
      mission: {
        title: scene.displayName,
        learnerAction: scene.learnerAction,
        objectives: scene.successSignals,
      },
      evaluationCriteria: scene.successSignals.map((signal, index) => ({
        id: `${scene.id}-criterion-${index}`,
        label: signal,
        weight: 1,
        passThreshold: 0.7,
        evidenceRequired: `Demonstrate ${signal} during the shift.`,
      })),
      feedbackPrompts: [
        {
          id: `${scene.id}-mentor-feedback`,
          audience: 'mentor',
          tone: 'direct and supportive',
          template: 'Review what went well, what to adjust, and what to practice before the next shift.',
        },
      ],
      knowledgeTopics,
      unexpectedEvents: scene.unexpectedEvents,
      sourceArtifactIds: knowledgeTopics.map((topic) => topic.id),
    };
  },
};

export const defaultProfessionBrainRegistry = createProfessionBrainAdapterRegistry();
defaultProfessionBrainRegistry.register(stubProfessionBrainAdapter);

export async function requestProfessionBrainSimulation(
  input: ProfessionBrainSimulationRequest,
  registry = defaultProfessionBrainRegistry
): Promise<ProfessionBrainSimulationPayload> {
  const profession = getProfessionDefinition(input.professionId);
  const brainId = profession?.professionBrainId ?? input.professionBrainId;
  const adapter = registry.resolve(brainId);
  return adapter.requestSimulation({ ...input, professionBrainId: brainId });
}
