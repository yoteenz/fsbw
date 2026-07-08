import type { CanonicalArticleSeed } from '../article-builder';

export const VOLUME_VIII_CAREER_WORLDS_ARTICLES: CanonicalArticleSeed[] = [
  {
    articleId: 'ARTICLE-E06',
    title: 'Career Progression & Professional Licenses™',
    volume: 'volume-viii-career-worlds',
    category: 'Progression Systems',
    summary:
      'Citizens advance through phases, roles, reputation tiers, and license gates — Professional Licenses unlock entire Career Worlds.',
    philosophy: 'Build careers instead of courses — progression is life arc, not module completion.',
    relatedSystems: ['Professional Licenses™', 'Reputation Engine™', 'Studio Exchange™'],
    relatedArticles: ['ARTICLE-E05', 'ARTICLE-E02', 'ARTICLE-W09'],
    tags: ['career-worlds', 'progression', 'licenses'],
  },
  {
    articleId: 'ARTICLE-E07',
    title: 'Career Expansions & Certifications™',
    volume: 'volume-viii-career-worlds',
    category: 'Specialization',
    summary:
      'Career Expansions are professional specializations — Color Lab, Luxury Salon, Editorial Fashion — unlocked through in-world achievement.',
    philosophy: 'Expansions are mastery paths — not downloadable content packs sold separately from meaning.',
    relatedSystems: ['Career Expansions™', 'Certification Ceremonies™'],
    relatedArticles: ['ARTICLE-E05', 'ARTICLE-E08'],
    tags: ['career-worlds', 'expansions', 'certifications'],
    docPaths: ['docs/studio-os/marketplace/studio-exchange.md'],
  },
  {
    articleId: 'ARTICLE-E08',
    title: 'Mentor Economy, Businesses & Graduation Ceremonies™',
    volume: 'volume-viii-career-worlds',
    category: 'Civic Life',
    summary:
      'Mentor Economy rewards teaching. Legacy Businesses persist contribution. Graduation Ceremonies mark license milestones with world unlocks.',
    philosophy: 'Contribution is economic life — ceremonies make achievement visible in the world.',
    relatedSystems: ['Mentor Economy™', 'Legacy Businesses™', 'Studio Economy™'],
    relatedArticles: ['ARTICLE-E05', 'ARTICLE-E07', 'ARTICLE-W08'],
    tags: ['career-worlds', 'mentor-economy', 'ceremonies', 'businesses'],
  },
];
