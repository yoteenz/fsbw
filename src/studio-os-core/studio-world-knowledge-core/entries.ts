import type { KnowledgeCoreEntry, KnowledgeCoreStatus, PromptStandard } from './types';

export const KNOWLEDGE_CORE_ARTICLE = {
  id: 'ARTICLE-K22',
  title: 'The Knowledge Core™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World becomes its own memory through a canonical Knowledge Core that preserves decisions, evolution, principles, canon, experiments, and standards.',
} as const;

export const PROMPT_STANDARDS: PromptStandard[] = [
  {
    id: 'recommended-model',
    title: 'Recommended Model',
    status: 'Canon',
    standard: 'Major prompts should include a Recommended Model when model choice materially affects output quality.',
    reason: 'Prompt memory should preserve not only the task, but the execution context that made the result reliable.',
  },
  {
    id: 'prompt-classification',
    title: 'Prompt Classification',
    status: 'Canon',
    standard:
      'Major prompts should classify the work: constitutional, architecture, implementation, visual, research, or experimental.',
    reason: 'Classification lets future systems route prompts to the correct governance and review path.',
  },
  {
    id: 'architectural-improvements-added',
    title: 'Architectural Improvements Added',
    status: 'Canon',
    standard:
      'Prompts that change Studio World should record which architecture, laws, graph nodes, rooms, or engines were added.',
    reason: 'Studio World should remember how each prompt changed the civilization.',
  },
  {
    id: 'future-expansion',
    title: 'Future Expansion',
    status: 'Canon',
    standard: 'Major prompts should capture unlocked future expansions without implementing them prematurely.',
    reason: 'Era discipline requires preserving future ideas while avoiding premature complexity.',
  },
  {
    id: 'architect-before-prompting',
    title: 'Architect Before Prompting',
    status: 'Canon',
    standard:
      'Before creating major generation prompts, define the architecture, system ownership, standards, and reuse path.',
    reason: 'Studio World should prefer durable systems over one-off output generation.',
  },
  {
    id: 'reusable-systems-over-one-offs',
    title: 'Reusable Systems Over One-Offs',
    status: 'Canon',
    standard:
      'Recurring needs should become reusable systems, registries, standards, or graph entries rather than isolated prompts.',
    reason: 'Civilization memory compounds only when work becomes reusable infrastructure.',
  },
];

export const KNOWLEDGE_CORE_ENTRIES: KnowledgeCoreEntry[] = [
  {
    id: 'K22-knowledge-core',
    title: 'ARTICLE-K22 — Studio World Knowledge Core™',
    domain: 'Knowledge Engine™',
    status: 'Canon',
    version: 'v1',
    summary:
      'The Knowledge Core is Studio World’s internal memory and canonical source of truth for why systems exist, how they evolved, what is canon, and what must never be contradicted.',
    reasoning:
      'Studio World should not depend on external AI memory, chat history, or human recollection. To survive future teams and future versions of the founder, memory must be encoded inside the civilization itself.',
    finalPrompt:
      'Introduce Studio World Knowledge Core™ as the permanent internal memory system, with domains, canonical statuses, prompt memory, search, versioning, prompt standards, Architect’s Memory™, and World Graph integration.',
    architectureAdded: [
      'Studio World Knowledge Core™',
      'Knowledge Domains™',
      'Canonical Status™',
      'Prompt Memory™',
      "Architect's Memory™",
      'Prompt Standards™',
      'Knowledge Entry World Graph ingestion',
    ],
    relatedSystems: [
      'World Graph™',
      'Architecture Decision Records™',
      'Constitution™',
      'Orb™',
      'Mission Control™',
      'Atlas™',
      'Scene Assembly™',
      'Experience Engine™',
    ],
    constitutionArticles: ['ARTICLE-K22', 'ARTICLE-K21', 'World Graph Is Truth™'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Studio World Graph™ — Canonical Architecture',
      'Studio World Three Eras Roadmap™',
      'Studio World Constitution™',
    ],
    implementationStatus: 'Implemented',
    tags: ['knowledge-core', 'institutional-memory', 'canon', 'article-k22'],
  },
  {
    id: 'K22-prompt-memory',
    title: 'Prompt Memory™',
    domain: 'Prompt Standards™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Every major prompt that fundamentally changes Studio World creates a searchable Knowledge Entry with reasoning, architecture added, related systems, and canon references.',
    reasoning:
      'Prompts often contain the original architectural intent. If those prompts remain only in chat history, Studio World loses the reason it changed.',
    finalPrompt:
      'Every major prompt that fundamentally changes Studio World should automatically create a Knowledge Entry.',
    architectureAdded: ['Prompt Memory™', 'Knowledge Entry schema', 'Prompt Standards™'],
    relatedSystems: ['Knowledge Core™', 'ADR Archive™', 'World Graph™', 'Architect’s Memory™'],
    constitutionArticles: ['ARTICLE-K22', 'Documentation First™', 'Knowledge Review™'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: ['Knowledge Core™', 'Studio World Bible™'],
    implementationStatus: 'Implemented',
    tags: ['prompt-memory', 'prompt-standards', 'searchable-memory'],
  },
  {
    id: 'K22-architects-memory',
    title: "Architect's Memory™",
    domain: "Architect's Memory™",
    status: 'Canon',
    version: 'v1',
    summary:
      'Architect’s Memory preserves design philosophies, recurring preferences, vocabulary, naming conventions, material language, interaction philosophy, presentation format, and decision heuristics.',
    reasoning:
      'The goal is not to remember personal conversations. The goal is to preserve architectural consistency across future builders, prompts, and teams.',
    finalPrompt:
      'Create a dedicated knowledge domain called Architect’s Memory™ to preserve architectural consistency.',
    architectureAdded: ["Architect's Memory™", 'Architectural consistency memory domain'],
    relatedSystems: [
      'Design Language™',
      'Experience System™',
      'Prompt Standards™',
      'Architecture Decision Records™',
    ],
    constitutionArticles: ['ARTICLE-K22', 'Design Principles™', 'World Physics™'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: ['Studio World Bible™', 'Studio World Governance Hierarchy™'],
    implementationStatus: 'Implemented',
    tags: ['architects-memory', 'design-philosophy', 'vocabulary', 'consistency'],
  },
];

export function canInfluenceFutureArchitecture(status: KnowledgeCoreStatus): boolean {
  return status === 'Canon';
}

export function searchKnowledgeCoreEntries(query: string): KnowledgeCoreEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return KNOWLEDGE_CORE_ENTRIES;

  return KNOWLEDGE_CORE_ENTRIES.filter((entry) => {
    const haystack = [
      entry.title,
      entry.domain,
      entry.summary,
      entry.reasoning,
      entry.finalPrompt,
      ...entry.architectureAdded,
      ...entry.relatedSystems,
      ...entry.constitutionArticles,
      ...entry.adrReferences,
      ...entry.worldBibleReferences,
      ...entry.tags,
    ]
      .join(' ')
      .toLowerCase();

    return haystack.includes(normalized);
  });
}
