import { STUDIO_WORLD_CODEX_ARTICLE_ID, STUDIO_WORLD_CODEX_VERSION } from '../constants';
import { normalizeCodexArticle } from '../articles/schema';
import type {
  CodexArticleRecord,
  CodexArticleRelationship,
  CodexArticleRevisionSnapshot,
  CodexStore,
} from '../types';

const C01_CREATED = '2026-07-08T00:00:00.000Z';

/** Bootstrap seed — loaded once when store is empty. Not the runtime article registry. */
export function createC01SeedArticle(): CodexArticleRecord {
  return normalizeCodexArticle({
    articleId: STUDIO_WORLD_CODEX_ARTICLE_ID,
    title: 'The Codex First Principle™',
    category: 'Constitutional Law',
    volume: 'volume-ii-constitution',
    status: 'Canonical',
    pipelineStage: 'Codex Article',
    createdAt: C01_CREATED,
    updatedAt: C01_CREATED,
    author: 'Studio World Architecture',
    contributors: ['Founder Architecture Sprint'],
    summary:
      'Every major Studio World feature must become a Codex Article™ before implementation begins.',
    philosophy:
      'The Codex is not documentation; it is Studio World remembering itself before it builds.',
    guidingPrinciples: [
      'Document before implementation.',
      'Every major feature must answer why it should exist.',
      'Approved ideas become Codex Articles before engineering begins.',
      'The Codex must outlive individual AI models, conversations, contributors, and implementations.',
      'Reusable platform capabilities are preferred over one-off features.',
    ],
    architecturalDecisions: [
      'Major feature work starts in the Codex lifecycle, not directly in code.',
      'Knowledge Core, World Bible, ADRs, and implementation plans become projections of Codex-approved truth.',
      'Constitution Review™ becomes the formal gate between article approval and implementation planning.',
      'Post-launch learnings must update the relevant article instead of living only in memory or chat.',
    ],
    implementationReferences: [
      'docs/studio-os/codex/ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md',
      'docs/studio-os/codex/CODEX_ARTICLE_TEMPLATE.md',
      'src/studio-os-core/studio-world-codex/',
    ],
    relatedSystems: [
      'Knowledge Core™',
      'World Graph™',
      'Architecture Decision Records™',
      'World Bible™',
      'Studio Production Orchestrator™',
      'Production Completion System™',
      'Career Worlds™',
      'Profession Brains™',
    ],
    relatedArticles: ['ARTICLE-K21', 'ARTICLE-K22', 'ARTICLE-K23', 'ARTICLE-K24', 'ARTICLE-E02'],
    revisionHistory: [
      {
        revisionId: 'rev-c01-1.0.0',
        version: '1.0.0',
        createdAt: C01_CREATED,
        author: 'Studio World Architecture',
        summary: 'Initial accepted architecture for Codex-first governance.',
        changeNote: 'Architecture sprint acceptance.',
      },
    ],
    tags: ['codex', 'codex-first', 'constitutional-memory', 'article-c01'],
    department: 'Constitution Hall',
    docPaths: ['docs/studio-os/codex/ARTICLE_C01_CODEX_FIRST_PRINCIPLE.md'],
    codePaths: ['src/studio-os-core/studio-world-codex/'],
    worldGraphNodeId: 'W-LAW-codex-first-principle',
  });
}

export function createC01SeedRelationships(): CodexArticleRelationship[] {
  const articleId = STUDIO_WORLD_CODEX_ARTICLE_ID;
  const createdAt = C01_CREATED;

  return [
    {
      id: 'rel-c01-supports-k22',
      fromArticleId: articleId,
      toArticleId: 'ARTICLE-K22',
      type: 'supports',
      label: 'institutional-memory-substrate',
      createdAt,
    },
    {
      id: 'rel-c01-depends-k21',
      fromArticleId: articleId,
      toArticleId: 'ARTICLE-K21',
      type: 'depends-on',
      label: 'memory-system-foundation',
      createdAt,
    },
    {
      id: 'rel-c01-related-e02',
      fromArticleId: articleId,
      toArticleId: 'ARTICLE-E02',
      type: 'related-to',
      label: 'career-worlds-governance',
      createdAt,
    },
  ];
}

function createC01RevisionSnapshot(article: CodexArticleRecord): CodexArticleRevisionSnapshot {
  return {
    revisionId: 'rev-c01-1.0.0',
    articleId: article.articleId,
    version: '1.0.0',
    snapshot: article,
    createdAt: C01_CREATED,
    author: article.author,
    changeNote: 'Bootstrap seed — architecture sprint acceptance.',
  };
}

/** Articles used for bootstrap and compile-time World Graph ingestion. */
export function getCodexBootstrapArticles(): CodexArticleRecord[] {
  return [createC01SeedArticle()];
}

export function getCodexBootstrapRelationships(): CodexArticleRelationship[] {
  return createC01SeedRelationships();
}

export function bootstrapCodexStoreIfEmpty(store: CodexStore): CodexStore {
  if (store.articles.length > 0) return store;

  const articles = getCodexBootstrapArticles();
  const relationships = getCodexBootstrapRelationships();
  const revisionSnapshots = articles.map(createC01RevisionSnapshot);

  return {
    ...store,
    version: STUDIO_WORLD_CODEX_VERSION,
    articles,
    relationships,
    revisionSnapshots,
    bootstrappedAt: new Date().toISOString(),
  };
}
