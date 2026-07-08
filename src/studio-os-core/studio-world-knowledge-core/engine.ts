import { KNOWLEDGE_CORE_ENTRIES, PROMPT_STANDARDS, canInfluenceFutureArchitecture } from './entries';
import { listKnowledgeDomains } from './domains';
import { buildEntryRelationships, findRelatedEntries } from './relationship-graph';
import { expandKnowledgeSemanticQuery, scoreKnowledgeEntry } from './semantic-search';
import { normalizeKnowledgeEntry } from './schema';
import { listPublishedEntries } from '../studio-world-memory-system/canonical-publishing';
import { seedMemorySystemFromCanon } from '../studio-world-memory-system/bootstrap';
import { buildEntryVersionHistory } from './version-history';
import type {
  KnowledgeCoreDomain,
  KnowledgeCoreEntry,
  KnowledgeCoreSearchHit,
  KnowledgeCoreStatus,
} from './types';

/** Canonical in-memory entries with relationships attached. */
const CANON_ENTRIES: KnowledgeCoreEntry[] = KNOWLEDGE_CORE_ENTRIES.map((entry) =>
  normalizeKnowledgeEntry({
    ...entry,
    relationships: buildEntryRelationships(entry),
  })
);

/** Canonical seed entries + founder-approved published entries only. */
export function getAllKnowledgeEntries(): KnowledgeCoreEntry[] {
  seedMemorySystemFromCanon();
  const published = listPublishedEntries().map((e) =>
    normalizeKnowledgeEntry({
      ...e,
      relationships: e.relationships ?? buildEntryRelationships(e),
    })
  );
  return [...CANON_ENTRIES, ...published];
}

export function getKnowledgeEntryById(id: string): KnowledgeCoreEntry | null {
  return getAllKnowledgeEntries().find((e) => e.id === id) ?? null;
}

export function getEntriesByDomain(domain: KnowledgeCoreDomain): KnowledgeCoreEntry[] {
  return getAllKnowledgeEntries().filter((e) => e.domain === domain);
}

export function getEntriesByStatus(status: KnowledgeCoreStatus): KnowledgeCoreEntry[] {
  return getAllKnowledgeEntries().filter((e) => e.status === status);
}

export function getCanonEntries(): KnowledgeCoreEntry[] {
  return getAllKnowledgeEntries().filter((e) => canInfluenceFutureArchitecture(e.status));
}

export function queryKnowledgeCore(query: string, limit = 12): KnowledgeCoreSearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) {
    return getAllKnowledgeEntries().slice(0, limit).map((entry) => ({
      entry,
      score: 1,
      matchReason: 'browse',
      domainLabel: entry.domain,
      canInfluenceArchitecture: canInfluenceFutureArchitecture(entry.status),
    }));
  }

  const { expandedTerms, relatedEntryIds, relatedSystems } = expandKnowledgeSemanticQuery(trimmed);
  const entries = getAllKnowledgeEntries();

  return entries
    .map((entry) => {
      const { score, reason } = scoreKnowledgeEntry(entry, expandedTerms, relatedEntryIds, relatedSystems);
      return {
        entry,
        score,
        matchReason: reason,
        domainLabel: entry.domain,
        canInfluenceArchitecture: canInfluenceFutureArchitecture(entry.status),
      };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getEntryVersionHistory(entryId: string) {
  const entry = getKnowledgeEntryById(entryId);
  if (!entry) return [];
  return buildEntryVersionHistory(entry);
}

export function getRelatedKnowledgeEntries(entryId: string): KnowledgeCoreEntry[] {
  return findRelatedEntries(getAllKnowledgeEntries(), entryId);
}

export function listRegisteredDomains() {
  return listKnowledgeDomains();
}

export function getPromptStandards() {
  return PROMPT_STANDARDS;
}

import { getKnowledgeCoreStats } from './stats';

export { getKnowledgeCoreStats };

/** @deprecated Use queryKnowledgeCore */
export function searchKnowledgeCoreEntries(query: string): KnowledgeCoreEntry[] {
  return queryKnowledgeCore(query).map((h) => h.entry);
}
