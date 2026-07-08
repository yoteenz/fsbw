import { CAREER_WORLD_BLUEPRINTS } from '../../career-worlds';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

export function ingestCareerWorldNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const careerWorldsEngineId = worldNodeId('engine', 'career-worlds');
  const professionSimulationEngineId = worldNodeId('engine', 'profession-simulation-engine');
  const worldGraphId = worldNodeId('engine', 'world-graph');
  const professionBrainId = worldNodeId('engine', 'profession-brain');
  const industryGenomeId = worldNodeId('industry-genome', 'industry-genome');

  for (const blueprint of CAREER_WORLD_BLUEPRINTS) {
    const worldId = worldNodeId('district', blueprint.slug);

    nodes.push({
      id: worldId,
      slug: blueprint.slug,
      displayName: blueprint.name,
      nodeType: 'district',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: '1.0.0',
      summary: blueprint.oneLine,
      aliases: [blueprint.profession, `${blueprint.profession} Career World`],
      tags: blueprint.graphTags,
      implementationStatus: 'spec',
      codePaths: ['src/studio-os-core/career-worlds/'],
      docPaths: ['docs/studio-os/career-worlds/ARTICLE_E02_CAREER_WORLDS.md'],
      provenance: { source: 'constitution', sourceRef: `ARTICLE-E02:${blueprint.slug}`, ingestedAt: ts },
      metadata: {
        article: 'ARTICLE-E02',
        profession: blueprint.profession,
        worldQuestion: blueprint.worldQuestion,
        primaryFantasy: blueprint.primaryFantasy,
        lifeSystems: blueprint.lifeSystems,
        identityFields: blueprint.identityFields,
        progressionPhases: blueprint.progressionPhases,
        endgameMilestones: blueprint.endgameMilestones,
        timeModel: 'persistent-offline-evolution',
      },
    });

    edges.push(
      {
        id: worldEdgeId('owns', careerWorldsEngineId, worldId),
        type: 'owns',
        from: careerWorldsEngineId,
        to: worldId,
        label: 'career-world-blueprint',
        provenance: { source: 'constitution', sourceRef: blueprint.slug, ingestedAt: ts },
      },
      {
        id: worldEdgeId('depends-on', worldId, professionSimulationEngineId),
        type: 'depends-on',
        from: worldId,
        to: professionSimulationEngineId,
        label: 'runtime-simulation-layer',
        provenance: { source: 'constitution', sourceRef: blueprint.slug, ingestedAt: ts },
      },
      {
        id: worldEdgeId('integrates-with', worldId, professionBrainId),
        type: 'integrates-with',
        from: worldId,
        to: professionBrainId,
        label: 'professional-knowledge-substrate',
        provenance: { source: 'constitution', sourceRef: blueprint.slug, ingestedAt: ts },
      },
      {
        id: worldEdgeId('references', worldId, industryGenomeId),
        type: 'references',
        from: worldId,
        to: industryGenomeId,
        label: 'industry-reality-model',
        provenance: { source: 'constitution', sourceRef: blueprint.slug, ingestedAt: ts },
      },
      {
        id: worldEdgeId('projects-to', worldId, worldGraphId),
        type: 'projects-to',
        from: worldId,
        to: worldGraphId,
        label: 'persistent-professional-life-node',
        provenance: { source: 'constitution', sourceRef: blueprint.slug, ingestedAt: ts },
      }
    );
  }

  return { nodes, edges };
}
