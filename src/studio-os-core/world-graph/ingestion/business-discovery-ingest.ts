import {
  BUSINESS_DISCOVERY_PHASES,
  BUSINESS_GENOME_OUTPUTS,
  HEADQUARTERS_GENERATION_PROPOSALS,
} from '../../business-discovery';
import { worldEdgeId, worldNodeId } from '../id';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** Business Discovery™ — signature onboarding and Company Genome™ architecture */
export function ingestBusinessDiscoveryNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const discoveryId = worldNodeId('engine', 'business-discovery');
  const blueprintId = worldNodeId('engine', 'business-discovery-blueprint');
  const companyGenomeId = worldNodeId('company-genome', 'company-genome');
  const organizationGenomeId = worldNodeId('engine', 'organization-genome');
  const hqId = worldNodeId('engine', 'headquarters-experience');
  const orbId = worldNodeId('engine', 'orb-recommendations');
  const atlasId = worldNodeId('engine', 'studio-world-atlas');
  const knowledgeId = worldNodeId('knowledge-object', 'BD01-business-discovery');

  edges.push(
    {
      id: worldEdgeId('references', discoveryId, knowledgeId),
      type: 'references',
      from: discoveryId,
      to: knowledgeId,
      label: 'canon-architecture',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', discoveryId, blueprintId),
      type: 'integrates-with',
      from: discoveryId,
      to: blueprintId,
      label: 'implementation-projection',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    },
    {
      id: worldEdgeId('generated-from', companyGenomeId, discoveryId),
      type: 'generated-from',
      from: companyGenomeId,
      to: discoveryId,
      label: 'company-genome-output',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', discoveryId, organizationGenomeId),
      type: 'integrates-with',
      from: discoveryId,
      to: organizationGenomeId,
      label: 'identity-governance',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    },
    {
      id: worldEdgeId('projects-to', discoveryId, hqId),
      type: 'projects-to',
      from: discoveryId,
      to: hqId,
      label: 'headquarters-generation',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    },
    {
      id: worldEdgeId('projects-to', discoveryId, atlasId),
      type: 'projects-to',
      from: discoveryId,
      to: atlasId,
      label: 'business-map-projection',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    },
    {
      id: worldEdgeId('projects-to', discoveryId, orbId),
      type: 'projects-to',
      from: discoveryId,
      to: orbId,
      label: 'orb-strategist',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    }
  );

  for (const phase of BUSINESS_DISCOVERY_PHASES) {
    const phaseId = worldNodeId('blueprint', `business-discovery-${phase.id}`);
    nodes.push({
      id: phaseId,
      slug: `business-discovery-${phase.id}`,
      displayName: phase.title,
      nodeType: 'blueprint',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      summary: phase.purpose,
      tags: ['business-discovery', 'company-genome', phase.id],
      implementationStatus: 'live',
      codePaths: [
        'src/studio-os-core/business-discovery/phases.ts',
        'src/studio-os-core/business-discovery/discovery-engine/orchestrator.ts',
      ],
      docPaths: [
        'docs/studio-os/business-discovery.md',
        'docs/studio-os/engine/business-discovery/BUSINESS_DISCOVERY_ENGINE.md',
      ],
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
      metadata: {
        phaseNumber: phase.number,
        objectCount: phase.objectsCreated.length,
        systemsUpdated: phase.systemsUpdated,
      },
    });

    edges.push({
      id: worldEdgeId('governed-by', phaseId, discoveryId),
      type: 'governed-by',
      from: phaseId,
      to: discoveryId,
      label: 'discovery-phase',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    });
  }

  for (const output of BUSINESS_GENOME_OUTPUTS) {
    const outputId = worldNodeId('blueprint', `business-genome-${output.id}`);
    nodes.push({
      id: outputId,
      slug: `business-genome-${output.id}`,
      displayName: output.title,
      nodeType: 'blueprint',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      summary: output.description,
      tags: ['business-genome', 'company-genome', output.id],
      implementationStatus: 'live',
      codePaths: [
        'src/studio-os-core/business-discovery/outputs.ts',
        'src/studio-os-core/business-discovery/genome-builder/generator.ts',
      ],
      docPaths: [
        'docs/studio-os/business-discovery.md',
        'docs/studio-os/engine/business-discovery/BUSINESS_DISCOVERY_ENGINE.md',
      ],
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
      metadata: {
        sourcePhaseIds: output.sourcePhaseIds,
        powersSystems: output.powersSystems,
      },
    });
    edges.push({
      id: worldEdgeId('generated-from', outputId, discoveryId),
      type: 'generated-from',
      from: outputId,
      to: discoveryId,
      label: 'business-genome-output',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    });
  }

  for (const proposal of HEADQUARTERS_GENERATION_PROPOSALS) {
    const proposalId = worldNodeId('blueprint', `headquarters-generation-${proposal.id}`);
    nodes.push({
      id: proposalId,
      slug: `headquarters-generation-${proposal.id}`,
      displayName: proposal.title,
      nodeType: 'blueprint',
      lifecycle: 'implemented',
      plane: 'canon',
      version: '1.0.0',
      summary: proposal.description,
      tags: ['business-discovery', 'headquarters-generation', proposal.id],
      implementationStatus: 'live',
      codePaths: [
        'src/studio-os-core/business-discovery/outputs.ts',
        'src/studio-os-core/business-discovery/headquarters-generator/generator.ts',
      ],
      docPaths: [
        'docs/studio-os/business-discovery.md',
        'docs/studio-os/engine/business-discovery/BUSINESS_DISCOVERY_ENGINE.md',
      ],
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
      metadata: {
        genomeInputs: proposal.genomeInputs,
        createdSystems: proposal.createdSystems,
      },
    });
    edges.push({
      id: worldEdgeId('generated-from', proposalId, companyGenomeId),
      type: 'generated-from',
      from: proposalId,
      to: companyGenomeId,
      label: 'generated-from-company-genome',
      provenance: { source: 'constitution', sourceRef: 'BUSINESS-DISCOVERY', ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
