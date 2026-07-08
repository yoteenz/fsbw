import { normalizeCodexArticle } from './schema';
import { mutateCodexStore } from '../persistence/store';
import { appendRevisionSnapshot, bumpVersion } from '../versioning/revisions';
import { syncArticleRelationshipsFromFields } from '../relationships/engine';
import type { CodexArticleRecord } from '../types';

export type ReviseCodexArticleInput = Partial<
  Pick<
    CodexArticleRecord,
    | 'title'
    | 'category'
    | 'volume'
    | 'status'
    | 'pipelineStage'
    | 'author'
    | 'contributors'
    | 'summary'
    | 'philosophy'
    | 'guidingPrinciples'
    | 'architecturalDecisions'
    | 'implementationReferences'
    | 'relatedSystems'
    | 'relatedArticles'
    | 'tags'
    | 'department'
    | 'docPaths'
    | 'codePaths'
  >
>;

export function reviseCodexArticle(
  articleId: string,
  patch: ReviseCodexArticleInput,
  changeNote: string,
  author = 'Studio World'
): CodexArticleRecord {
  const normalizedId = articleId.trim().toUpperCase();
  let revised!: CodexArticleRecord;

  mutateCodexStore((store) => {
    const index = store.articles.findIndex((a) => a.articleId === normalizedId);
    if (index < 0) {
      throw new Error(`Codex article ${normalizedId} not found.`);
    }

    const current = store.articles[index]!;
    const nextVersion = bumpVersion(current.revisionHistory.at(-1)?.version ?? '0.1.0');
    const now = new Date().toISOString();

    revised = normalizeCodexArticle({
      ...current,
      ...patch,
      articleId: current.articleId,
      updatedAt: now,
      revisionHistory: [
        ...current.revisionHistory,
        {
          revisionId: `rev-${current.articleId.toLowerCase()}-${nextVersion}`,
          version: nextVersion,
          createdAt: now,
          author,
          summary: patch.summary ?? current.summary,
          changeNote,
        },
      ],
    });

    const articles = [...store.articles];
    articles[index] = revised;

    const revisionSnapshots = appendRevisionSnapshot(store.revisionSnapshots, revised, {
      version: nextVersion,
      author,
      changeNote,
    });

    const relationships = syncArticleRelationshipsFromFields(store.relationships, revised);

    return {
      ...store,
      articles,
      relationships,
      revisionSnapshots,
    };
  });

  return revised;
}
