import type { CodexArticleRecord, CodexPublicationStatus, CodexVolumeId } from '../types';

const VALID_STATUSES: CodexPublicationStatus[] = ['Draft', 'Approved', 'Canonical'];

function slugifyArticleId(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Normalize partial article input into a complete CodexArticleRecord. */
export function normalizeCodexArticle(input: Partial<CodexArticleRecord> & Pick<CodexArticleRecord, 'articleId' | 'title' | 'volume'>): CodexArticleRecord {
  const now = new Date().toISOString();
  const articleId = input.articleId.trim().toUpperCase();
  const status = input.status && VALID_STATUSES.includes(input.status) ? input.status : 'Draft';

  return {
    articleId,
    title: input.title.trim(),
    category: input.category?.trim() || 'Uncategorized',
    volume: input.volume as CodexVolumeId,
    status,
    pipelineStage: input.pipelineStage,
    createdAt: input.createdAt ?? now,
    updatedAt: input.updatedAt ?? now,
    author: input.author?.trim() || 'Studio World',
    contributors: [...(input.contributors ?? [])],
    summary: input.summary?.trim() || '',
    philosophy: input.philosophy?.trim() || '',
    guidingPrinciples: [...(input.guidingPrinciples ?? [])],
    architecturalDecisions: [...(input.architecturalDecisions ?? [])],
    implementationReferences: [...(input.implementationReferences ?? [])],
    relatedSystems: [...(input.relatedSystems ?? [])],
    relatedArticles: [...(input.relatedArticles ?? [])],
    revisionHistory: [...(input.revisionHistory ?? [])],
    tags: [...(input.tags ?? [])],
    department: input.department,
    docPaths: input.docPaths ? [...input.docPaths] : undefined,
    codePaths: input.codePaths ? [...input.codePaths] : undefined,
    worldGraphNodeId:
      input.worldGraphNodeId ?? `W-KNO-codex-${slugifyArticleId(articleId)}`,
  };
}

export function isCanonicalArticle(article: CodexArticleRecord): boolean {
  return article.status === 'Canonical';
}

export function isApprovedForImplementation(article: CodexArticleRecord): boolean {
  return article.status === 'Approved' || article.status === 'Canonical';
}
