import type { KnowledgeCoreEntry } from './types';

export type KnowledgeSemanticCluster = {
  id: string;
  triggers: string[];
  relatedEntryIds: string[];
  relatedSystems: string[];
  naturalLanguageQuestions: string[];
};

/** Semantic clusters — knowledge questions surface related memory, not folder paths. */
export const KNOWLEDGE_SEMANTIC_CLUSTERS: KnowledgeSemanticCluster[] = [
  {
    id: 'orb-cluster',
    triggers: ['orb', 'courier', 'archivist', 'projection', 'radial'],
    relatedEntryIds: ['K22-knowledge-core'],
    relatedSystems: ['Orb™', 'Mission Control™', 'Experience Engine™'],
    naturalLanguageQuestions: [
      'Show every decision involving the Orb.',
      'What constitutional articles affect the Orb?',
    ],
  },
  {
    id: 'atlas-cluster',
    triggers: ['atlas', 'spatial', 'navigation', 'travel', 'district', 'flagship'],
    relatedEntryIds: ['K22-knowledge-core'],
    relatedSystems: ['Atlas™', 'Mission Control™', 'World Graph™'],
    naturalLanguageQuestions: [
      'Find all Atlas architecture.',
      'Where does this belong in the world?',
    ],
  },
  {
    id: 'presence-cluster',
    triggers: ['progressive presence', 'presence', 'reveal', 'ambient', 'architecture first'],
    relatedEntryIds: ['K22-knowledge-core', 'K22-architects-memory'],
    relatedSystems: ['Experience System™', 'Experience Engine™', 'Scene Assembly™'],
    naturalLanguageQuestions: [
      'Which prompts introduced Progressive Presence?',
      'How does information earn visibility?',
    ],
  },
  {
    id: 'constitution-cluster',
    triggers: ['constitution', 'law', 'article', 'governance', 'oath', 'compliance'],
    relatedEntryIds: ['K22-knowledge-core'],
    relatedSystems: ['Constitution™', 'ADR Archive™', 'Mission Control™'],
    naturalLanguageQuestions: [
      'What constitutional articles affect navigation?',
      'What laws govern this system?',
    ],
  },
  {
    id: 'mission-control-cluster',
    triggers: ['mission control', 'command center', 'executive', 'headquarters'],
    relatedEntryIds: ['K22-knowledge-core'],
    relatedSystems: ['Mission Control™', 'Atlas™', 'Constitution™'],
    naturalLanguageQuestions: ['Why was Mission Control created?', 'What requires executive attention?'],
  },
  {
    id: 'memory-cluster',
    triggers: ['memory', 'remember', 'institutional', 'knowledge core', 'prompt memory', 'architect'],
    relatedEntryIds: ['K22-knowledge-core', 'K22-prompt-memory', 'K22-architects-memory'],
    relatedSystems: ['Knowledge Engine™', 'World Graph™', "Architect's Memory™"],
    naturalLanguageQuestions: [
      'How does Studio World remember?',
      'What is institutional memory?',
    ],
  },
  {
    id: 'adr-cluster',
    triggers: ['adr', 'decision record', 'architecture decision', 'why was'],
    relatedEntryIds: ['K22-knowledge-core'],
    relatedSystems: ['ADR Archive™', 'Constitution™', 'Architecture™'],
    naturalLanguageQuestions: ['Why was this built?', 'What problem does it solve?'],
  },
];

export function expandKnowledgeSemanticQuery(query: string): {
  expandedTerms: string[];
  relatedEntryIds: string[];
  relatedSystems: string[];
} {
  const q = query.trim().toLowerCase();
  const expandedTerms = new Set<string>([q]);
  const relatedEntryIds = new Set<string>();
  const relatedSystems = new Set<string>();

  for (const cluster of KNOWLEDGE_SEMANTIC_CLUSTERS) {
    const matched = cluster.triggers.some((t) => q.includes(t) || t.includes(q));
    if (matched) {
      cluster.triggers.forEach((t) => expandedTerms.add(t));
      cluster.relatedEntryIds.forEach((id) => relatedEntryIds.add(id));
      cluster.relatedSystems.forEach((s) => relatedSystems.add(s));
    }
  }

  const words = q.split(/\s+/).filter((w) => w.length > 2);
  words.forEach((w) => expandedTerms.add(w));

  return {
    expandedTerms: [...expandedTerms],
    relatedEntryIds: [...relatedEntryIds],
    relatedSystems: [...relatedSystems],
  };
}

export function scoreKnowledgeEntry(
  entry: KnowledgeCoreEntry,
  terms: string[],
  relatedEntryIds: string[],
  relatedSystems: string[]
): { score: number; reason: string } {
  let score = 0;
  let reason = 'keyword match';

  const blob = [
    entry.title,
    entry.domain,
    entry.summary,
    entry.reasoning,
    entry.finalPrompt,
    entry.status,
    ...entry.architectureAdded,
    ...entry.relatedSystems,
    ...entry.constitutionArticles,
    ...entry.adrReferences,
    ...entry.worldBibleReferences,
    ...entry.tags,
  ]
    .join(' ')
    .toLowerCase();

  for (const term of terms) {
    if (entry.id.toLowerCase().includes(term)) score += 18;
    if (entry.title.toLowerCase().includes(term)) score += 14;
    if (entry.domain.toLowerCase().includes(term)) score += 10;
    if (blob.includes(term)) score += 7;
  }

  if (relatedEntryIds.includes(entry.id)) {
    score += 22;
    reason = 'related memory';
  }

  if (relatedSystems.some((s) => entry.relatedSystems.includes(s))) {
    score += 16;
    reason = 'related system';
  }

  if (entry.status === 'Canon') score += 6;
  if (entry.status === 'Approved') score += 3;
  if (entry.implementationStatus === 'Live') score += 4;

  return { score, reason };
}
