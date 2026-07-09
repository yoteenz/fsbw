import { readConstitutionStore } from './persistence';
import { listConstitutionArticles, searchConstitutionArticles } from './articles/engine';
import type { ConstitutionRegistryStats } from './types';

/** Constitution Registry™ — canonical directory of constitutional articles. */
export function listConstitutionRegistry() {
  return listConstitutionArticles();
}

export function getConstitutionRegistryStats(): ConstitutionRegistryStats {
  const store = readConstitutionStore();

  return {
    articleCount: store.articles.length,
    canonicalCount: store.articles.filter((a) => a.canonicalStatus === 'canonical').length,
    amendmentCount: store.amendments.length,
    openAmendments: store.amendments.filter(
      (a) => a.status === 'open' || a.status === 'in-progress'
    ).length,
    relationshipCount: store.relationships.length,
    reviewQueue: store.reviews.filter(
      (r) => r.status === 'pending' || r.status === 'in-progress'
    ).length,
    historicalEntries: store.historicalArchive.length,
  };
}

export { searchConstitutionArticles };
