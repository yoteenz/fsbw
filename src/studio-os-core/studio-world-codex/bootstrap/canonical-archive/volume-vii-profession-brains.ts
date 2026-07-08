import type { CanonicalArticleSeed } from '../article-builder';

export const VOLUME_VII_PROFESSION_BRAINS_ARTICLES: CanonicalArticleSeed[] = [
  {
    articleId: 'ARTICLE-B01',
    title: 'Profession Brain™',
    volume: 'volume-vii-profession-brains',
    category: 'Profession Truth',
    summary:
      'Profession Brain is the canonical truth model for a profession — vocabulary, standards, judgment frameworks, and reasoning systems.',
    philosophy: 'Every profession has laws. Profession Brain encodes them.',
    relatedSystems: ['Profession Brain™', 'Knowledge Graph™', 'Teaching Engine™'],
    relatedArticles: ['ARTICLE-E01', 'ARTICLE-B04', 'ARTICLE-W06'],
    tags: ['profession-brains', 'truth-model'],
    docPaths: ['docs/studio-os/profession-brain.md'],
  },
  {
    articleId: 'ARTICLE-B02',
    title: 'Profession Knowledge Graph™',
    volume: 'volume-vii-profession-brains',
    category: 'Knowledge Structure',
    summary:
      'Profession-scoped knowledge graphs link skills, standards, memories, and simulation outcomes — synchronized with World Graph.',
    philosophy: 'Profession knowledge is relational — never isolated flashcards.',
    relatedSystems: ['Knowledge Graph™', 'World Graph™', 'Skill Graph™'],
    relatedArticles: ['ARTICLE-AR02', 'ARTICLE-B01'],
    tags: ['profession-brains', 'knowledge-graph'],
    docPaths: ['docs/studio-os/skill-graph.md'],
  },
  {
    articleId: 'ARTICLE-B03',
    title: 'Teaching & Research Engines™',
    volume: 'volume-vii-profession-brains',
    category: 'Learning Infrastructure',
    summary:
      'Teaching Engine delivers profession-canon instruction. Research Engine ingests industry updates and validates against Profession Brain truth.',
    philosophy: 'Teaching follows truth models — research updates them through validation.',
    relatedSystems: ['Teaching Engine™', 'Research Engine™', 'Studio Institute™'],
    relatedArticles: ['ARTICLE-B01', 'ARTICLE-K25'],
    tags: ['profession-brains', 'teaching', 'research'],
  },
  {
    articleId: 'ARTICLE-B04',
    title: 'Canonical Knowledge & Validation™',
    volume: 'volume-vii-profession-brains',
    category: 'Canon Pipeline',
    summary:
      'Profession knowledge promotes through validation — draft, review, canon. Only canon influences simulation and mentor AI.',
    philosophy: 'Profession truth is earned — not scraped.',
    relatedSystems: ['Knowledge Core™', 'Canon Promotion Law™'],
    relatedArticles: ['ARTICLE-K22', 'ARTICLE-B01'],
    tags: ['profession-brains', 'validation', 'canon'],
  },
  {
    articleId: 'ARTICLE-B05',
    title: 'Mentor AI & Simulation Integration™',
    volume: 'volume-vii-profession-brains',
    category: 'Runtime Integration',
    summary:
      'Mentor AI draws from Profession Brain canon during simulation, retention refreshers, and Orb guidance — never generic chat.',
    philosophy: 'AI should mentor with profession truth — not improvise outside canon.',
    relatedSystems: ['Orb™', 'Profession Simulation Engine™', 'Knowledge Retention Engine™'],
    relatedArticles: ['ARTICLE-E01', 'ARTICLE-E03', 'ARTICLE-B01'],
    tags: ['profession-brains', 'mentor-ai', 'simulation'],
  },
];
