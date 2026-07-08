import type { CodexArticleRecord } from '../types';

export type CodexSemanticCluster = {
  id: string;
  triggers: string[];
  relatedArticleIds: string[];
  relatedSystems: string[];
  relatedVolumes: string[];
};

/** Semantic clusters — constitutional questions surface related articles, not folder paths. */
export const CODEX_SEMANTIC_CLUSTERS: CodexSemanticCluster[] = [
  {
    id: 'manifesto-cluster',
    triggers: ['manifesto', 'inhabited', 'civilization', 'wisdom', 'careers not courses'],
    relatedArticleIds: ['ARTICLE-M01', 'ARTICLE-M02', 'ARTICLE-M03'],
    relatedSystems: ['Orb™', 'Career Worlds™'],
    relatedVolumes: ['volume-i-manifesto'],
  },
  {
    id: 'foundry-cluster',
    triggers: ['foundry', 'generation recipe', 'asset compiler', 'manufacturing'],
    relatedArticleIds: ['ARTICLE-A02', 'ARTICLE-A01', 'ARTICLE-D09'],
    relatedSystems: ['Studio Foundry™', 'Asset Compiler™'],
    relatedVolumes: ['volume-iv-architecture-standards', 'volume-ii-constitution'],
  },
  {
    id: 'world-bible-cluster',
    triggers: ['world bible', 'district', 'headquarters', 'mission control', 'npc', 'world clock'],
    relatedArticleIds: ['ARTICLE-W01', 'ARTICLE-W02', 'ARTICLE-W07'],
    relatedSystems: ['Mission Control™', 'World Atlas™', 'Orb™'],
    relatedVolumes: ['volume-iii-world-bible'],
  },
  {
    id: 'design-cluster',
    triggers: ['design language', 'glassmorphism', 'silhouette', 'hero object', 'luxury material'],
    relatedArticleIds: ['ARTICLE-D01', 'ARTICLE-D06', 'ARTICLE-D09'],
    relatedSystems: ['Hero Objects™', 'Design DNA Canon™'],
    relatedVolumes: ['volume-v-design-language'],
  },
  {
    id: 'production-cluster',
    triggers: ['production', 'definition of done', 'qa', 'completion', 'post-launch'],
    relatedArticleIds: ['ARTICLE-K24', 'ARTICLE-P03', 'ARTICLE-P05'],
    relatedSystems: ['Production Completion System™'],
    relatedVolumes: ['volume-vi-production-standards'],
  },
  {
    id: 'exchange-cluster',
    triggers: ['studio exchange', 'professional license', 'mentor economy', 'certification ceremony'],
    relatedArticleIds: ['ARTICLE-E05', 'ARTICLE-E07', 'ARTICLE-E08'],
    relatedSystems: ['Studio Exchange™', 'Studio Economy™'],
    relatedVolumes: ['volume-viii-career-worlds', 'volume-ii-constitution'],
  },
  {
    id: 'codex-first-cluster',
    triggers: ['codex first', 'codex-first', 'before implementation', 'constitutional memory'],
    relatedArticleIds: ['ARTICLE-C01'],
    relatedSystems: ['Knowledge Core™', 'World Graph™', 'Constitution Hall™'],
    relatedVolumes: ['volume-ii-constitution'],
  },
  {
    id: 'constitution-cluster',
    triggers: ['constitution', 'law', 'governance', 'review gate', 'canonical'],
    relatedArticleIds: ['ARTICLE-C01', 'ARTICLE-K18', 'ARTICLE-D09', 'ARTICLE-A02', 'ARTICLE-E02'],
    relatedSystems: ['Constitution Hall™', 'Production Completion System™'],
    relatedVolumes: ['volume-ii-constitution'],
  },
  {
    id: 'architecture-cluster',
    triggers: ['architecture', 'platform', 'engine', 'reusable', 'standards'],
    relatedArticleIds: ['ARTICLE-AR01', 'ARTICLE-K21', 'ARTICLE-A01'],
    relatedSystems: ['World Graph™', 'Architecture Decision Records™'],
    relatedVolumes: ['volume-iv-architecture-standards'],
  },
  {
    id: 'career-worlds-cluster',
    triggers: ['career world', 'career hub', 'profession simulation', 'persistent world'],
    relatedArticleIds: ['ARTICLE-E02'],
    relatedSystems: ['Career Worlds™', 'Profession Brains™'],
    relatedVolumes: ['volume-viii-career-worlds'],
  },
  {
    id: 'knowledge-cluster',
    triggers: ['knowledge core', 'institutional memory', 'canon', 'prompt memory'],
    relatedArticleIds: ['ARTICLE-K22', 'ARTICLE-C01'],
    relatedSystems: ['Knowledge Core™', 'Memory System™'],
    relatedVolumes: ['volume-ix-knowledge-core'],
  },
  {
    id: 'future-vision-cluster',
    triggers: ['future', 'evolution', 'era', 'unbuilt', 'vision', 'roadmap'],
    relatedArticleIds: ['ARTICLE-F01', 'ARTICLE-F05'],
    relatedSystems: ['Innovation District™', 'Future Vision™'],
    relatedVolumes: ['volume-x-future-vision'],
  },
];

export function expandCodexSemanticQuery(query: string): {
  expandedTerms: string[];
  relatedArticleIds: string[];
  relatedSystems: string[];
  relatedVolumes: string[];
} {
  const q = query.trim().toLowerCase();
  const expandedTerms = new Set<string>([q]);
  const relatedArticleIds = new Set<string>();
  const relatedSystems = new Set<string>();
  const relatedVolumes = new Set<string>();

  for (const cluster of CODEX_SEMANTIC_CLUSTERS) {
    const matched = cluster.triggers.some((t) => q.includes(t) || t.includes(q));
    if (matched) {
      cluster.triggers.forEach((t) => expandedTerms.add(t));
      cluster.relatedArticleIds.forEach((id) => relatedArticleIds.add(id));
      cluster.relatedSystems.forEach((s) => relatedSystems.add(s));
      cluster.relatedVolumes.forEach((v) => relatedVolumes.add(v));
    }
  }

  q.split(/\s+/).filter((w) => w.length > 2).forEach((w) => expandedTerms.add(w));

  return {
    expandedTerms: [...expandedTerms],
    relatedArticleIds: [...relatedArticleIds],
    relatedSystems: [...relatedSystems],
    relatedVolumes: [...relatedVolumes],
  };
}

export function scoreCodexArticle(
  article: CodexArticleRecord,
  terms: string[],
  relatedArticleIds: string[],
  relatedSystems: string[],
  relatedVolumes: string[]
): { score: number; reason: string } {
  let score = 0;
  let reason = 'keyword match';

  const blob = [
    article.articleId,
    article.title,
    article.category,
    article.summary,
    article.philosophy,
    article.volume,
    article.department ?? '',
    ...article.guidingPrinciples,
    ...article.architecturalDecisions,
    ...article.implementationReferences,
    ...article.relatedSystems,
    ...article.relatedArticles,
    ...article.tags,
  ]
    .join(' ')
    .toLowerCase();

  for (const term of terms) {
    if (article.articleId.toLowerCase().includes(term)) score += 20;
    if (article.title.toLowerCase().includes(term)) score += 16;
    if (article.philosophy.toLowerCase().includes(term)) score += 12;
    if (blob.includes(term)) score += 6;
  }

  if (relatedArticleIds.includes(article.articleId)) {
    score += 24;
    reason = 'related article';
  }

  if (relatedSystems.some((s) => article.relatedSystems.includes(s))) {
    score += 18;
    reason = 'related system';
  }

  if (relatedVolumes.includes(article.volume)) {
    score += 14;
    reason = 'related volume';
  }

  if (article.status === 'Canonical') score += 8;
  if (article.status === 'Approved') score += 4;

  return { score, reason };
}
