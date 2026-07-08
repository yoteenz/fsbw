import type { CanonicalArticleSeed } from '../article-builder';

export const VOLUME_IX_KNOWLEDGE_CORE_ARTICLES: CanonicalArticleSeed[] = [
  {
    articleId: 'ARTICLE-K22',
    title: 'Studio World Knowledge Core™',
    volume: 'volume-ix-knowledge-core',
    category: 'Institutional Memory',
    summary:
      'Knowledge Core is the canonical intelligence repository — domains, canon entries, prompt memory, semantic search, and World Graph sync.',
    philosophy: 'Not documentation. Institutional memory.',
    guidingPrinciples: [
      'Canon entries may influence future architecture.',
      'Prompt Standards govern how major prompts enter memory.',
      'Architect\'s Memory preserves vocabulary and design philosophy.',
    ],
    relatedSystems: ['Knowledge Core™', 'World Graph™', 'Orb Archivist™'],
    relatedArticles: ['ARTICLE-K23', 'ARTICLE-C01', 'ARTICLE-AR06'],
    tags: ['knowledge-core', 'institutional-memory', 'canon'],
    docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K22_STUDIO_WORLD_KNOWLEDGE_CORE.md'],
    codePaths: ['src/studio-os-core/studio-world-knowledge-core/'],
  },
  {
    articleId: 'ARTICLE-K23',
    title: 'Studio World Memory System™',
    volume: 'volume-ix-knowledge-core',
    category: 'Memory Pipeline',
    summary:
      'Four-layer pipeline: Conversation Archive → Knowledge Extraction → Founder Review → Knowledge Core. Nothing enters Canon automatically.',
    philosophy: 'Conversation is raw history. Canon is approved truth.',
    guidingPrinciples: [
      'Conversation Archive preserves prompts exactly.',
      'Knowledge Extraction proposes — never publishes.',
      'Founder Review gates canon promotion.',
    ],
    relatedSystems: ['Memory System™', 'Conversation Archive™', 'Knowledge Core™'],
    relatedArticles: ['ARTICLE-K22', 'ARTICLE-C01'],
    tags: ['knowledge-core', 'memory-system', 'pipeline'],
    docPaths: ['docs/studio-os/knowledge-core/ARTICLE_K23_MEMORY_SYSTEM.md'],
    codePaths: ['src/studio-os-core/studio-world-memory-system/'],
  },
  {
    articleId: 'ARTICLE-K25',
    title: 'Research Ingestion & Knowledge Curation™',
    volume: 'volume-ix-knowledge-core',
    category: 'Curation Pipeline',
    summary:
      'Research ingestion captures industry updates. Curation validates against Profession Brain and promotes to canon through review.',
    philosophy: 'Living knowledge requires living updates — with validation discipline.',
    relatedSystems: ['Research Engine™', 'Profession Brains™', 'Knowledge Core™'],
    relatedArticles: ['ARTICLE-B03', 'ARTICLE-K22', 'ARTICLE-K26'],
    tags: ['knowledge-core', 'research', 'curation'],
  },
  {
    articleId: 'ARTICLE-K26',
    title: 'Validation Pipeline & Industry Updates™',
    volume: 'volume-ix-knowledge-core',
    category: 'Validation',
    summary:
      'Validation pipeline ensures profession updates, industry news, and extracted knowledge meet canon standards before influencing architecture.',
    philosophy: 'Speed without validation creates contradictory civilization memory.',
    relatedSystems: ['Knowledge Core™', 'Profession Brains™', 'Memory System™'],
    relatedArticles: ['ARTICLE-K25', 'ARTICLE-B04'],
    tags: ['knowledge-core', 'validation', 'industry-updates'],
  },
  {
    articleId: 'ARTICLE-K27',
    title: 'Memory Engine & Wisdom Engine Integration™',
    volume: 'volume-ix-knowledge-core',
    category: 'Synthesis Layer',
    summary:
      'Memory Engine preserves lineage. Wisdom Engine synthesizes judgment from Professional Memory, Profession Brain, and Knowledge Core canon.',
    philosophy: 'Preserve wisdom, not just knowledge.',
    relatedSystems: ['Memory Engine™', 'Wisdom Engine™', 'Professional Memory™'],
    relatedArticles: ['ARTICLE-E04', 'ARTICLE-M03', 'ARTICLE-K22'],
    tags: ['knowledge-core', 'memory-engine', 'wisdom-engine'],
    docPaths: ['docs/studio-os/engine/professional-memory/ARTICLE_E04_PROFESSIONAL_MEMORY_WISDOM_ENGINE.md'],
  },
];
