import type { KnowledgeCoreEntry, KnowledgeRelationship } from './types';

function rel(
  type: KnowledgeRelationship['type'],
  targetId: string,
  targetLabel: string,
  label?: string
): KnowledgeRelationship {
  return { type, targetId, targetLabel, label };
}

/** Relationship graph hooks — nothing exists in isolation. */
export function buildEntryRelationships(entry: KnowledgeCoreEntry): KnowledgeRelationship[] {
  const relationships: KnowledgeRelationship[] = [];

  relationships.push(
    rel('governed-by', 'ARTICLE-K22', 'ARTICLE-K22 — Studio World Knowledge Core™', 'constitutional-law'),
    rel('integrates-with', 'world-graph', 'World Graph™', 'canonical-memory-substrate'),
    rel('located-in', `domain-${slugify(entry.domain)}`, entry.domain, 'knowledge-domain')
  );

  for (const article of entry.constitutionArticles) {
    relationships.push(rel('governed-by', article, article, 'constitution-article'));
  }

  for (const adr of entry.adrReferences) {
    relationships.push(rel('references', adr.toLowerCase(), adr, 'adr-reference'));
  }

  for (const system of entry.relatedSystems) {
    relationships.push(rel('integrates-with', slugify(system), system, 'related-system'));
  }

  for (const bible of entry.worldBibleReferences) {
    relationships.push(rel('references', slugify(bible), bible, 'world-bible'));
  }

  if (entry.supersededBy) {
    relationships.push(
      rel('supersedes', entry.supersededBy, entry.supersededBy, 'supersession-chain')
    );
  }

  return relationships;
}

export function buildAllEntryRelationships(entries: KnowledgeCoreEntry[]): Map<string, KnowledgeRelationship[]> {
  const map = new Map<string, KnowledgeRelationship[]>();
  for (const entry of entries) {
    map.set(entry.id, buildEntryRelationships(entry));
  }
  return map;
}

export function findRelatedEntries(
  entries: KnowledgeCoreEntry[],
  entryId: string
): KnowledgeCoreEntry[] {
  const source = entries.find((e) => e.id === entryId);
  if (!source) return [];

  const relatedIds = new Set<string>();
  for (const system of source.relatedSystems) {
    entries
      .filter((e) => e.id !== entryId && e.relatedSystems.includes(system))
      .forEach((e) => relatedIds.add(e.id));
  }

  for (const tag of source.tags) {
    entries
      .filter((e) => e.id !== entryId && e.tags.includes(tag))
      .forEach((e) => relatedIds.add(e.id));
  }

  if (source.supersededBy) relatedIds.add(source.supersededBy);
  entries
    .filter((e) => e.supersededBy === entryId)
    .forEach((e) => relatedIds.add(e.id));

  return entries.filter((e) => relatedIds.has(e.id));
}

function slugify(value: string): string {
  return value
    .replace(/™/g, '')
    .replace(/'/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

export function relationshipsToWorldGraphEdges(
  entryId: string,
  relationships: KnowledgeRelationship[]
): Array<{ type: string; from: string; to: string; label?: string }> {
  return relationships.map((r) => ({
    type: r.type,
    from: `entry-${entryId}`,
    to: r.targetId,
    label: r.label ?? r.targetLabel,
  }));
}
