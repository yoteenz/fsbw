import type { CanonicalArticleSeed } from '../article-builder';

export const VOLUME_I_MANIFESTO_ARTICLES: CanonicalArticleSeed[] = [
  {
    articleId: 'ARTICLE-M01',
    title: 'The Studio World Manifesto™',
    volume: 'volume-i-manifesto',
    category: 'North Star Philosophy',
    summary:
      'Studio World is a civilization platform — software should feel inhabited, AI should mentor, learning should be experienced, and wisdom must outlive any single model or contributor.',
    philosophy:
      'Build civilizations instead of applications. Build identities instead of accounts. Build careers instead of courses. Build memories instead of progress bars.',
    guidingPrinciples: [
      'Software should feel inhabited, not operated.',
      'AI should mentor, not merely answer.',
      'Learning should be experienced, not consumed.',
      'Build civilizations instead of applications.',
      'Build identities instead of accounts.',
      'Build careers instead of courses.',
      'Build memories instead of progress bars.',
      'Every system should feel alive.',
      'Every feature should contribute to the world.',
      'The platform should preserve wisdom, not just knowledge.',
    ],
    architecturalDecisions: [
      'Every major system must justify its existence against manifesto principles before implementation.',
      'Customer-facing language must never reduce Studio World to LMS, SaaS dashboard, or course catalog framing.',
      'Progress metrics serve memory and mastery — not gamification for its own sake.',
      'The Orb mentors through lived context; it does not replace profession truth models.',
    ],
    relatedSystems: [
      'Orb™',
      'Career Worlds™',
      'Knowledge Core™',
      'Professional Memory™',
      'Studio Exchange™',
    ],
    relatedArticles: ['ARTICLE-C01', 'ARTICLE-E02', 'ARTICLE-K22'],
    tags: ['manifesto', 'philosophy', 'north-star', 'civilization'],
    department: 'Founder Vision',
    docPaths: ['docs/studio-os/canon/STUDIO_WORLD_CANON_HIERARCHY.md'],
  },
  {
    articleId: 'ARTICLE-M02',
    title: 'Inhabited Software™',
    volume: 'volume-i-manifesto',
    category: 'Experience Philosophy',
    summary:
      'Studio World rejects the feeling of operating software. Citizens enter places, not pages — environments with lighting, materials, districts, and institutional memory.',
    philosophy: 'A founder should first feel like they entered a place. Only afterward should they realize how much intelligence exists beneath it.',
    guidingPrinciples: [
      'The environment comes first. Knowledge comes second. UI comes last.',
      'Navigation uses Hero Objects™ and spatial memory — not icon grids.',
      'Every room answers one primary question before revealing professional depth.',
      'Departments are districts in a world — not sidebar items.',
    ],
    architecturalDecisions: [
      'Progressive Presence™ governs when UI may appear.',
      'Scene Assembly™ and World Atlas™ provide spatial continuity.',
      'Global Experience System™ ensures departments inherit world behavior without per-page wiring.',
    ],
    relatedSystems: ['Progressive Presence™', 'World Atlas™', 'Hero Objects™', 'Scene Assembly™'],
    relatedArticles: ['ARTICLE-K18', 'ARTICLE-D09', 'ARTICLE-W01'],
    tags: ['manifesto', 'inhabited', 'spatial', 'experience'],
    docPaths: ['docs/studio-os/governance/GLOBAL_EXPERIENCE_SYSTEM.md'],
  },
  {
    articleId: 'ARTICLE-M03',
    title: 'Wisdom Over Information™',
    volume: 'volume-i-manifesto',
    category: 'Memory Philosophy',
    summary:
      'Knowledge teaches how. Wisdom teaches when. Studio World preserves professional judgment, lived career history, and institutional memory — not just searchable documents.',
    philosophy: 'The platform should preserve wisdom, not just knowledge.',
    guidingPrinciples: [
      'Institutional memory must survive model changes, team changes, and implementation rewrites.',
      'Professional Memory™ captures meaningful career experiences — not lesson completion.',
      'The Wisdom Engine™ synthesizes judgment from lived context.',
      'Canon promotion requires founder review — nothing enters memory automatically.',
    ],
    relatedSystems: [
      'Knowledge Core™',
      'Memory System™',
      'Professional Memory™',
      'Wisdom Engine™',
    ],
    relatedArticles: ['ARTICLE-K22', 'ARTICLE-K23', 'ARTICLE-E04', 'ARTICLE-E03'],
    tags: ['manifesto', 'wisdom', 'memory', 'knowledge'],
    docPaths: ['docs/studio-os/engine/professional-memory/ARTICLE_E04_PROFESSIONAL_MEMORY_WISDOM_ENGINE.md'],
  },
];
