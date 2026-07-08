import { readInstituteStore } from '../persistence/store';
import { listInstitutePublications, listRelationshipsForPublication } from '../publications/engine';
import { INSTITUTE_WORLD_GRAPH_NODE_ID } from '../constants';
import { THE_INSTITUTE_OF_KNOWLEDGE } from '../institute/registry';
import type { InstitutePublicationRelationship } from '../types';

function mapRelationshipToEdgeType(type: InstitutePublicationRelationship['type']): string {
  switch (type) {
    case 'depends-on':
      return 'depends-on';
    case 'supersedes':
      return 'supersedes';
    case 'governs':
      return 'governed-by';
    case 'contradicts':
      return 'affected-by';
    default:
      return 'references';
  }
}

/**
 * World Graph synchronization — every publication creates graph relationships.
 * The Codex functions as a navigable knowledge graph, not disconnected files.
 */
export function getInstituteWorldGraphSyncPayload() {
  const store = readInstituteStore();
  const publications = listInstitutePublications();

  return {
    engineId: 'institute-of-knowledge',
    nodeType: 'knowledge-object' as const,
    instituteNodeId: INSTITUTE_WORLD_GRAPH_NODE_ID,
    publicationCount: publications.length,
    relationshipCount: store.relationships.length,
    submissionCount: store.submissions.length,
    chronicleCount: store.chronicle.length,
    nodes: publications.map((pub) => ({
      id: pub.worldGraphNodeId ?? `institute-pub-${pub.publicationId.toLowerCase()}`,
      slug: pub.publicationId.toLowerCase(),
      displayName: pub.title,
      type: pub.type,
      edition: pub.edition,
      revision: pub.revision,
      status: pub.status,
      divisionId: pub.divisionId,
      summary: pub.summary,
      isCanonical: pub.status === 'Canonical',
      codexArticleIds: pub.codexArticleIds,
      constitutionalArticleIds: pub.constitutionalArticleIds,
    })),
    divisionNodes: THE_INSTITUTE_OF_KNOWLEDGE.divisions.map((d) => ({
      id: `institute-division-${d.id}`,
      slug: d.id,
      displayName: d.title,
      purpose: d.purpose,
      modulePath: d.modulePath,
    })),
    edges: store.relationships.map((rel) => ({
      id: rel.id,
      type: mapRelationshipToEdgeType(rel.type),
      from: rel.fromPublicationId,
      to: rel.toPublicationId,
      label: rel.label ?? rel.type,
    })),
    syncedAt: new Date().toISOString(),
  };
}

export function getInstitutePublicationGraphNeighborEdges(publicationId: string) {
  const rels = listRelationshipsForPublication(publicationId);
  return rels.map((rel) => ({
    relationship: rel,
    direction: rel.fromPublicationId === publicationId ? 'outgoing' : 'incoming',
    neighborId:
      rel.fromPublicationId === publicationId ? rel.toPublicationId : rel.fromPublicationId,
  }));
}

export function autoLinkPublicationToGraph(publicationId: string, codexArticleIds: string[]) {
  const store = readInstituteStore();
  const edges: InstitutePublicationRelationship[] = [];

  for (const codexId of codexArticleIds) {
    const codexPub = store.publications.find((p) => p.codexArticleIds.includes(codexId));
    if (codexPub && codexPub.publicationId !== publicationId) {
      edges.push({
        id: `rel-auto-${publicationId}-${codexPub.publicationId}`,
        fromPublicationId: publicationId,
        toPublicationId: codexPub.publicationId,
        type: 'derived-from',
        label: 'codex-auto-link',
        createdAt: new Date().toISOString(),
      });
    }
  }

  return edges;
}
