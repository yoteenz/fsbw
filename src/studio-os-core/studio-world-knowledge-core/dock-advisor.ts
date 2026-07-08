import type { KnowledgeCoreEntry } from './types';
import { getKnowledgeCoreStats } from './stats';

/** Orb Archivist™ language — institutional memory, not engineering jargon. */
export function buildArchivistLines(entries: KnowledgeCoreEntry[]): string[] {
  const canon = entries.filter((e) => e.status === 'Canon');
  const canonTitles = canon.map((e) => e.title).slice(0, 2);
  const domainSet = new Set(entries.map((e) => e.domain));

  return [
    `The civilization remembers ${entries.length} knowledge entries across ${domainSet.size} domains.`,
    canonTitles.length
      ? `Canon holds: ${canonTitles.join(' · ')}`
      : 'Canon awaits its first ratified entry.',
    'Ask about decisions, systems, or principles — memory responds through relationship, not folders.',
  ];
}

export function resolveKnowledgeCoreOrbLine(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;

  if (/knowledge core|institutional memory|what does studio world remember/i.test(q)) {
    const stats = getKnowledgeCoreStats();
    return `Knowledge Core™ preserves ${stats.totalEntries} entries. ${stats.canonEntries} are Canon™ — they may guide future architecture.`;
  }

  if (/prompt memory|prompt standard/i.test(q)) {
    const stats = getKnowledgeCoreStats();
    return `${stats.promptStandardCount} Prompt Standards™ govern how major prompts enter memory. Only Canon standards influence generation.`;
  }

  if (/architect.?s memory|design philosophy|vocabulary/i.test(q)) {
    return "Architect's Memory™ preserves consistency — vocabulary, materials, interaction philosophy, not personal chat.";
  }

  if (/why was|decision|adr/i.test(q)) {
    return 'Decision memory lives in ADR Archive™ and Knowledge Entries. History is never deleted — only superseded.';
  }

  return null;
}

export type KnowledgeCoreDockAdvice = {
  response: string;
  concierge: 'Orb Archivist™';
  canonCount: number;
};

export function resolveKnowledgeCoreAdvice(
  input: string,
  _organizationId: string
): KnowledgeCoreDockAdvice | null {
  const line = resolveKnowledgeCoreOrbLine(input);
  if (!line) return null;
  const stats = getKnowledgeCoreStats();
  return {
    response: line,
    concierge: 'Orb Archivist™',
    canonCount: stats.canonEntries,
  };
}
