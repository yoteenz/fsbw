import type { IngestedPromptMemory, PromptMemoryIngestInput } from './types';
import { createKnowledgeEntryFromPrompt, normalizeKnowledgeEntry } from './schema';
import { buildEntryRelationships } from './relationship-graph';
import { readKnowledgeCoreStore, writeIngestedEntry } from './store';

/**
 * Prompt Memory™ ingestion pipeline — converts major prompts into institutional memory.
 * Prompts are no longer temporary conversations; they become searchable Knowledge Entries.
 */
export function ingestPromptMemory(input: PromptMemoryIngestInput): IngestedPromptMemory {
  const entry = normalizeKnowledgeEntry({
    ...createKnowledgeEntryFromPrompt(input),
    relationships: undefined,
  });
  entry.relationships = buildEntryRelationships(entry);

  writeIngestedEntry(entry);

  return {
    entry,
    ingestedAt: new Date().toISOString(),
    source: 'prompt-memory-pipeline',
  };
}

export function listIngestedPromptEntries(): ReturnType<typeof readKnowledgeCoreStore>['ingestedEntries'] {
  return readKnowledgeCoreStore().ingestedEntries;
}

export function shouldIngestPrompt(prompt: string): boolean {
  const normalized = prompt.trim().toLowerCase();
  if (normalized.length < 80) return false;

  const signals = [
    'architect',
    'constitutional',
    'canon',
    'implement',
    'knowledge core',
    'world graph',
    'studio world',
    'article-k',
    'adr',
    'progressive presence',
    'experience engine',
    'scene stack',
    'mission control',
    'atlas',
    'orb',
  ];

  return signals.some((s) => normalized.includes(s));
}

export function ingestPromptMemoryIfSignificant(
  input: PromptMemoryIngestInput
): IngestedPromptMemory | null {
  if (!shouldIngestPrompt(input.finalPrompt) && !shouldIngestPrompt(input.summary)) {
    return null;
  }
  return ingestPromptMemory(input);
}
