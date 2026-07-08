import { PROFESSION_SIMULATION_ENGINE_ARTICLE_ID, PROFESSION_SIMULATION_PROFESSIONS } from '../../profession-simulation-engine';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** ARTICLE-E01 — Profession Simulation Engine™ graph relationships */
export function ingestProfessionSimulationNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const engineId = worldNodeId('engine', 'profession-simulation-engine');
  const professionBrainId = worldNodeId('engine', 'profession-brain');
  const studioInstituteId = worldNodeId('engine', 'studio-institute');
  const skillGraphId = worldNodeId('engine', 'skill-graph');
  const professionalProfileId = worldNodeId('engine', 'professional-profile');
  const simulationEngineId = worldNodeId('engine', 'simulation-engine');
  const principleId = worldNodeId('design-principle', 'careers-are-simulated');

  nodes.push(
    {
      id: engineId,
      slug: 'profession-simulation-engine',
      displayName: 'Profession Simulation Engine™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary:
        'Transforms professional learning into immersive career progression through scenes, shifts, clients, challenges, projects, and promotions.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/profession-simulation-engine/'],
      docPaths: ['docs/studio-os/profession-simulation-engine/ARTICLE_E01_PROFESSION_SIMULATION_ENGINE.md'],
      provenance: { source: 'constitution', sourceRef: PROFESSION_SIMULATION_ENGINE_ARTICLE_ID, ingestedAt: ts },
      tags: ['profession-simulation', 'career-progression', 'studio-institute', 'profession-brain'],
      metadata: {
        professionCount: PROFESSION_SIMULATION_PROFESSIONS.length,
        replacesCourses: true,
        workplaceScenesRequired: true,
      },
    },
    {
      id: studioInstituteId,
      slug: 'studio-institute',
      displayName: 'Studio Institute™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: 'Learning and certification surface powered by Profession Brain and E01 simulations.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/studio-institute/'],
      docPaths: ['docs/studio-os/studio-institute.md'],
      provenance: { source: 'constitution', sourceRef: 'studio-institute', ingestedAt: ts },
      tags: ['studio-institute', 'learning', 'certification'],
    },
    {
      id: skillGraphId,
      slug: 'skill-graph',
      displayName: 'Skill Graph™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: 'Tracks mastered skills, prerequisites, certification evidence, and gaps.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/skill-graph/'],
      docPaths: ['docs/studio-os/skill-graph.md'],
      provenance: { source: 'constitution', sourceRef: 'skill-graph', ingestedAt: ts },
      tags: ['skill-graph', 'evidence', 'certification'],
    },
    {
      id: professionalProfileId,
      slug: 'professional-profile',
      displayName: 'Professional Profile™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: 'Records professional identity, reputation, promotions, certifications, and career history.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/professional-profile/'],
      docPaths: ['docs/studio-os/professional-profile.md'],
      provenance: { source: 'constitution', sourceRef: 'professional-profile', ingestedAt: ts },
      tags: ['professional-profile', 'career-history', 'identity'],
    },
    {
      id: simulationEngineId,
      slug: 'simulation-engine',
      displayName: 'Simulation Engine™',
      nodeType: 'engine',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: 'Models business decisions; adjacent to but distinct from career simulation.',
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/simulation-engine/'],
      docPaths: ['docs/studio-os/simulation-engine.md'],
      provenance: { source: 'constitution', sourceRef: 'simulation-engine', ingestedAt: ts },
      tags: ['simulation-engine', 'decision-modeling'],
    }
  );

  for (const [to, label] of [
    [professionBrainId, 'generated-from-profession-brain'],
    [studioInstituteId, 'publishes-learning-surfaces'],
    [skillGraphId, 'records-skill-evidence'],
    [professionalProfileId, 'records-career-history'],
    [simulationEngineId, 'adjacent-to-business-simulation'],
    [principleId, 'governed-by-e01'],
  ] as const) {
    edges.push({
      id: worldEdgeId(label.includes('governed') ? 'governed-by' : 'integrates-with', engineId, to),
      type: label.includes('governed') ? 'governed-by' : 'integrates-with',
      from: engineId,
      to,
      label,
      provenance: { source: 'constitution', sourceRef: PROFESSION_SIMULATION_ENGINE_ARTICLE_ID, ingestedAt: ts },
    });
  }

  for (const profession of PROFESSION_SIMULATION_PROFESSIONS) {
    const professionId = worldNodeId('profession', profession.worldGraphSlug);
    nodes.push({
      id: professionId,
      slug: profession.worldGraphSlug,
      displayName: profession.displayName,
      nodeType: 'profession',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: profession.summary,
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/profession-simulation-engine/catalog.ts'],
      docPaths: ['docs/studio-os/profession-simulation-engine/ARTICLE_E01_PROFESSION_SIMULATION_ENGINE.md'],
      provenance: { source: 'constitution', sourceRef: profession.id, ingestedAt: ts },
      tags: ['profession', 'career-simulation', ...profession.tags],
      metadata: {
        professionBrainId: profession.professionBrainId,
        workplaceName: profession.workplaceName,
        careerStageCount: profession.careerStages.length,
        simulationSceneCount: profession.simulationScenes.length,
        aiCharacterCount: profession.aiCharacters.length,
      },
    });

    edges.push({
      id: worldEdgeId('owns', engineId, professionId),
      type: 'owns',
      from: engineId,
      to: professionId,
      label: 'profession-blueprint',
      provenance: { source: 'constitution', sourceRef: profession.id, ingestedAt: ts },
    });

    for (const stage of profession.careerStages) {
      const stageId = worldNodeId('career-stage', `${profession.id}-${stage.id}`);
      nodes.push({
        id: stageId,
        slug: `${profession.id}-${stage.id}`,
        displayName: stage.displayName,
        nodeType: 'career-stage',
        lifecycle: 'architecture',
        plane: lifecyclePlane('architecture'),
        version: '1.0.0',
        summary: stage.summary,
        implementationStatus: 'spec',
        codePaths: ['src/studio-os-core/profession-simulation-engine/catalog.ts'],
        docPaths: ['docs/studio-os/profession-simulation-engine/ARTICLE_E01_PROFESSION_SIMULATION_ENGINE.md'],
        provenance: { source: 'constitution', sourceRef: stage.id, ingestedAt: ts },
        tags: ['career-stage', profession.id, 'promotion'],
        metadata: {
          professionId: profession.id,
          order: stage.order,
          incomeModel: stage.incomeModel,
          promotionGateCount: stage.promotionGates.length,
          unlockCount: stage.unlocks.length,
        },
      });

      edges.push({
        id: worldEdgeId('owns', professionId, stageId),
        type: 'owns',
        from: professionId,
        to: stageId,
        label: 'career-stage',
        provenance: { source: 'constitution', sourceRef: stage.id, ingestedAt: ts },
      });
    }

    for (const scene of profession.simulationScenes) {
      const sceneId = worldNodeId('simulation-scene', `${profession.id}-${scene.id}`);
      nodes.push({
        id: sceneId,
        slug: `${profession.id}-${scene.id}`,
        displayName: scene.displayName,
        nodeType: 'simulation-scene',
        lifecycle: 'architecture',
        plane: lifecyclePlane('architecture'),
        version: '1.0.0',
        summary: scene.learnerAction,
        implementationStatus: 'spec',
        codePaths: ['src/studio-os-core/profession-simulation-engine/catalog.ts'],
        docPaths: ['docs/studio-os/profession-simulation-engine/ARTICLE_E01_PROFESSION_SIMULATION_ENGINE.md'],
        provenance: { source: 'constitution', sourceRef: scene.id, ingestedAt: ts },
        tags: ['simulation-scene', profession.id, scene.sceneType],
        metadata: {
          professionId: profession.id,
          sceneType: scene.sceneType,
          environment: scene.environment,
          aiCharacterCount: scene.aiCharacters.length,
          unexpectedEventCount: scene.unexpectedEvents.length,
        },
      });

      edges.push({
        id: worldEdgeId('owns', professionId, sceneId),
        type: 'owns',
        from: professionId,
        to: sceneId,
        label: 'workplace-scene',
        provenance: { source: 'constitution', sourceRef: scene.id, ingestedAt: ts },
      });

      for (const stage of profession.careerStages.filter((stage) => stage.sceneIds.includes(scene.id))) {
        const stageId = worldNodeId('career-stage', `${profession.id}-${stage.id}`);
        edges.push({
          id: worldEdgeId('projects-to', stageId, sceneId),
          type: 'projects-to',
          from: stageId,
          to: sceneId,
          label: 'unlocks-scene',
          provenance: { source: 'constitution', sourceRef: `${stage.id}:${scene.id}`, ingestedAt: ts },
        });
      }
    }
  }

  return { nodes, edges };
}

