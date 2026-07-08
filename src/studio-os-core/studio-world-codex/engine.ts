import { listCodexArticles, getCodexArticle } from './articles/registry';
import { readCodexStore } from './persistence/store';
import { applyCodexFilters } from './search/filters';
import { expandCodexSemanticQuery, scoreCodexArticle } from './search/semantic-search';
import {
  findConflictingRelationships,
  findRelatedArticleIds,
  listRelationshipsForArticle,
} from './relationships/engine';
import {
  getRevisionSnapshotById,
  listArticleRevisionSnapshots,
} from './versioning/revisions';
import { getCodexWorldGraphSyncPayload } from './world-graph/sync';
import {
  buildCodexCuratorLines,
  getCodexOrbRecommendations,
  resolveCodexAdvice,
} from './orb/curator';
import { CODEX_VOLUMES, getCodexVolume } from './volumes';
import type {
  CodexArticleRecord,
  CodexArticleRelationship,
  CodexArticleRevisionSnapshot,
  CodexOrbRecommendation,
  CodexSearchFilters,
  CodexSearchHit,
} from './types';

export type CodexStats = {
  totalArticles: number;
  canonicalArticles: number;
  approvedArticles: number;
  draftArticles: number;
  totalRelationships: number;
  totalRevisions: number;
  volumeCount: number;
};

export function ensureCodexStore() {
  return readCodexStore();
}

export function getCodexStats(): CodexStats {
  const store = readCodexStore();
  const articles = store.articles;

  return {
    totalArticles: articles.length,
    canonicalArticles: articles.filter((a) => a.status === 'Canonical').length,
    approvedArticles: articles.filter((a) => a.status === 'Approved').length,
    draftArticles: articles.filter((a) => a.status === 'Draft').length,
    totalRelationships: store.relationships.length,
    totalRevisions: store.revisionSnapshots.length,
    volumeCount: CODEX_VOLUMES.length,
  };
}

export function queryCodex(
  query: string,
  filters?: CodexSearchFilters,
  limit = 12
): CodexSearchHit[] {
  const trimmed = query.trim();
  let articles = applyCodexFilters(listCodexArticles(), filters);

  if (!trimmed) {
    return articles.slice(0, limit).map((article) => ({
      article,
      score: 1,
      matchReason: 'browse',
    }));
  }

  const { expandedTerms, relatedArticleIds, relatedSystems, relatedVolumes } =
    expandCodexSemanticQuery(trimmed);

  return articles
    .map((article) => {
      const { score, reason } = scoreCodexArticle(
        article,
        expandedTerms,
        relatedArticleIds,
        relatedSystems,
        relatedVolumes
      );
      return { article, score, matchReason: reason };
    })
    .filter((hit) => hit.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getCodexArticleRelationships(articleId: string): CodexArticleRelationship[] {
  return listRelationshipsForArticle(readCodexStore().relationships, articleId);
}

export function getRelatedCodexArticles(articleId: string): CodexArticleRecord[] {
  const relatedIds = findRelatedArticleIds(readCodexStore().relationships, articleId);
  return relatedIds
    .map((id) => getCodexArticle(id))
    .filter((a): a is CodexArticleRecord => Boolean(a));
}

export function getCodexArticleRevisionHistory(articleId: string): CodexArticleRevisionSnapshot[] {
  return listArticleRevisionSnapshots(readCodexStore().revisionSnapshots, articleId);
}

export function getCodexRevisionById(revisionId: string): CodexArticleRevisionSnapshot | undefined {
  return getRevisionSnapshotById(readCodexStore().revisionSnapshots, revisionId);
}

export function getCodexConflicts(articleId: string): CodexArticleRelationship[] {
  return findConflictingRelationships(readCodexStore().relationships, articleId);
}

export function getCodexCuratorLines(): string[] {
  return buildCodexCuratorLines(listCodexArticles());
}

export {
  getCodexOrbRecommendations,
  resolveCodexAdvice,
  getCodexWorldGraphSyncPayload,
  getCodexArticle,
  listCodexArticles,
  getCodexVolume,
  CODEX_VOLUMES,
};

export type { CodexArticleRecord, CodexSearchFilters, CodexSearchHit, CodexOrbRecommendation };
