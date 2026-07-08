import type { CodexArticleRecord, CodexSearchFilters } from '../types';

export function applyCodexFilters(
  articles: CodexArticleRecord[],
  filters?: CodexSearchFilters
): CodexArticleRecord[] {
  if (!filters) return articles;

  return articles.filter((article) => {
    if (filters.volume && article.volume !== filters.volume) return false;
    if (filters.category && article.category !== filters.category) return false;
    if (filters.status && article.status !== filters.status) return false;
    if (filters.department && article.department !== filters.department) return false;
    if (filters.tag && !article.tags.some((t) => t.toLowerCase() === filters.tag!.toLowerCase())) {
      return false;
    }
    if (
      filters.system &&
      !article.relatedSystems.some((s) => s.toLowerCase().includes(filters.system!.toLowerCase()))
    ) {
      return false;
    }
    if (filters.architecture) {
      const needle = filters.architecture.toLowerCase();
      const archBlob = [
        article.category,
        ...article.architecturalDecisions,
        ...article.implementationReferences,
        ...article.tags,
      ]
        .join(' ')
        .toLowerCase();
      if (!archBlob.includes(needle)) return false;
    }
    if (filters.futureRoadmap) {
      const isFuture =
        article.volume === 'volume-x-future-vision' ||
        article.tags.some((t) => /future|roadmap|era|evolution/i.test(t));
      if (!isFuture) return false;
    }
    if (filters.relatedArticleId) {
      const related = filters.relatedArticleId.trim().toUpperCase();
      if (
        !article.relatedArticles.includes(related) &&
        article.articleId !== related
      ) {
        return false;
      }
    }
    if (filters.createdAfter && article.createdAt < filters.createdAfter) return false;
    if (filters.createdBefore && article.createdAt > filters.createdBefore) return false;
    if (filters.updatedAfter && article.updatedAt < filters.updatedAfter) return false;
    return true;
  });
}

export const CODEX_STATUS_FILTERS = ['Draft', 'Approved', 'Canonical'] as const;
