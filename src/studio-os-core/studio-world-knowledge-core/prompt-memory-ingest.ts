import type { IngestedPromptMemory, PromptMemoryIngestInput } from './types';
import { ingestConversationWithExtraction } from '../studio-world-memory-system/pipeline';

/**
 * Prompt Memory™ routes through the four-layer Memory System™ pipeline.
 * Conversation Archive™ → Knowledge Extraction™ → Founder Review™ → Knowledge Core™
 *
 * Nothing enters Knowledge Core automatically. Founder approval required.
 */
export function ingestPromptMemory(input: PromptMemoryIngestInput): IngestedPromptMemory {
  const transcript = [
    `# Prompt Memory Ingestion`,
    ``,
    `## Title`,
    input.title,
    ``,
    `## Summary`,
    input.summary,
    ``,
    `## Reasoning`,
    input.reasoning,
    ``,
    `## Final Prompt`,
    input.finalPrompt,
  ].join('\n');

  const result = ingestConversationWithExtraction({
    title: input.title,
    transcript,
    summaryForIndex: input.summary,
    tags: ['prompt-memory', ...(input.tags ?? [])],
  });

  const proposed = result.extraction.proposedEntries[0];

  return {
    entry: {
      id: proposed?.id ?? result.reviewItem.id,
      title: input.title,
      domain: input.domain ?? 'Knowledge Engine™',
      status: 'Draft',
      version: 'v1',
      summary: input.summary,
      reasoning: input.reasoning,
      finalPrompt: input.finalPrompt,
      architectureAdded: input.architectureAdded ?? [],
      relatedSystems: input.relatedSystems ?? [],
      constitutionArticles: input.constitutionArticles ?? [],
      adrReferences: input.adrReferences ?? [],
      worldBibleReferences: input.worldBibleReferences ?? [],
      implementationStatus: input.implementationStatus ?? 'Specified',
      tags: input.tags ?? ['prompt-memory', 'awaiting-review'],
    },
    ingestedAt: new Date().toISOString(),
    source: 'prompt-memory-pipeline',
  };
}

export function listIngestedPromptEntries(): never[] {
  /** @deprecated Prompt memory no longer bypasses founder review. Use listPublishedEntries() from memory-system. */
  return [];
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
