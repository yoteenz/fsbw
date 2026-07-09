import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import { getConstitutionArticle } from '../articles/engine';
import type { ConstitutionHistoricalEntry } from '../types';

function now(): string {
  return new Date().toISOString();
}

/** Historical Archive™ — append-only constitutional history. */
export function listConstitutionHistoricalArchive(articleId?: string): ConstitutionHistoricalEntry[] {
  const archive = readConstitutionStore().historicalArchive;
  return articleId ? archive.filter((h) => h.articleId === articleId) : archive;
}

export function archiveConstitutionHistoricalEntry(
  articleId: string,
  input: { reason: string; amendmentId?: string }
): ConstitutionHistoricalEntry | undefined {
  const article = getConstitutionArticle(articleId);
  if (!article || article.revisionHistory.length === 0) return undefined;

  const latest = article.revisionHistory[article.revisionHistory.length - 1];
  const entry: ConstitutionHistoricalEntry = {
    historyId: `con-hist-${articleId}-${Date.now().toString(36)}`,
    articleId,
    revision: latest,
    amendmentId: input.amendmentId,
    archivedAt: now(),
    reason: input.reason.trim(),
  };

  mutateConstitutionStore((store) => ({
    ...store,
    historicalArchive: [...store.historicalArchive, entry],
  }));

  return entry;
}

export function listSupersededConstitutionArticles(): string[] {
  return readConstitutionStore()
    .articles.filter((a) => a.status === 'superseded' || a.canonicalStatus === 'historical')
    .map((a) => a.articleId);
}

export function getConstitutionArticleTimeline(articleId: string) {
  const article = getConstitutionArticle(articleId);
  if (!article) return [];

  const archived = listConstitutionHistoricalArchive(articleId).map((h) => h.revision);
  return [...article.revisionHistory, ...archived].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}
