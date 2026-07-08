import { getCanonicalArchiveArticles } from '../../studio-world-codex/bootstrap/canonical-archive';
import { STUDIO_WORLD_CODEX_VERSION } from '../../studio-world-codex/constants';
import type { CodexArticleRecord } from '../../studio-world-codex/types';
import { INSTITUTE_OF_KNOWLEDGE_VERSION } from '../constants';
import { resolveDivisionForPublicationType } from '../institute/registry';
import type {
  ChronicleEntry,
  InstituteDivisionId,
  InstitutePublication,
  InstitutePublicationRelationship,
  InstitutePublicationStatus,
  InstitutePublicationType,
  InstituteStore,
} from '../types';

function now(): string {
  return new Date().toISOString();
}

function slugify(id: string): string {
  return id.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

function mapCodexStatus(status: CodexArticleRecord['status']): InstitutePublicationStatus {
  switch (status) {
    case 'Canonical':
      return 'Canonical';
    case 'Approved':
      return 'Approved';
    default:
      return 'Working';
  }
}

function mapCodexToPublicationType(article: CodexArticleRecord): InstitutePublicationType {
  if (article.volume === 'volume-ii-constitution') return 'article';
  if (article.volume === 'volume-x-future-vision') return 'roadmap';
  if (/research|simulation|profession/i.test(article.category)) return 'research-paper';
  if (/design|production|architecture/i.test(article.category)) return 'specification';
  return 'article';
}

function divisionForArticle(article: CodexArticleRecord): InstituteDivisionId {
  if (article.volume === 'volume-ii-constitution') return 'constitution-office';
  if (article.volume === 'volume-x-future-vision') return 'world-chronicle';
  if (article.volume === 'volume-v-design-language' || article.volume === 'volume-vi-production-standards') {
    return 'standards-bureau';
  }
  if (article.volume === 'volume-vii-profession-brains' || article.volume === 'volume-viii-career-worlds') {
    return 'research-bureau';
  }
  return resolveDivisionForPublicationType(mapCodexToPublicationType(article));
}

export function publicationFromCodexArticle(article: CodexArticleRecord): InstitutePublication {
  const latestRevision = article.revisionHistory.at(-1);
  const edition = latestRevision?.version?.split('.')[0] ?? '1';
  const revision = latestRevision?.version ?? '1.0.0';
  const ts = article.updatedAt || article.createdAt || now();

  return {
    publicationId: `PUB-${article.articleId}`,
    title: article.title,
    type: mapCodexToPublicationType(article),
    edition,
    revision,
    status: mapCodexStatus(article.status),
    divisionId: divisionForArticle(article),
    summary: article.summary,
    abstract: article.philosophy,
    contributors: [article.author, ...article.contributors],
    approvalHistory: [],
    revisionHistory: article.revisionHistory.map((r) => ({
      revisionId: r.revisionId,
      edition: r.version.split('.')[0] ?? '1',
      revision: r.version,
      createdAt: r.createdAt,
      author: r.author,
      summary: r.summary,
      changeNote: r.changeNote,
    })),
    relatedPublicationIds: article.relatedArticles.map((id) => `PUB-${id}`),
    codexArticleIds: [article.articleId],
    constitutionalArticleIds:
      article.volume === 'volume-ii-constitution' ? [article.articleId] : [],
    professionIds: [],
    tags: [...article.tags, 'codex-derived', article.volume],
    docPaths: article.docPaths,
    codePaths: article.codePaths,
    worldGraphNodeId: article.worldGraphNodeId
      ? `institute-${slugify(article.worldGraphNodeId)}`
      : `institute-pub-${slugify(article.articleId)}`,
    createdAt: article.createdAt,
    updatedAt: ts,
  };
}

function buildCodexRelationships(
  articles: CodexArticleRecord[]
): InstitutePublicationRelationship[] {
  const articleIds = new Set(articles.map((a) => a.articleId));
  const rels: InstitutePublicationRelationship[] = [];
  const ts = now();

  for (const article of articles) {
    for (const relatedId of article.relatedArticles) {
      if (!articleIds.has(relatedId)) continue;
      rels.push({
        id: `rel-${article.articleId}-${relatedId}`,
        fromPublicationId: `PUB-${article.articleId}`,
        toPublicationId: `PUB-${relatedId}`,
        type: 'related-to',
        label: 'codex-related',
        createdAt: ts,
      });
    }
  }

  return rels;
}

function buildFoundingChronicle(publications: InstitutePublication[]): ChronicleEntry[] {
  const c03 = publications.find((p) => p.codexArticleIds.includes('ARTICLE-C03'));
  const c01 = publications.find((p) => p.codexArticleIds.includes('ARTICLE-C01'));

  const entries: ChronicleEntry[] = [];

  if (c01) {
    entries.push({
      entryId: 'chronicle-codex-first-principle',
      title: 'Codex First Principle™ Established',
      summary: 'Studio World adopts constitutional memory before implementation.',
      eventAt: c01.createdAt,
      recordedAt: now(),
      publicationIds: [c01.publicationId],
      codexArticleIds: ['ARTICLE-C01'],
      tags: ['founding', 'codex', 'constitution'],
      divisionId: 'constitution-office',
    });
  }

  if (c03) {
    entries.push({
      entryId: 'chronicle-institute-founded',
      title: 'The Institute of Knowledge™ Founded',
      summary: 'Studio World Press™ superseded by the permanent knowledge governance institution.',
      eventAt: c03.createdAt,
      recordedAt: now(),
      publicationIds: [c03.publicationId],
      codexArticleIds: ['ARTICLE-C03'],
      tags: ['founding', 'institute', 'governance'],
      divisionId: 'world-chronicle',
    });
  }

  return entries;
}

export function bootstrapInstituteStoreIfEmpty(store: InstituteStore): InstituteStore {
  const articles = getCanonicalArchiveArticles();
  const publications = articles.map(publicationFromCodexArticle);
  const relationships = buildCodexRelationships(articles);
  const chronicle = buildFoundingChronicle(publications);

  return {
    ...store,
    version: INSTITUTE_OF_KNOWLEDGE_VERSION,
    publications,
    relationships,
    chronicle,
    bootstrappedAt: now(),
    codexSyncVersion: STUDIO_WORLD_CODEX_VERSION,
  };
}

export function syncInstituteFromCodex(store: InstituteStore): InstituteStore {
  if (store.codexSyncVersion === STUDIO_WORLD_CODEX_VERSION) return store;

  const articles = getCanonicalArchiveArticles();
  const existingByCodex = new Map<string, InstitutePublication>();

  for (const pub of store.publications) {
    for (const codexId of pub.codexArticleIds) {
      existingByCodex.set(codexId, pub);
    }
  }

  const publications = [...store.publications];
  for (const article of articles) {
    if (existingByCodex.has(article.articleId)) {
      const idx = publications.findIndex((p) => p.codexArticleIds.includes(article.articleId));
      if (idx >= 0) {
        const derived = publicationFromCodexArticle(article);
        publications[idx] = {
          ...publications[idx],
          title: derived.title,
          summary: derived.summary,
          revision: derived.revision,
          status: derived.status,
          revisionHistory: derived.revisionHistory,
          updatedAt: derived.updatedAt,
        };
      }
      continue;
    }
    publications.push(publicationFromCodexArticle(article));
  }

  const relationships = buildCodexRelationships(articles);
  const mergedRels = [...store.relationships];
  const relIds = new Set(mergedRels.map((r) => r.id));
  for (const rel of relationships) {
    if (!relIds.has(rel.id)) mergedRels.push(rel);
  }

  return {
    ...store,
    publications,
    relationships: mergedRels,
    codexSyncVersion: STUDIO_WORLD_CODEX_VERSION,
  };
}

export function getInstituteBootstrapPublicationCount(): number {
  return getCanonicalArchiveArticles().length;
}
