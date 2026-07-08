import type { ConversationArchive, ConversationIngestInput } from './types';
import { appendConversationArchive, readMemorySystemStore } from './store';

const ISO = () => new Date().toISOString();

function slugify(value: string): string {
  return value
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 40);
}

export function createConversationId(title: string, date?: string): string {
  const d = (date ?? ISO().slice(0, 10)).replace(/-/g, '-');
  return `CONV-${d}-${slugify(title)}`;
}

/**
 * Layer 1 — Conversation Archive™
 * Immutable historical record. Never rewritten, summarized, or removed.
 */
export function ingestConversation(input: ConversationIngestInput): ConversationArchive {
  const now = ISO();
  const date = input.date ?? now.slice(0, 10);
  const id = createConversationId(input.title, date);

  const existing = readImmutableArchive(id);
  if (existing) return existing;

  const archive: ConversationArchive = {
    id,
    title: input.title.trim(),
    date,
    status: 'Archived',
    transcript: input.transcript,
    transcriptPath: input.transcriptPath,
    summaryForIndex: input.summaryForIndex ?? input.title.trim(),
    preservedExactly: true,
    immutable: true,
    ingestedAt: now,
    tags: input.tags ?? ['conversation-archive', 'ingested'],
  };

  return appendConversationArchive(archive);
}

export function readImmutableArchive(id: string): ConversationArchive | null {
  return readMemorySystemStore().conversationArchives.find((a) => a.id === id) ?? null;
}

export function listConversationArchives(): ConversationArchive[] {
  return readMemorySystemStore().conversationArchives;
}

export function getConversationTranscript(id: string): string | null {
  const archive = readImmutableArchive(id);
  return archive?.transcript ?? null;
}

/** Archives are immutable — updates are forbidden. */
export function assertArchiveImmutable(archive: ConversationArchive): void {
  if (!archive.immutable || !archive.preservedExactly) {
    throw new Error('Conversation Archive™ records must remain immutable.');
  }
}
