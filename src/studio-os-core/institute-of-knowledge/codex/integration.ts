import { listCodexArticles, getCodexArticle } from '../../studio-world-codex/articles/registry';
import { readCodexStore } from '../../studio-world-codex/persistence/store';
import { THE_INSTITUTE_OF_KNOWLEDGE } from '../institute/registry';
import { listInstitutePublications } from '../publications/engine';
import type { InstitutePublication } from '../types';

/** Institute governs Codex — C03 constitutional integration layer. */
export function getInstituteCodexGovernance() {
  return {
    institute: THE_INSTITUTE_OF_KNOWLEDGE,
    governsCodex: true,
    codexArticleId: 'ARTICLE-C03',
    canonGate: THE_INSTITUTE_OF_KNOWLEDGE.canonGate,
  };
}

export function getCodexArticlesUnderInstituteGovernance() {
  return listCodexArticles();
}

export function findInstitutePublicationForCodexArticle(
  articleId: string
): InstitutePublication | undefined {
  return listInstitutePublications().find((p) => p.codexArticleIds.includes(articleId));
}

export function getInstituteCodexSyncSummary() {
  const codexArticles = listCodexArticles();
  const publications = listInstitutePublications();
  const codexDerived = publications.filter((p) => p.codexArticleIds.length > 0);
  const store = readCodexStore();

  return {
    codexArticleCount: codexArticles.length,
    institutePublicationCount: publications.length,
    codexDerivedPublicationCount: codexDerived.length,
    codexRelationshipCount: store.relationships.length,
    canonicalCodexArticles: codexArticles.filter((a) => a.status === 'Canonical').length,
    governedBy: THE_INSTITUTE_OF_KNOWLEDGE.title,
  };
}

export function resolveConstitutionalSourcesForQuery(query: string): InstitutePublication[] {
  const q = query.toLowerCase();
  return listInstitutePublications().filter(
    (p) =>
      p.constitutionalArticleIds.length > 0 &&
      (p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.codexArticleIds.some((id) => id.toLowerCase().includes(q)))
  );
}

export function getCodexArticleForInstitutePublication(publication: InstitutePublication) {
  const articleId = publication.codexArticleIds[0];
  return articleId ? getCodexArticle(articleId) : undefined;
}
