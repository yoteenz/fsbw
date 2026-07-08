import { normalizeCodexArticle } from './schema';
import { mutateCodexStore } from '../persistence/store';
import { appendRevisionSnapshot } from '../versioning/revisions';
import { syncArticleRelationshipsFromFields } from '../relationships/engine';
import type { CodexArticleRecord, CodexPipelineStage, CodexPublicationStatus, CodexVolumeId } from '../types';

export type CreateCodexArticleInput = {
  articleId: string;
  title: string;
  volume: CodexVolumeId;
  category?: string;
  status?: CodexPublicationStatus;
  pipelineStage?: CodexPipelineStage;
  author?: string;
  contributors?: string[];
  summary?: string;
  philosophy?: string;
  guidingPrinciples?: string[];
  architecturalDecisions?: string[];
  implementationReferences?: string[];
  relatedSystems?: string[];
  relatedArticles?: string[];
  tags?: string[];
  department?: string;
  docPaths?: string[];
  codePaths?: string[];
};

export function createCodexArticle(input: CreateCodexArticleInput): CodexArticleRecord {
  const article = normalizeCodexArticle({
    ...input,
    revisionHistory: [
      {
        revisionId: `rev-${input.articleId.toLowerCase()}-0.1.0`,
        version: '0.1.0',
        createdAt: new Date().toISOString(),
        author: input.author ?? 'Studio World',
        summary: input.summary ?? 'Initial draft created.',
        changeNote: 'Article created.',
      },
    ],
  });

  mutateCodexStore((store) => {
    if (store.articles.some((a) => a.articleId === article.articleId)) {
      throw new Error(`Codex article ${article.articleId} already exists.`);
    }

    const revisionSnapshots = appendRevisionSnapshot(store.revisionSnapshots, article, {
      version: '0.1.0',
      author: article.author,
      changeNote: 'Article created.',
    });

    const relationships = syncArticleRelationshipsFromFields(store.relationships, article);

    return {
      ...store,
      articles: [...store.articles, article],
      relationships,
      revisionSnapshots,
    };
  });

  return article;
}
