import { listCodexArticles } from '../articles/registry';
import { readCodexStore } from '../persistence/store';
import {
  findRelatedArticleIds,
  listRelationshipsForArticle,
  codexRelationshipsToWorldGraphEdges,
} from '../relationships/engine';

/**
 * World Graph synchronization hooks — Codex Articles compile into graph nodes.
 * Called during graph compile via codex-ingest.ts; this module exposes
 * runtime sync metadata for the Codex workspace UI.
 */
export function getCodexWorldGraphSyncPayload() {
  const store = readCodexStore();
  const articles = listCodexArticles();

  return {
    engineId: 'studio-world-codex',
    nodeType: 'constitutional-law' as const,
    articleCount: articles.length,
    relationshipCount: store.relationships.length,
    nodes: articles.map((article) => ({
      id: article.worldGraphNodeId ?? `codex-${article.articleId.toLowerCase()}`,
      slug: article.articleId.toLowerCase(),
      displayName: article.title,
      volume: article.volume,
      status: article.status,
      version: article.revisionHistory.at(-1)?.version ?? '0.1.0',
      summary: article.summary,
      isCanonical: article.status === 'Canonical',
    })),
    edges: articles.flatMap((article) =>
      codexRelationshipsToWorldGraphEdges(article.articleId, store.relationships)
    ),
    syncedAt: new Date().toISOString(),
  };
}

export function getCodexArticleGraphNeighbors(articleId: string): string[] {
  const store = readCodexStore();
  return findRelatedArticleIds(store.relationships, articleId);
}

export function getCodexArticleGraphEdges(articleId: string) {
  const store = readCodexStore();
  return listRelationshipsForArticle(store.relationships, articleId);
}
