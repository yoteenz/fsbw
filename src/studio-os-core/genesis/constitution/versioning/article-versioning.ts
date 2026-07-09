import { bumpGenesisVersion } from '../../versioning/semver';
import { mutateConstitutionStore, readConstitutionStore } from '../persistence';
import { getConstitutionArticle } from '../articles/engine';
import type { ConstitutionArticleRevision } from '../types';

function now(): string {
  return new Date().toISOString();
}

function createRevisionId(articleId: string): string {
  return `con-rev-${articleId}-${Date.now().toString(36)}`;
}

/** Article Versioning™ — append-only constitutional revisions. */
export function createConstitutionArticleRevision(
  articleId: string,
  input: {
    summary: string;
    author: string;
    changeNote: string;
    versionLevel?: 'major' | 'minor' | 'patch';
  }
): ConstitutionArticleRevision | undefined {
  let revision: ConstitutionArticleRevision | undefined;

  mutateConstitutionStore((store) => {
    const idx = store.articles.findIndex((a) => a.articleId === articleId);
    if (idx < 0) return store;

    const article = store.articles[idx];
    const nextVersion = bumpGenesisVersion(
      article.version,
      input.versionLevel ?? 'patch'
    );

    revision = {
      revisionId: createRevisionId(articleId),
      version: nextVersion,
      summary: input.summary.trim(),
      author: input.author,
      changeNote: input.changeNote.trim(),
      createdAt: now(),
      snapshot: {
        constitutionalText: article.constitutionalText,
        interpretation: article.interpretation,
        summary: article.summary,
      },
    };

    const articles = [...store.articles];
    articles[idx] = {
      ...article,
      version: nextVersion,
      updatedAt: now(),
      revisionHistory: [...article.revisionHistory, revision],
    };

    return { ...store, articles };
  });

  return revision;
}

export function listConstitutionArticleRevisions(articleId: string): ConstitutionArticleRevision[] {
  return getConstitutionArticle(articleId)?.revisionHistory ?? [];
}

export function getConstitutionArticleVersion(articleId: string) {
  return getConstitutionArticle(articleId)?.version;
}

export function listAllConstitutionRevisions(): ConstitutionArticleRevision[] {
  return readConstitutionStore().articles.flatMap((a) => a.revisionHistory);
}
