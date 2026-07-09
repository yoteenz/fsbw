import { INITIAL_GENESIS_VERSION } from '../../versioning/semver';
import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import type {
  ConstitutionArticle,
  ConstitutionArticleStatus,
  ConstitutionCanonicalStatus,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

export type RegisterConstitutionArticleInput = {
  articleId: string;
  officialName: string;
  category: string;
  summary: string;
  purpose: string;
  constitutionalText: string;
  interpretation: string;
  examples?: string[];
  antiPatterns?: string[];
  dependencies?: string[];
  relatedArticles?: string[];
  author: string;
  contributors?: string[];
  tags?: string[];
  sourcePath?: string;
  status?: ConstitutionArticleStatus;
  canonicalStatus?: ConstitutionCanonicalStatus;
};

export function listConstitutionArticles(): ConstitutionArticle[] {
  return readConstitutionStore().articles;
}

export function getConstitutionArticle(articleId: string): ConstitutionArticle | undefined {
  return readConstitutionStore().articles.find((a) => a.articleId === articleId);
}

/** Register a constitutional article — no hardcoded content; data-driven registration. */
export function registerConstitutionArticle(
  input: RegisterConstitutionArticleInput
): ConstitutionArticle {
  const existing = getConstitutionArticle(input.articleId);
  if (existing) {
    throw new Error(`Constitution article ${input.articleId} already exists`);
  }

  const timestamp = now();
  const article: ConstitutionArticle = {
    articleId: input.articleId.trim(),
    officialName: input.officialName.trim(),
    status: input.status ?? 'draft',
    version: { ...INITIAL_GENESIS_VERSION },
    category: input.category.trim(),
    summary: input.summary.trim(),
    purpose: input.purpose.trim(),
    constitutionalText: input.constitutionalText.trim(),
    interpretation: input.interpretation.trim(),
    examples: input.examples ?? [],
    antiPatterns: input.antiPatterns ?? [],
    dependencies: input.dependencies ?? [],
    relatedArticles: input.relatedArticles ?? [],
    revisionHistory: [],
    approvalHistory: [],
    canonicalStatus: input.canonicalStatus ?? 'non-canonical',
    author: input.author,
    contributors: input.contributors ?? [input.author],
    tags: input.tags ?? ['constitutional'],
    sourcePath: input.sourcePath,
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  mutateConstitutionStore((store) => ({
    ...store,
    articles: [...store.articles, article],
  }));

  return article;
}

export function updateConstitutionArticle(
  articleId: string,
  patch: Partial<
    Pick<
      ConstitutionArticle,
      | 'officialName'
      | 'category'
      | 'summary'
      | 'purpose'
      | 'constitutionalText'
      | 'interpretation'
      | 'examples'
      | 'antiPatterns'
      | 'dependencies'
      | 'relatedArticles'
      | 'status'
      | 'canonicalStatus'
      | 'tags'
      | 'contributors'
    >
  >
): ConstitutionArticle | undefined {
  let updated: ConstitutionArticle | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.articles.findIndex((a) => a.articleId === articleId);
    if (idx < 0) return store;

    updated = {
      ...store.articles[idx],
      ...patch,
      updatedAt: now(),
    };

    const articles = [...store.articles];
    articles[idx] = updated;
    return { ...store, articles };
  });

  return updated;
}

export function listCanonicalConstitutionArticles(): ConstitutionArticle[] {
  return listConstitutionArticles().filter((a) => a.canonicalStatus === 'canonical');
}

export function searchConstitutionArticles(query: string, limit = 20): ConstitutionArticle[] {
  const q = query.trim().toLowerCase();
  if (!q) return listConstitutionArticles().slice(0, limit);

  return listConstitutionArticles()
    .map((article) => {
      let score = 0;
      if (article.articleId.toLowerCase().includes(q)) score += 6;
      if (article.officialName.toLowerCase().includes(q)) score += 5;
      if (article.summary.toLowerCase().includes(q)) score += 3;
      if (article.category.toLowerCase().includes(q)) score += 2;
      if (article.tags.some((t) => t.toLowerCase().includes(q))) score += 2;
      return { article, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ article }) => article);
}
