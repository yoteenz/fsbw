import { normalizeCodexArticle } from '../articles/schema';
import type {
  CodexArticleRecord,
  CodexArticleRevisionSnapshot,
  CodexPublicationStatus,
  CodexVolumeId,
} from '../types';

const ARCHIVE_CREATED = '2026-07-08T00:00:00.000Z';

export type CanonicalArticleSeed = {
  articleId: string;
  title: string;
  volume: CodexVolumeId;
  category: string;
  status?: CodexPublicationStatus;
  summary: string;
  philosophy: string;
  guidingPrinciples?: string[];
  architecturalDecisions?: string[];
  implementationReferences?: string[];
  relatedSystems?: string[];
  relatedArticles?: string[];
  tags?: string[];
  department?: string;
  docPaths?: string[];
  codePaths?: string[];
  worldGraphNodeId?: string;
};

export function buildCanonicalArticle(seed: CanonicalArticleSeed): CodexArticleRecord {
  const articleId = seed.articleId.trim().toUpperCase();
  const slug = articleId.toLowerCase().replace(/^article-/, '');

  return normalizeCodexArticle({
    ...seed,
    articleId,
    status: seed.status ?? 'Canonical',
    pipelineStage: 'Codex Article',
    createdAt: ARCHIVE_CREATED,
    updatedAt: ARCHIVE_CREATED,
    author: 'Studio World Architecture',
    contributors: ['Canonical Seeding Sprint'],
    guidingPrinciples: seed.guidingPrinciples ?? [],
    architecturalDecisions: seed.architecturalDecisions ?? [],
    implementationReferences: seed.implementationReferences ?? [],
    relatedSystems: seed.relatedSystems ?? [],
    relatedArticles: seed.relatedArticles ?? [],
    tags: seed.tags ?? [],
    revisionHistory: [
      {
        revisionId: `rev-${slug}-1.0.0`,
        version: '1.0.0',
        createdAt: ARCHIVE_CREATED,
        author: 'Studio World Architecture',
        summary: seed.summary,
        changeNote: 'Canonical archive seed — Phase II.',
      },
    ],
    worldGraphNodeId: seed.worldGraphNodeId,
  });
}

export function buildRevisionSnapshots(articles: CodexArticleRecord[]): CodexArticleRevisionSnapshot[] {
  return articles.map((article) => ({
    revisionId: article.revisionHistory[0]?.revisionId ?? `rev-${article.articleId.toLowerCase()}-1.0.0`,
    articleId: article.articleId,
    version: '1.0.0',
    snapshot: article,
    createdAt: ARCHIVE_CREATED,
    author: article.author,
    changeNote: 'Canonical archive seed — Phase II.',
  }));
}

export const CANONICAL_ARCHIVE_VERSION = '1.2.0';
