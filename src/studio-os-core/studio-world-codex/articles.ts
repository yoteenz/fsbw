/**
 * @deprecated Use articles/registry or engine — runtime articles live in the Codex store.
 * Bootstrap seed only: see bootstrap/seeds.ts
 */
export {
  getCodexArticle,
  listCodexArticles,
  listCodexArticlesByStatus,
  listCodexArticlesByTag,
  listCodexArticlesByVolume,
} from './articles/registry';

export { getCodexBootstrapArticles as CODEX_BOOTSTRAP_ARTICLES_FN } from './bootstrap/seeds';

import { getCodexBootstrapArticles } from './bootstrap/seeds';

/** @deprecated Use getCodexArticle('ARTICLE-C01') or listCodexArticles() */
export function getCodexFirstPrincipleArticle() {
  return getCodexBootstrapArticles()[0];
}
