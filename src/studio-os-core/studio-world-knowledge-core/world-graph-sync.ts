import { buildAllEntryRelationships } from './relationship-graph';
import { getAllKnowledgeEntries } from './engine';

/**
 * World Graph synchronization hooks — Knowledge Entries compile into graph nodes.
 * Called during graph compile via knowledge-core-ingest.ts; this module exposes
 * runtime sync metadata for the Explorer UI.
 */
export function getKnowledgeCoreWorldGraphSyncPayload() {
  const entries = getAllKnowledgeEntries();
  const relationships = buildAllEntryRelationships(entries);

  return {
    engineId: 'studio-world-knowledge-core',
    nodeType: 'knowledge-object' as const,
    entryCount: entries.length,
    nodes: entries.map((entry) => ({
      id: entry.id,
      slug: `entry-${entry.id.toLowerCase()}`,
      displayName: entry.title,
      domain: entry.domain,
      status: entry.status,
      version: entry.version,
      summary: entry.summary,
      canInfluenceArchitecture: entry.status === 'Canon',
    })),
    edges: [...relationships.entries()].flatMap(([entryId, rels]) =>
      rels.map((r) => ({
        from: entryId,
        to: r.targetId,
        type: r.type,
        label: r.label,
      }))
    ),
    syncedAt: new Date().toISOString(),
  };
}
