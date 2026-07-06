import { expandSemanticQuery } from '../documentation-sync/semantic-search';
import type { RegistrySearchHit } from './types';
import { getAllRegistryEntries } from './registration';

const COMMON_MISSPELLINGS: Record<string, string> = {
  orchetrator: 'orchestrator',
  inteligence: 'intelligence',
  profeshion: 'profession',
  legasy: 'legacy',
  commerece: 'commerce',
  documenation: 'documentation',
  regstry: 'registry',
  conciousness: 'consciousness',
};

const ABBREVIATIONS: Record<string, string[]> = {
  sia: ['studio-intelligence-architecture'],
  mo: ['model-orchestrator'],
  sfm: ['studio-foundation-models'],
  pb: ['profession-brain'],
  ptf: ['professional-trust-framework'],
  cd: ['command-dock'],
  ec: ['executive-council'],
  dr: ['documentation-registry'],
};

function normalizeQuery(raw: string): string[] {
  const q = raw.trim().toLowerCase();
  const terms = new Set<string>([q]);
  if (COMMON_MISSPELLINGS[q]) terms.add(COMMON_MISSPELLINGS[q]);
  if (ABBREVIATIONS[q]) ABBREVIATIONS[q].forEach((id) => terms.add(id));
  const { expandedTerms, relatedSystemIds } = expandSemanticQuery(q);
  expandedTerms.forEach((t) => terms.add(t));
  relatedSystemIds.forEach((id) => terms.add(id));
  return [...terms];
}

function scoreEntry(
  entry: ReturnType<typeof getAllRegistryEntries>[number],
  terms: string[],
  relatedIds: string[]
): { score: number; reason: string } {
  let score = 0;
  let reason = 'keyword match';

  const blob = [
    entry.officialName,
    entry.purpose,
    entry.description,
    ...entry.keywords,
    ...entry.aliases,
    ...entry.searchSynonyms,
  ]
    .join(' ')
    .toLowerCase();

  for (const term of terms) {
    if (entry.internalId.includes(term)) score += 15;
    if (entry.officialName.toLowerCase().includes(term)) score += 12;
    if (blob.includes(term)) score += 8;
    if (entry.searchSynonyms.some((s) => s.includes(term))) score += 6;
  }

  if (relatedIds.includes(entry.internalId)) {
    score += 18;
    reason = 'related concept';
  }

  for (const q of [
    `explain ${entry.officialName.toLowerCase()}`,
    `how does ${entry.officialName.toLowerCase()} work`,
    `what is ${entry.aliases[0] ?? entry.internalId}`,
  ]) {
    if (terms.some((t) => q.includes(t))) {
      score += 10;
      reason = 'natural language question';
    }
  }

  return { score, reason };
}

/** Query Documentation Registry™ first — concepts, not just keywords. */
export function queryDocumentationRegistry(query: string, limit = 12): RegistrySearchHit[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const terms = normalizeQuery(trimmed);
  const { relatedSystemIds } = expandSemanticQuery(trimmed.toLowerCase());
  const entries = getAllRegistryEntries();

  return entries
    .map((entry) => {
      const { score, reason } = scoreEntry(entry, terms, relatedSystemIds);
      return { entry, score, matchReason: reason };
    })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function explainRegistryFeature(internalId: string): string | null {
  const entry = getAllRegistryEntries().find((e) => e.internalId === internalId || e.moduleId === internalId);
  if (!entry) return null;
  return [
    `${entry.officialName} — ${entry.purpose}`,
    entry.description,
    `Capabilities: ${entry.capabilities.join(', ')}`,
    entry.exampleWorkflows[0] ? `Example: ${entry.exampleWorkflows[0]}` : '',
  ]
    .filter(Boolean)
    .join(' ');
}
