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

export const KNOWLEDGE_RETENTION_ARTICLE = {
  id: 'ARTICLE-E03',
  title: 'Knowledge Retention Engine™',
  approvedDate: '2026-07-08',
  summary:
    'Studio World preserves long-term professional mastery through professional memories, retention profiles, adaptive refreshers, Orb mentorship, and living industry updates.',
} as const;

export const CODEX_FIRST_PRINCIPLE_ARTICLE = {
  id: 'ARTICLE-C01',
  title: 'The Codex First Principle™',
  approvedDate: '2026-07-08',
  summary:
    'Every major Studio World feature becomes a Codex Article™ before implementation so philosophy, system ownership, dependencies, and future evolution are preserved before code.',
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
  {
    id: 'E02-career-worlds',
    title: 'ARTICLE-E02 — Career Worlds™',
    domain: 'Experience System™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Career Worlds™ replace Academies with persistent professional lives: living profession worlds containing companies, workplaces, districts, NPC professionals, mentors, clients, suppliers, competitors, economies, events, challenges, promotions, news, seasons, and community achievements.',
    reasoning:
      'The Profession Simulation Engine™ is the runtime for professional scenarios, but Studio World needs a higher product architecture: the learner should not feel like they are taking lessons; they should feel like they live inside an alternate professional reality that continues for months or years.',
    finalPrompt:
      'Do not ask “What lesson are you taking today?” Ask “What kind of life are you building?” Build Career Worlds™ where learning, career, game, simulation, community, professional network, business, and personal growth become one persistent life.',
    architectureAdded: [
      'Career Worlds™',
      'Career World blueprints',
      'Persistent professional identity',
      'Offline profession-world evolution',
      'Career World progression phases',
      'Master professional endgame',
      'World Graph Career World nodes',
    ],
    relatedSystems: [
      'Profession Simulation Engine™',
      'Profession Brain™',
      'World Graph™',
      'Studio World Atlas™',
      'Expert Marketplace™',
      'Professional Trust Framework™',
      'Identity Graph™',
    ],
    constitutionArticles: ['ARTICLE-E02', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Career Worlds™',
      'Profession Simulation Engine™',
      'Studio World Professional Life Architecture',
    ],
    implementationStatus: 'Specified',
    tags: ['career-worlds', 'profession-simulation', 'persistent-worlds', 'professional-identity'],
  },
  {
    id: 'E03-knowledge-retention-engine',
    title: 'ARTICLE-E03 — Knowledge Retention Engine™',
    domain: 'Knowledge Engine™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Long-term mastery engine — every learned concept becomes a professional memory with retention profile signals, adaptive refresher modes, Orb mentor prompts, living updates, and World Graph presence.',
    reasoning:
      'Studio World should not simply teach knowledge. It should preserve knowledge for life. Learners should not feel like students returning to courses; they should feel like professionals revisiting memories, practicing naturally through real projects, simulations, and industry changes.',
    finalPrompt:
      'Create Knowledge Retention Engine™. Every concept tracks date learned, successful applications, last real usage, confidence, recall strength, industry updates, certification relevance, and difficulty. The Orb acts as intelligent mentor; refreshers range from Memory Spark™ to Certification Renewal™; Profession Brains evolve and identify affected learners.',
    architectureAdded: [
      'Knowledge Retention Engine™',
      'Professional Memory™ graph nodes',
      'Retention Profiles™',
      'Adaptive Refresher Modes™',
      'Orb Mentor prompts',
      'Living Knowledge update impacts',
      'Retention planning engine',
    ],
    relatedSystems: [
      'Profession Brain™',
      'Career Worlds™',
      'Profession Simulation Engine™',
      'Studio Institute™',
      'Knowledge Confidence™',
      'Orb™',
      'World Graph™',
      'Studio World Atlas™',
      'Certification Renewal™',
    ],
    constitutionArticles: ['ARTICLE-E03', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Profession Brain™',
      'Studio Institute™',
      'World Graph™',
      'Studio World Atlas™',
    ],
    implementationStatus: 'Implemented',
    tags: [
      'knowledge-retention',
      'professional-memory',
      'adaptive-refreshers',
      'orb-mentor',
      'living-knowledge',
    ],
  },
  {
    id: 'E04-professional-memory-wisdom-engine',
    title: 'ARTICLE-E04 — Professional Memory™ / The Wisdom Engine™',
    domain: 'Knowledge Engine™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Lifelong wisdom layer — every meaningful career experience becomes a Professional Memory™ in a persistent Professional Timeline™, allowing the Orb and Wisdom Engine™ to recall lived context and synthesize guidance.',
    reasoning:
      'Studio World should preserve more than knowledge. Knowledge teaches people how; wisdom teaches people when. Traditional education tracks completed lessons, while Studio World tracks experiences, milestones, mistakes, mentorship, businesses, community contributions, and industry impact.',
    finalPrompt:
      'Introduce ARTICLE-E04: Professional Memory™ / Wisdom Engine™. Create Professional Timeline™, memory classes, Orb memory recall language, reflection experiences, and a Wisdom Engine that synthesizes Profession Brain™, Professional Memory™, Career History™, Simulation Outcomes™, Mentorship™, Industry Updates™, and Community Contributions™.',
    architectureAdded: [
      'Professional Memory™ as lived career history',
      'Professional Timeline™',
      'Memory Types™',
      'Orb memory recall mentorship',
      'Memory Reflection™ experiences',
      'The Wisdom Engine™',
      'Context-aware guidance from lived experience',
    ],
    relatedSystems: [
      'Profession Brain™',
      'Profession Simulation Engine™',
      'Career Worlds™',
      'Knowledge Retention Engine™',
      'Professional Memory™',
      'Orb™',
      'World Graph™',
      'Mentorship™',
      'Community Contributions™',
    ],
    constitutionArticles: ['ARTICLE-E04', 'ARTICLE-E03', 'ARTICLE-E02', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Professional Memory™',
      'The Wisdom Engine™',
      'Career Worlds™',
      'Profession Brain™',
      'World Graph™',
    ],
    implementationStatus: 'Specified',
    tags: [
      'professional-memory',
      'wisdom-engine',
      'professional-timeline',
      'memory-reflection',
      'orb-mentor',
      'lifelong-mastery',
    ],
  },
  {
    id: 'E05-studio-exchange-professional-license-system',
    title: 'ARTICLE-E05 — Studio Exchange™ / Professional License System™',
    domain: 'Marketplace™',
    status: 'Canon',
    version: 'v1',
    summary:
      'Studio Exchange™ replaces marketplace/storefront/course language with a professional economy where citizens acquire Professional Licenses™ that grant entry into Career Worlds™, expansions, businesses, assets, knowledge, mentorship, certifications, and opportunities.',
    reasoning:
      'Studio World should never sell courses. It should grant entry into professions. The economy must reward contribution, mentorship, certification, business creation, and world expansion instead of treating education as one-off content transactions.',
    finalPrompt:
      'Design ARTICLE-E05: rename Marketplace to Studio Exchange™, replace Buy Course / Enroll / Subscription with Professional Licenses™, define Career Expansions™, Certification Ceremonies™, unlocks, Mentor Economy™, Legacy Businesses™, and the contribution-first Studio Economy™.',
    architectureAdded: [
      'Studio Exchange™',
      'Professional Licenses™',
      'Career Expansions™',
      'Certification Ceremonies™',
      'Certification Unlocks',
      'Mentor Economy™',
      'Legacy Businesses™',
      'Contribution-first Studio Economy™',
      'studio-exchange core module',
      'Exchange persistence store',
      'World Graph studio-exchange ingest',
    ],
    relatedSystems: [
      'Career Worlds™',
      'Profession Simulation Engine™',
      'Profession Brain™',
      'Studio Professionals™',
      'Studio Institute™',
      'Expert Marketplace™',
      'Headquarters Marketplace™',
      'World Graph™',
      'Orb™',
      'Atlas™',
    ],
    constitutionArticles: ['ARTICLE-E05', 'ARTICLE-K22', 'ARTICLE-K23'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Studio Exchange™',
      'Professional License System™',
      'Career Worlds™',
      'Studio Economy™',
    ],
    implementationStatus: 'Implemented',
    tags: [
      'studio-exchange',
      'professional-licenses',
      'career-worlds',
      'mentor-economy',
      'certification-ceremonies',
      'studio-economy',
    ],
  },
  {
    id: 'C01-codex-first-principle',
    title: 'ARTICLE-C01 — The Codex First Principle™',
    domain: 'Codex™',
    status: 'Canon',
    version: 'v1',
    summary:
      'The Studio World Codex™ becomes the constitutional memory and single source of truth; every major feature must become a Codex Article™ before implementation begins.',
    reasoning:
      'Studio World has reached a complexity threshold where ideas implemented before documentation risk fragmentation, contradiction, and loss of architectural intent. The Codex preserves philosophy, naming, systems, dependencies, and future evolution before code exists.',
    finalPrompt:
      'Establish the Codex™ as institutional memory: every approved idea becomes a Codex Article™ before implementation, following Idea → Exploration → Architectural Evolution → Codex Article™ → Constitution Review™ → World Bible™ → Implementation Plan™ → Engineering → Production → Post-Launch Review → Codex Update™.',
    architectureAdded: [
      'Studio World Codex™',
      'Codex First Principle™',
      'Codex Pipeline™',
      'Codex Volumes™',
      'Codex Article™ template',
      'Canonical Thinking™ checklist',
      'Codex World Graph nodes',
    ],
    relatedSystems: [
      'Knowledge Core™',
      'Memory System™',
      'World Graph™',
      'Architecture Decision Records™',
      'World Bible™',
      'Production Completion System™',
      'Studio Production Orchestrator™',
      'Career Worlds™',
    ],
    constitutionArticles: ['ARTICLE-C01', 'ARTICLE-K21', 'ARTICLE-K22', 'ARTICLE-K23', 'ARTICLE-K24'],
    adrReferences: ['ADR-0001'],
    worldBibleReferences: [
      'Studio World Codex™',
      'Studio World Governance Hierarchy™',
      'Studio World Knowledge Core™',
    ],
    implementationStatus: 'Specified',
    tags: ['codex', 'codex-first', 'constitutional-memory', 'article-c01'],
  },
];

export function canInfluenceFutureArchitecture(status: KnowledgeCoreStatus): boolean {
  return status === 'Canon';
}
