import type {
  KnowledgeCoreEntry,
  KnowledgeCoreStatus,
  KnowledgeEntryVersion,
  PromptMemoryIngestInput,
} from './types';
import { KNOWLEDGE_CORE_STATUSES } from './types';

const ISO = () => new Date().toISOString();

function slugify(value: string): string {
  return value
    .replace(/™/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 48);
}

export function isValidKnowledgeCoreStatus(status: string): status is KnowledgeCoreStatus {
  return (KNOWLEDGE_CORE_STATUSES as readonly string[]).includes(status);
}

export function createKnowledgeEntryId(title: string): string {
  return `kno-${slugify(title)}-${Date.now().toString(36)}`;
}

export function createKnowledgeEntryFromPrompt(input: PromptMemoryIngestInput): KnowledgeCoreEntry {
  const now = ISO();
  const version = 'v1';
  return {
    id: createKnowledgeEntryId(input.title),
    title: input.title.trim(),
    domain: input.domain ?? 'Knowledge Engine™',
    status: input.status ?? 'Draft',
    version,
    summary: input.summary.trim(),
    reasoning: input.reasoning.trim(),
    finalPrompt: input.finalPrompt.trim(),
    architectureAdded: input.architectureAdded ?? [],
    relatedSystems: input.relatedSystems ?? [],
    constitutionArticles: input.constitutionArticles ?? [],
    adrReferences: input.adrReferences ?? [],
    worldBibleReferences: input.worldBibleReferences ?? [],
    implementationStatus: input.implementationStatus ?? 'Specified',
    tags: input.tags ?? ['prompt-memory', 'ingested'],
    createdAt: now,
    updatedAt: now,
    versionHistory: [
      {
        version,
        createdAt: now,
        summary: input.summary.trim(),
        status: input.status ?? 'Draft',
      },
    ],
  };
}

export function createKnowledgeEntryRevision(
  entry: KnowledgeCoreEntry,
  changes: Partial<Pick<KnowledgeCoreEntry, 'summary' | 'reasoning' | 'finalPrompt' | 'status' | 'architectureAdded'>>
): KnowledgeCoreEntry {
  const now = ISO();
  const versionNum = parseInt(entry.version.replace(/^v/, ''), 10) || 1;
  const nextVersion = `v${versionNum + 1}`;
  const history: KnowledgeEntryVersion[] = [
    ...(entry.versionHistory ?? [
      {
        version: entry.version,
        createdAt: entry.createdAt ?? now,
        summary: entry.summary,
        status: entry.status,
      },
    ]),
    {
      version: nextVersion,
      createdAt: now,
      summary: changes.summary ?? entry.summary,
      status: changes.status ?? entry.status,
    },
  ];

  return {
    ...entry,
    ...changes,
    version: nextVersion,
    updatedAt: now,
    versionHistory: history,
  };
}

export function markEntrySuperseded(
  entry: KnowledgeCoreEntry,
  supersededById: string
): KnowledgeCoreEntry {
  const now = ISO();
  const status: KnowledgeCoreStatus =
    entry.status === 'Canon' ? 'Historical' : entry.status === 'Draft' ? 'Archived' : 'Historical';

  return {
    ...entry,
    status,
    supersededBy: supersededById,
    implementationStatus: 'Historical',
    updatedAt: now,
    versionHistory: [
      ...(entry.versionHistory ?? []),
      {
        version: entry.version,
        createdAt: now,
        summary: `Superseded by ${supersededById}`,
        status,
        supersededBy: supersededById,
      },
    ],
  };
}

export function normalizeKnowledgeEntry(entry: KnowledgeCoreEntry): KnowledgeCoreEntry {
  const now = ISO();
  return {
    ...entry,
    createdAt: entry.createdAt ?? now,
    updatedAt: entry.updatedAt ?? now,
    versionHistory:
      entry.versionHistory ??
      [
        {
          version: entry.version,
          createdAt: entry.createdAt ?? now,
          summary: entry.summary,
          status: entry.status,
        },
      ],
  };
}
