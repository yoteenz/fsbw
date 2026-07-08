import type {
  ArchitectsMemoryPrinciple,
  ConversationArchiveRecord,
  KnowledgeCoreEntry,
  KnowledgeCoreStatus,
  KnowledgeExtractionReport,
  PromptStandard,
} from './types';

export const KNOWLEDGE_CORE_ARTICLE = {
  id: 'ARTICLE-K22',
  title: 'The Knowledge Core™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World becomes its own memory through a canonical Knowledge Core that preserves decisions, evolution, principles, canon, experiments, and standards.',
} as const;

export const MEMORY_SYSTEM_ARTICLE = {
  id: 'ARTICLE-K23',
  title: 'The Memory System™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World separates Conversation™, Knowledge™, History™, and Canon™ so raw history, extracted understanding, founder review, and approved memory are never confused.',
} as const;

export const PRODUCTION_COMPLETION_ARTICLE = {
  id: 'ARTICLE-K24',
  title: 'Production Completion System™',
  approvedDate: '2026-07-08',
  summary:
    'Every implementation passes a standardized Production Completion Checklist™ and Quality Gates™ before it is considered done — adaptive to feature scope, enforced by Studio Production Orchestrator™.',
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

export const ARCHITECTS_MEMORY_PRINCIPLES: ArchitectsMemoryPrinciple[] = [
  {
    id: 'architect-before-implementation',
    title: 'Architect Before Implementation',
    status: 'Canon',
    principle: 'Define the system, ownership, graph relationships, and governance before implementation.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
  {
    id: 'recommend-best-model',
    title: 'Recommend The Best Model',
    status: 'Canon',
    principle: 'When prompts or generation workflows depend on model choice, preserve the recommended model.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
  {
    id: 'include-architectural-improvements',
    title: 'Include Architectural Improvements',
    status: 'Canon',
    principle: 'Major prompts should record the architectural improvements added by the work.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
  {
    id: 'include-future-expansion',
    title: 'Include Future Expansion',
    status: 'Canon',
    principle: 'Preserve future expansion opportunities without implementing them prematurely.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
  {
    id: 'prefer-reusable-systems',
    title: 'Prefer Reusable Systems',
    status: 'Canon',
    principle: 'Favor reusable systems, registries, standards, and graph entries over one-off implementations.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
  {
    id: 'prefer-immersive-interaction',
    title: 'Prefer Immersive Interaction',
    status: 'Canon',
    principle: 'Studio World experiences should feel inhabited and spatial, not like ordinary software panels.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
  {
    id: 'prefer-world-first-architecture',
    title: 'Prefer World-First Architecture',
    status: 'Canon',
    principle: 'Begin from Studio World as a civilization; pages, folders, and documents are projections, not the world.',
    source: 'ARTICLE-K23 Architect’s Memory™ expansion',
  },
];

export const CONVERSATION_ARCHIVE_RECORDS: ConversationArchiveRecord[] = [
  {
    id: 'CONV-2026-07-08-studio-world-memory-architecture',
    title: 'Studio World Memory Architecture Discussion — Articles K21, K22, K23',
    date: '2026-07-08',
    status: 'Archived',
    transcriptPath:
      'knowledge/archive/conversations/2026-07-08-studio-world-memory-architecture.md',
    summaryForIndex:
      'Raw conversation archive preserving the founder’s Article K21 ADR, Article K22 Knowledge Core, and Article K23 Memory System prompts.',
    preservedExactly: true,
    relatedExtractionReportId: 'KEX-2026-07-08-studio-world-memory-architecture',
  },
];

export const KNOWLEDGE_EXTRACTION_REPORTS: KnowledgeExtractionReport[] = [
  {
    id: 'KEX-2026-07-08-studio-world-memory-architecture',
    title: 'Knowledge Extraction Report™ — Studio World Memory Architecture Discussion',
    sourceConversationId: 'CONV-2026-07-08-studio-world-memory-architecture',
    status: 'Awaiting Founder Review',
    reportPath:
      'knowledge/working/extraction-reports/2026-07-08-studio-world-memory-architecture.md',
    conversationSummary:
      'The discussion introduced ADRs as constitutional history, the Knowledge Core as internal memory, and the Memory System as the separation between conversation, extracted knowledge, founder review, and canon.',
    architecturalDecisions: [
      'Separate Conversation™, Knowledge™, History™, and Canon™.',
      'Preserve significant design conversations exactly as historical records.',
      'Generate extraction reports before Knowledge Core promotion.',
      'Require Architect Review before extracted knowledge enters canon.',
      'Connect conversation lineage through Memory Graph relationships.',
    ],
    systemsIntroduced: [
      'Conversation Archive™',
      'Knowledge Ingestion™',
      'Architect Review™',
      'Memory Graph™',
      'Knowledge Extraction Report™',
      'Expanded Architect’s Memory™',
    ],
    designPrinciples: [
      'Conversations are history.',
      'Knowledge is understanding.',
      'Canon is approval.',
      'Studio World should never confuse history with canon.',
    ],
    conflictsDetected: [
      'Knowledge Core must not become a folder of documents.',
      'Conversation archives must remain raw while Knowledge Core remains reviewed and canonical.',
      'Extracted items must not automatically become canon.',
    ],
    potentialAdrs: [
      'ADR candidate — Conversation Archive™ as historical substrate.',
      'ADR candidate — Knowledge Ingestion™ and Architect Review™ as canon gate.',
      'ADR candidate — Memory Graph™ as learning lineage.',
    ],
    constitutionUpdates: ['ARTICLE-K23 — The Memory System™'],
    worldBibleUpdates: [
      'Studio World Memory System™',
      'Conversation Archive™',
      'Knowledge Extraction Report™',
      'Memory Graph™',
    ],
    promptStandardUpdates: [
      'Archive significant architecture prompts exactly.',
      'Generate Knowledge Extraction Reports after major conversations.',
      'Route extracted knowledge through Architect Review before canon promotion.',
    ],
    engineeringRecommendations: [
      'Add World Graph node types for archived conversations, extraction reports, and founder approvals.',
      'Store raw archives separately from extraction reports.',
      'Represent extraction reports as awaiting review until founder approval.',
      'Link conversation → extraction → approval → Knowledge Core → ADR → implementation → impact.',
    ],
    futureOpportunities: [
      'Full searchable Conversation Archive UI.',
      'Automated transcript capture from Studio World sessions.',
      'Founder review queue for extraction reports.',
      'Memory Graph visualization inside Knowledge Library™.',
      'Orb answers that cite both canon and originating conversations.',
    ],
    itemsAwaitingApproval: [
      'Whether K23 extraction reports should generate ADR drafts automatically.',
      'Which extracted items from today’s discussion should become Canon Knowledge Entries beyond Article K23 itself.',
      'Whether full raw assistant/tool transcript capture should be automated at platform runtime.',
    ],
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
  {
    id: 'K23-memory-system',
    title: 'ARTICLE-K23 — The Memory System™',
    domain: 'Knowledge Engine™',
    status: 'Canon',
    version: 'v1',
    summary:
      'The Memory System distinguishes Conversation™, Knowledge™, History™, and Canon™ through four layers: raw archive, extraction, architect review, and approved Knowledge Core.',
    reasoning:
      'If Studio World stores only documents, it loses the learning process that created its knowledge. The civilization must remember both what it knows and how it learned it.',
    finalPrompt:
      'Evolve Knowledge Core™ into a living institutional memory with Conversation Archive™, Knowledge Ingestion™, Architect Review™, Knowledge Core™, first ingestion, Knowledge Extraction Reports™, Memory Graph™, and expanded Architect’s Memory™.',
    architectureAdded: [
      'The Memory System™',
      'Conversation Archive™',
      'Knowledge Ingestion™',
      'Architect Review™',
      'Knowledge Extraction Report™',
      'Memory Graph™',
      'Expanded Architect’s Memory™',
    ],
    relatedSystems: [
      'Knowledge Core™',
      'World Graph™',
      'Architecture Decision Records™',
      'Orb™',
      'Mission Control™',
      'Knowledge Library™',
    ],
    constitutionArticles: ['ARTICLE-K23', 'ARTICLE-K22', 'ARTICLE-K21'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: ['Studio World Memory System™', 'Studio World Knowledge Core™'],
    implementationStatus: 'Implemented',
    tags: ['memory-system', 'conversation-archive', 'knowledge-ingestion', 'memory-graph'],
  },
  {
    id: 'A01-asset-compiler',
    title: 'ARTICLE-A01 — Asset Compiler™',
    domain: 'Asset Standards™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Asset Compiler™ is the internal compilation layer that turns Studio Foundry™ manufacturing intent and Generation Recipes™ into FAL generation requests, metadata, versions, storage paths, and Asset Registry entries.',
    reasoning:
      'The founder should never leave Studio World to manually prompt FAL, choose models, tune generation settings, download files, upload assets, name folders, or import registry metadata. ARTICLE-A02 elevates this into Studio Foundry™ as the universal manufacturing boundary.',
    finalPrompt:
      'Create an Asset Compiler™ that uses reusable Generation Recipes™ and existing FAL integration to produce registry-ready generated assets from asset name, recipe, and optional modifiers.',
    architectureAdded: [
      'Asset Compiler™',
      'Generation Recipes™',
      'FAL request compiler',
      'Compiled Asset Metadata',
      'Asset Registry entry generation',
      'Generation Recipe World Graph nodes',
    ],
    relatedSystems: [
      'Asset Registry™',
      'FAL',
      'World Graph™',
      'Scene Assembly™',
      'Orb™',
      'Atlas™',
      'Mission Control™',
      'Marketplace™',
    ],
    constitutionArticles: ['ARTICLE-A01', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Studio Asset Compiler™',
      'Asset Registry™',
      'Studio World Production Pipeline',
    ],
    implementationStatus: 'Implemented',
    tags: ['asset-compiler', 'generation-recipes', 'fal', 'asset-registry'],
  },
  {
    id: 'A02-studio-foundry',
    title: 'ARTICLE-A02 — Studio Foundry™',
    domain: 'Asset Standards™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Studio Foundry™ is the universal manufacturing system for reusable Studio World objects; Asset Registry™ stores/indexes assets, Generation Recipes™ define manufacturing, and Orb/Atlas/UI consume assets by ID only.',
    reasoning:
      'A library stores finished assets; a foundry manufactures assets. Hero Icons are only the first asset class, not a standalone production model. Studio World needs a universal manufacturing boundary for hero icons, architecture, rooms, furniture, materials, glass objects, holograms, motion assets, particle systems, portraits, UI components, landmark objects, audio, collectibles, and future asset classes.',
    finalPrompt:
      'Replace the Hero Icon Library mental model with Studio Foundry™: UI asks Asset Registry by asset ID; if missing or regeneration requested, Studio Foundry™ uses the appropriate Generation Recipe™, existing FAL integration performs generation, and the asset is versioned, registered, cached, and returned.',
    architectureAdded: [
      'Studio Foundry™',
      'Foundry asset class catalog',
      'Cache-first asset resolver',
      'Asset ID consumption boundary',
      'Foundry-owned Generation Recipe graph',
      'Registry upsert for manufactured assets',
    ],
    relatedSystems: [
      'Asset Registry™',
      'Generation Recipes™',
      'Asset Compiler™',
      'FAL',
      'World Graph™',
      'Orb™',
      'Atlas™',
      'Mission Control™',
      'UI Components',
    ],
    constitutionArticles: ['ARTICLE-A02', 'ARTICLE-A01', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Studio Foundry™',
      'Studio Asset Compiler™',
      'Asset Registry™',
      'Studio World Production Pipeline',
    ],
    implementationStatus: 'Implemented',
    tags: ['studio-foundry', 'asset-manufacturing', 'asset-registry', 'generation-recipes'],
  },
  {
    id: 'K24-production-completion-system',
    title: 'ARTICLE-K24 — Production Completion System™',
    domain: 'Engineering Standards™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Definition of Done™ engine — every Production Package™ includes adaptive Planning, Architecture, Implementation, Integration, Testing, Knowledge Updates, Review, and Approval checkpoints with Quality Gates™ that block silent completion.',
    reasoning:
      'Studio World complexity requires a single consistent definition of "done." Feature-complete is insufficient; constitutional, engineering, experience, visual, performance, world-integration, and QA checkpoints must pass before a feature advances through Architecture → Implementation → Integration → QA → Founder Review → Knowledge Update → Production Ready → Complete.',
    finalPrompt:
      'Create Production Completion System™ integrated with Studio Production Orchestrator™. Checklist adapts to scope (visual-only skips database; routing skips OpenArt assets; constitutional changes require ADR). Quality Gates™ pause progression and identify remaining work — never silently mark complete.',
    architectureAdded: [
      'Production Completion System™',
      'Adaptive Production Checklist™',
      'Quality Gates™',
      'Production Board completion fields',
      'Scope inference engine',
      'Orchestrator integration',
    ],
    relatedSystems: [
      'Studio Production Orchestrator™',
      'Experience Intelligence Engine™',
      'World Graph™',
      'Knowledge Core™',
      'Architecture Decision Records™',
      'QA Inspector™',
      'Orb™',
      'Atlas™',
    ],
    constitutionArticles: ['ARTICLE-K24', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Studio Production Orchestrator™',
      'Production Completion Checklist™',
      'Quality Gates™',
      'Studio World Production Pipeline',
    ],
    implementationStatus: 'Implemented',
    tags: ['production-completion', 'definition-of-done', 'quality-gates', 'production-orchestrator'],
  },
];

export function canInfluenceFutureArchitecture(status: KnowledgeCoreStatus): boolean {
  return status === 'Canon';
}
