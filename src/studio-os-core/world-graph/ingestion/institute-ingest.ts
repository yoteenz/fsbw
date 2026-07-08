import { getInstituteBootstrapPublicationCount } from '../../institute-of-knowledge/bootstrap/seeds';
import { THE_INSTITUTE_OF_KNOWLEDGE } from '../../institute-of-knowledge/institute/registry';
import { INSTITUTE_OF_KNOWLEDGE_VERSION } from '../../institute-of-knowledge/constants';
import { worldEdgeId, worldNodeId } from '../id';
import { lifecyclePlane } from '../lifecycle';
import type { WorldEdge, WorldNode } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** The Institute of Knowledge™ — publication graph ingestion for World Graph compile. */
export function ingestInstituteNodes(): { nodes: WorldNode[]; edges: WorldEdge[] } {
  const nodes: WorldNode[] = [];
  const edges: WorldEdge[] = [];
  const ts = now();

  const instituteId = THE_INSTITUTE_OF_KNOWLEDGE.worldGraphNodeId;
  const codexEngineId = worldNodeId('engine', 'studio-world-codex');
  const instituteEngineId = worldNodeId('engine', 'institute-of-knowledge');

  nodes.push({
    id: instituteEngineId,
    slug: 'institute-of-knowledge',
    displayName: THE_INSTITUTE_OF_KNOWLEDGE.title,
    nodeType: 'engine',
    lifecycle: 'architecture',
    plane: lifecyclePlane('architecture'),
    version: INSTITUTE_OF_KNOWLEDGE_VERSION,
    summary: THE_INSTITUTE_OF_KNOWLEDGE.purpose,
    implementationStatus: 'live',
    codePaths: ['src/studio-os-core/institute-of-knowledge/'],
    docPaths: ['docs/studio-os/institute/INSTITUTE_PLATFORM.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
    tags: ['institute-of-knowledge', 'knowledge-governance', 'publication-engine', 'platform'],
    metadata: {
      publicationCount: getInstituteBootstrapPublicationCount(),
      divisionCount: THE_INSTITUTE_OF_KNOWLEDGE.divisions.length,
      constitutionalAuthority: THE_INSTITUTE_OF_KNOWLEDGE.constitutionalAuthority,
    },
  });

  nodes.push({
    id: instituteId,
    slug: THE_INSTITUTE_OF_KNOWLEDGE.id,
    displayName: THE_INSTITUTE_OF_KNOWLEDGE.title,
    nodeType: 'organization',
    lifecycle: 'architecture',
    plane: lifecyclePlane('architecture'),
    version: INSTITUTE_OF_KNOWLEDGE_VERSION,
    summary: THE_INSTITUTE_OF_KNOWLEDGE.purpose,
    implementationStatus: 'live',
    codePaths: ['src/studio-os-core/institute-of-knowledge/'],
    docPaths: ['docs/studio-os/institute/INSTITUTE_PLATFORM.md'],
    provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
    tags: ['institute-of-knowledge', 'publishing', 'research', 'canon-review', 'knowledge-validation'],
    metadata: {
      constitutionalAuthority: THE_INSTITUTE_OF_KNOWLEDGE.constitutionalAuthority,
      publicationTypes: [...THE_INSTITUTE_OF_KNOWLEDGE.publicationTypes],
      supersedes: THE_INSTITUTE_OF_KNOWLEDGE.supersedes,
    },
  });

  edges.push(
    {
      id: worldEdgeId('governed-by', codexEngineId, instituteId),
      type: 'governed-by',
      from: codexEngineId,
      to: instituteId,
      label: 'official-library-operator',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
    },
    {
      id: worldEdgeId('integrates-with', instituteEngineId, codexEngineId),
      type: 'integrates-with',
      from: instituteEngineId,
      to: codexEngineId,
      label: 'institute-codex-governance',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
    },
    {
      id: worldEdgeId('owns', instituteId, instituteEngineId),
      type: 'owns',
      from: instituteId,
      to: instituteEngineId,
      label: 'institute-platform-engine',
      provenance: { source: 'constitution', sourceRef: 'ARTICLE-C03', ingestedAt: ts },
    }
  );

  for (const division of THE_INSTITUTE_OF_KNOWLEDGE.divisions) {
    const divisionId = worldNodeId('department', `institute-${division.id}`);
    nodes.push({
      id: divisionId,
      slug: `institute-${division.id}`,
      displayName: division.title,
      nodeType: 'department',
      lifecycle: 'architecture',
      plane: lifecyclePlane('architecture'),
      version: INSTITUTE_OF_KNOWLEDGE_VERSION,
      summary: division.purpose,
      implementationStatus: 'live',
      codePaths: [`src/studio-os-core/institute-of-knowledge/${division.modulePath}/`],
      docPaths: ['docs/studio-os/institute/INSTITUTE_PLATFORM.md'],
      provenance: { source: 'constitution', sourceRef: `ARTICLE-C03:${division.id}`, ingestedAt: ts },
      tags: ['institute-division', 'institute-of-knowledge', division.id],
      metadata: {
        responsibilities: division.responsibilities,
        governsSystems: division.governsSystems,
        modulePath: division.modulePath,
        expandable: division.expandable,
      },
    });

    edges.push({
      id: worldEdgeId('owns', instituteId, divisionId),
      type: 'owns',
      from: instituteId,
      to: divisionId,
      label: 'institute-division',
      provenance: { source: 'constitution', sourceRef: `ARTICLE-C03:${division.id}`, ingestedAt: ts },
    });
  }

  return { nodes, edges };
}
