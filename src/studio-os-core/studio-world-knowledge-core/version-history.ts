import type { KnowledgeCoreEntry, KnowledgeEntryVersion } from './types';

/** Version history per entry — civilization remembers its evolution. */
export function buildEntryVersionHistory(entry: KnowledgeCoreEntry): KnowledgeEntryVersion[] {
  if (entry.versionHistory && entry.versionHistory.length > 0) {
    return [...entry.versionHistory];
  }

  return [
    {
      version: entry.version,
      createdAt: entry.createdAt ?? entry.updatedAt ?? new Date().toISOString(),
      summary: entry.summary,
      status: entry.status,
      supersededBy: entry.supersededBy,
    },
  ];
}

export function listVersionChain(entries: KnowledgeCoreEntry[], entryId: string): KnowledgeCoreEntry[] {
  const chain: KnowledgeCoreEntry[] = [];
  const visited = new Set<string>();
  let current = entries.find((e) => e.id === entryId);

  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    chain.push(current);
    if (!current.supersededBy) break;
    current = entries.find((e) => e.id === current!.supersededBy);
  }

  return chain;
}

export function listSupersededEntries(entries: KnowledgeCoreEntry[]): KnowledgeCoreEntry[] {
  return entries.filter((e) => e.status === 'Historical' || e.status === 'Deprecated' || e.status === 'Archived');
}

export function listCanonEntries(entries: KnowledgeCoreEntry[]): KnowledgeCoreEntry[] {
  return entries.filter((e) => e.status === 'Canon');
}

export function formatVersionLabel(version: string): string {
  return version.startsWith('v') ? version.toUpperCase() : `V${version}`;
}
