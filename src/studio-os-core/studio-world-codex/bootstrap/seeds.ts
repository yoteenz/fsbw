import {
  CANONICAL_ARCHIVE_VERSION,
} from './article-builder';
import {
  buildCanonicalArchiveStorePayload,
  getCanonicalArchiveArticles,
  getCanonicalArchiveRelationships,
  CANONICAL_ARCHIVE_ARTICLE_COUNT,
} from './canonical-archive';
import { syncArticleRelationshipsFromFields } from '../relationships/engine';
import { STUDIO_WORLD_CODEX_VERSION } from '../constants';
import type { CodexStore } from '../types';

export { CANONICAL_ARCHIVE_VERSION, CANONICAL_ARCHIVE_ARTICLE_COUNT };
export {
  getCanonicalArchiveArticles,
  getCanonicalArchiveRelationships,
  buildCanonicalArchiveStorePayload,
} from './canonical-archive';

/** @deprecated Use getCanonicalArchiveArticles */
export function getCodexBootstrapArticles() {
  return getCanonicalArchiveArticles();
}

/** @deprecated Use getCanonicalArchiveRelationships */
export function getCodexBootstrapRelationships() {
  return getCanonicalArchiveRelationships();
}

/** @deprecated Use getCanonicalArchiveArticles()[0] */
export function createC01SeedArticle() {
  return getCanonicalArchiveArticles().find((a) => a.articleId === 'ARTICLE-C01')!;
}

export function bootstrapCodexStoreIfEmpty(store: CodexStore): CodexStore {
  const archive = buildCanonicalArchiveStorePayload();
  let relationships = archive.relationships;
  for (const article of archive.articles) {
    relationships = syncArticleRelationshipsFromFields(relationships, article);
  }

  return {
    ...store,
    version: STUDIO_WORLD_CODEX_VERSION,
    articles: archive.articles,
    relationships,
    revisionSnapshots: archive.revisionSnapshots,
    bootstrappedAt: new Date().toISOString(),
    canonicalArchiveVersion: CANONICAL_ARCHIVE_VERSION,
  };
}

export function needsCanonicalArchiveMigration(store: CodexStore): boolean {
  return (
    store.canonicalArchiveVersion !== CANONICAL_ARCHIVE_VERSION ||
    store.articles.length < CANONICAL_ARCHIVE_ARTICLE_COUNT
  );
}

export function migrateToCanonicalArchive(store: CodexStore): CodexStore {
  if (!needsCanonicalArchiveMigration(store)) return store;
  return bootstrapCodexStoreIfEmpty(store);
}
